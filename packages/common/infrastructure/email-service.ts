import { createTransport } from 'nodemailer'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

interface ResetPasswordEmailParams {
  to: string
  resetLink: string
  userName?: string
}

/**
 * Creates a nodemailer transporter using environment variables
 */
function createTransporter() {
  const emailServer = process.env.EMAIL_SERVER
  if (!emailServer) {
    throw new Error('EMAIL_SERVER environment variable is not set')
  }

  return createTransport(emailServer)
}

/**
 * Sends an email using nodemailer
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const transporter = createTransporter()
  const from = process.env.EMAIL_FROM

  if (!from) {
    throw new Error('EMAIL_FROM environment variable is not set')
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    html
  })
}

/**
 * Sends a password reset email with the reset link
 */
export async function sendResetPasswordEmail({
  to,
  resetLink,
  userName
}: ResetPasswordEmailParams): Promise<void> {
  const subject = 'Recupera tu contraseña'
  const greeting = userName ? `Hola ${userName}` : 'Hola'

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recupera tu contraseña</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 30px;">
                  <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #333333;">Recupera tu contraseña</h1>
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #666666;">
                    ${greeting},
                  </p>
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #666666;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña:
                  </p>
                  <table role="presentation" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          Restablecer Contraseña
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #666666;">
                    Este enlace expirará en 1 hora por seguridad.
                  </p>
                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #666666;">
                    Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.
                  </p>
                  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
                  <p style="margin: 0; font-size: 12px; color: #999999;">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                    <a href="${resetLink}" style="color: #3b82f6; word-break: break-all;">${resetLink}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  await sendEmail({ to, subject, html })
}
