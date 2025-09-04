import { Id } from 'core'
import type { CommunitySchema } from '../schemas/community.schema.ts'

export class Community {
  private constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly planId: Id
  ) {}

  static create(communitySchema: CommunitySchema) {
    return new Community(
      Id.create(communitySchema.id),
      communitySchema.name,
      Id.create(communitySchema.planId)
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      name: this.name,
      planId: this.planId.toString()
    }
  }
}
