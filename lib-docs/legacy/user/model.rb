class User < ApplicationRecord
  include NsfwModeratable

  pay_customer default_payment_processor: :stripe

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable,
         :trackable, :lockable

  validate :disposable_email_check

  has_many :search_queries

  has_many :prompts
  has_many :image_prompts
  has_many :video_prompts
  has_many :text_prompts
  has_many :video_or_image_prompt


  has_many :comments

  has_many :resources

  has_many :favorites
  has_many :favs, through: :favorites, source: :prompt

  has_many :followed_users, foreign_key: :follower_id, class_name: 'Follow'
  has_many :followees, through: :followed_users
  has_many :following_users, foreign_key: :followee_id, class_name: 'Follow'
  has_many :followers, through: :following_users

  has_many :tool_results

  MAX_REFERRAL_INVITATIONS_PER_USER = 5
  has_many :referral_invitations
  # belongs_to :referral_invitation

  has_many :assets, class_name: 'Assets::Asset', dependent: :destroy

  NEW_USER_INITIAL_CREDITS = 4
  after_create :set_initial_credits

  validates :credits, numericality: { greater_than_or_equal_to: 0 }
  before_save :check_credits

  validates :username, uniqueness: true, length: {minimum: 3, maximum: 15}, allow_blank: true
  validates_format_of :username, with: /\A[A-Za-z0-9_]+\z/i, message: "can only contain alphanumeric characters (letters A-Z, numbers 0-9) with the exception of underscores", allow_blank: true
  before_validation :verify_username_is_not_reserved
  before_validation :verify_username_does_not_contain_reserved_words

  scope :confirmed, ->{ where("confirmed_at is not null") }
  scope :unconfirmed, ->{ where("confirmed_at is null") }

  scope :admin, ->{ where("admin is true") }
  scope :moderator, ->{ where("moderator is true") }

  scope :interested_in_competitions, ->{ where("registered_interest_in_competitions_at is not null") }
  scope :signed_up_because_interested_in_competitions, ->{ where("registered_interest_in_competitions_at is not null AND created_at BETWEEN (registered_interest_in_competitions_at - INTERVAL '1 minute') AND (registered_interest_in_competitions_at + INTERVAL '1 minute')") }

  scope :sfw, ->{ where("nsfw is null or nsfw is not true") }
  scope :nsfw, ->{ where(nsfw: true) }

  scope :featured, -> { where(id: joins(:prompts).where(prompts: { featured: true }).select(:id)) }

  MAX_VERIFIED_INACTIVITY_DAYS = 90
  scope :verified, ->{ where("verified is true") }

  # Scope to retrieve users who are verified but inactive.
  # It accepts an optional boolean parameter 'soon':
  # - If 'soon' is true, it returns users who are on the verge of becoming inactive,
  #   including their username and the date of their last prompt.
  # - If 'soon' is false or not provided, it returns users who are already inactive
  #   based on MAX_VERIFIED_INACTIVITY_DAYS.
  scope :inactive_verified, -> (soon = false) {
    query = verified.left_outer_joins(:prompts)
                    .where(admin: [false, nil])
                    .group(:id)

    if soon
      query = query.select('users.*, MAX(prompts.created_at) AS last_prompt_created_at')
                   .order('last_prompt_created_at ASC')
    else
      query = query.order('MAX(prompts.created_at) ASC')
                   .having('MAX(prompts.created_at) IS NULL OR MAX(prompts.created_at) < ?', MAX_VERIFIED_INACTIVITY_DAYS.days.ago)
    end

    query
  }

  scope :pro, -> do
    joins(:subscriptions)
      .where(pay_subscriptions: { name: ["pro", "PromptHero Pro","PromptHero PRO","PromptHero Starter", "PromptHero Academy"],
                                  status: "active",
                                  ends_at: [nil, Time.current..] })
      .distinct
  end

  scope :subscribed_to_academy, -> do
    joins(:subscriptions)
      .where(pay_subscriptions: { name: ["PromptHero Academy"],
                                  status: "active",
                                  ends_at: [nil, Time.current..] })
      .distinct
  end

  scope :with_streak, -> { where("streak_days > 0") }
  scope :with_potentially_expired_streak, -> { where("streak_days > 0 and streak_end < ?", 1.day.ago.beginning_of_day) }

  scope :banned, -> { where(banned: true) }

  scope :subscribed_to_job_alerts_newsletter, -> { where.not(subscribed_to_job_alerts_newsletter_at: nil) }
  scope :signed_up_because_job_alerts_newsletter, ->{ where("subscribed_to_job_alerts_newsletter_at is not null AND created_at BETWEEN (subscribed_to_job_alerts_newsletter_at - INTERVAL '1 minute') AND (subscribed_to_job_alerts_newsletter_at + INTERVAL '1 minute')") }

  after_create :set_username_if_not_provided

  has_one_attached :avatar do |attachable|
    attachable.variant :small, resize_to_fill: [64, 64], format: :webp, saver: { subsample_mode: "on", strip: true, interlace: true, quality: 30 }

    attachable.variant :medium, resize_to_fill: [170, 170], format: :webp, saver: { subsample_mode: "on", strip: true, interlace: true, quality: 60 }
  end

  scope :has_attached_avatar, -> { joins(:avatar_attachment) }
  scope :does_not_have_attached_avatar, -> { where.missing(:avatar_attachment) }

  before_save :update_avatar_updated_at, if: :avatar_changed?

  after_save :set_avatar_filename

  has_many :notifications, as: :recipient, dependent: :destroy

  # https://stackoverflow.com/a/7255155/2565681
  def active_for_authentication?
    super && !self.banned
  end

  def inactive_message
    self.banned ? "You have been permanently banned." : super
  end

  def get_default_username
    return (Digest::SHA2.hexdigest self.id).first(11)
  end

  def register_interest_in_competitions
    self.registered_interest_in_competitions_at = self.registered_interest_in_competitions_at || Time.now
    self.save
  end

  def self.to_csv
    attributes = %w{admin email username confirmed_at login_count last_login prompt_count fav_count search_count}

    CSV.generate(headers: true) do |csv|
      csv << attributes

      all.each do |user|
        csv << attributes.map do |attr|
          case attr
          when "country"
            IpGeolocationService.get_country_code(user.current_sign_in_ip)
          when "login_count"
            user.sign_in_count
          when "last_login"
            user.current_sign_in_at
          else
            user.send(attr)
          end
        end
      end
    end
  end

  def generated_prompts
    Prompt.where(source: "ugc-prompt-builder-replicate").where(user_id: self.id)
  end

  def drafts
    Prompt.where(draft: true)
  end

  def ban!(moderator_user_object: nil, action_triggered_from_ip: nil)
    self.update(banned: true)

    self.prompts.discard_all

    ban_email = %{Hello,

      Your PromptHero account has been permanently terminated and all your uploaded and/or generated content has been deleted.

      We have detected recent activity in your account that goes against our terms of service. You are banned from all our platforms and will be banned again if you try signing up using a different account.

      This decision is final and cannot be appealed.

      - PromptHero
    }

    GenericMailer.generic_email(
      "PromptHero <accounts@prompthero.com>",
      self.email,
      "Your PromptHero account has been permanently terminated.",
      ban_email
    ).deliver_later

    ModerationActivity.create(user: moderator_user_object, key: "user.banned", recipient: self, metadata: { username: self.username, prompt_count: self.prompt_count, profile_view_count: self.profile_view_count }, ip: action_triggered_from_ip )
  end

  def moderator?
    self.moderator || self.admin
  end

  def supporter?
    self.payment_processor.subscribed?(name: "PromptHero Supporter")
  end

  def pro?
    self.subscriptions.where(
      pay_subscriptions: { name: ["pro",'PromptHero PRO',"PromptHero Starter", "PromptHero Pro", "PromptHero Academy"],
      status: "active",
      ends_at: [nil, Time.current..] }).present?
  end

  def academy?
    self.payment_processor.subscribed?(name: "PromptHero Academy")
  end

  def subscribed_to_job_alerts_newsletter?
    self.subscribed_to_job_alerts_newsletter_at.present?
  end

  def subscribed_to_job_alerts_newsletter
    self.subscribed_to_job_alerts_newsletter?
  end

  # Source: ChatGPT + https://stackoverflow.com/a/27534489
  def increment_or_start_new_streak_if_necessary
    yesterday = 1.day.ago.beginning_of_day
    today = Time.current.beginning_of_day
    if self.streak_end && self.streak_end >= yesterday && self.streak_end < today
      # If the user has a previous streak and it ended within the last 24 hours and before the beginning of today, increment the streak_days
      self.update_columns(streak_days: self.streak_days + 1, streak_end: Time.current)
    elsif self.streak_end && self.streak_end >= today && self.streak_end < Time.current.end_of_day
      # If the user has a previous streak and is ending today (has posted recently), do nothing
      puts "User already has an active and current streak. Doing nothing..."
    else
      # If the user doesn't have a previous streak or it ended more than 24 hours ago or after the beginning of today, start a new streak
      self.update_columns(streak_start: Time.current, streak_end: Time.current, streak_days: 1)
    end
  end

  def self.update_streaks
    self.with_potentially_expired_streak.each do |user|

      yesterday = 1.day.ago.beginning_of_day

      if user.streak_end && user.streak_end < yesterday
        # User had an streak but it's been 24h with no updates
        user.update_columns(streak_days: 0)
      end

    end
  end

  def self.prune_verified!
    # Note: query generated by ChatGPT
    @users_to_remove_verified = self.inactive_verified

    @users_to_remove_verified.each do |user|
      remove_verified_email = %{Hello,

        We regret to inform you that your PromptHero account has just been de-verified.

        We strive to make PromptHero a strong and vibrant community, and verified users are our most important community ambassadors.

        We run the verified program to provide the whole community with role models to look up to. AI artists that create astounding works of art others can feel inspired by. As such, we expect our verified members to take an active role in leading the community through creating amazing images, engaging regularly in discussions and keeping the highest standards of quality in the work they do. In short, we expect verified users to be exemplary community members.

        We have detected your account has gone unused for a while, and therefore decided to revoke your verified status.

        We hope to see you engaged back again soon, and hopefully regain your verified status!

        Best,

        - PromptHero
      }

      GenericMailer.generic_email(
        "PromptHero <verified@prompthero.com>",
        user.email,
        "Your PromptHero account has been de-verified.",
        remove_verified_email
      ).deliver_later

      @users_to_remove_verified.update_all(verified: false, moderator: false)

      ModerationActivity.create(user: nil, key: "user.de_verify", recipient: user, metadata: { automatic_action: true } )

    end

  end

  def self.resend_confirmation_email_to_unconfirmed_emails_last_24_h
    @unconfirmed_users_last_24_h = User.where(created_at: 24.hours.ago..Time.now).unconfirmed
    @unconfirmed_users_last_24_h.each do |user|
      delay = user.created_at + 24.hours - Time.now
      CustomDeviseMailer.resend_confirmation_instructions(user).deliver_later(wait: delay)
    end
  end

  def fulfill_credits!(n_credits=NEW_USER_INITIAL_CREDITS)
    self.update_attribute(:credits, self.credits + n_credits)
  end

  def enroll_in_all_academy_courses!
    active_courses_teachable_ids = Course::COURSES.filter{|x| x.dig(:status) == 'live'}.map{|x| x.dig(:teachable_course_id)}

    teachable = Teachable.new
    teachable.create_and_enroll_user_in_courses(self.email, active_courses_teachable_ids)
  end

  def unenroll_from_all_academy_courses!
    active_courses_teachable_ids = Course::COURSES.filter{|x| x.dig(:status) == 'live'}.map{|x| x.dig(:teachable_course_id)}

    teachable = Teachable.new
    teachable.unenroll_user_from_courses(self.email, active_courses_teachable_ids)
  end

  private

  def set_username_if_not_provided
    # TODO: logic if username not provided
    self.update_attribute(:username, self.get_default_username)
  end

  def disposable_email_check
    domain = email.split('@').last
    if DisposableDomain.exists?(name: domain)
      errors.add(:email, "provider is not allowed")
    end
  end

  def verify_username_is_not_reserved
    reserved_usernames = [
      "search", "searches",
      "random",
      "new", "newest",
      "create", "creator", "creating",
      "upload", "uploader", "uploading",
      "best", "top", "hot", "rising", "featured", "feature", "featuring",
      "category", "categories",
      "community", "communities",
      "prompt", "prompts", "prompting",
      "pro", "pros",
      "premium", "upgrade", "plans", "plan", "subscription", "subscriptions",
      "purchase", "purchases", "buy", "buys", "pay", "pays", "payment", "payments", "pricing", "stripe",
      "verified", "verify",
      "auth", "login", "signup",
      "generator", "generators",
      "competition", "competitions", "challenge", "challenges",
      "academy", "course", "courses", "prompting_guide", "prompt_guide", "promptguide",
      "stable_diffusion", "midjourney", "dalle", "dall_e", "stablediffusion",
      "dreambooth", "lora", "finetuning", "model", "models", "textualinversion", "textualinversions",
      "blog", "content",
      "tool", "tools", "tips", "tricks", "resource", "resources", "example", "examples",
      "help", "faq", "helpcenter",
      "customersupport", "support", "techsupport", "supporttechnician", "technician",
      "api",
      "status", "statuses", "statuspage", "uptime", "uptimerobot", "stats", "statistics", "monitoring", "monitoringstatus",
      "email", "emails",
      "user", "users", "customer", "customers",
      "favorite", "favorites", "favs",
      "notification", "notifications",
      "mod", "moderation", "moderator", "moderators", "expert", "experts",
      "text", "gpt", "gpt2", "gpt3", "gpt4", "chatgpt",
      "gif", "video", "videos", "3d",
      "job", "jobs", "engineer", "engineering",
      "company", "companies", "business", "businesses", "enterprise", "enterprises", "corporate",
      "backoffice", "invoice", "invoices",
      "upload", "uploads", "uploaded",
      "ad", "ads", "advert", "adverts", "advertise", "advertising"
    ]

    if reserved_usernames.include? self.username&.downcase
      errors.add(:username, "is a reserved word")
    end
  end

  def verify_username_does_not_contain_reserved_words
    reserved_words = ["prompthero", "admin", "moderator"]

    if self.username&.downcase =~ Regexp.new(reserved_words.join("|"))
      errors.add(:username, "can't contain reserved words")
    end
  end

  def set_initial_credits
    self.update_attribute(:credits, NEW_USER_INITIAL_CREDITS)
  end

  def check_credits
    self.credits = 0 if credits.negative?
  end

  def set_avatar_filename
    avatar.blob.update(filename: "#{(self.username != self.get_default_username) ? self.username + "-" : "user-" }#{self.get_default_username}.#{avatar.filename.extension}") if avatar.attached?
  end

  def update_avatar_updated_at
    self.avatar_updated_at = Time.current
  end

  def avatar_changed?
    attachment_changes.any?
  end

end
