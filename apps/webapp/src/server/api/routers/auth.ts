import { generateResetToken, getResetTokenExpiry, saltAndHashPassword } from '@pda/common/domain'
import { sendResetPasswordEmail } from '@pda/common/infrastructure'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

export const authRouter = createTRPCRouter({
  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email({ message: 'Email inválido' })
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { email } = input

        // Check if user exists
        const user = await ctx.db.user.findUnique({
          where: { email }
        })

        // Always return success to avoid user enumeration
        // But only send email if user exists
        if (user) {
          // Generate reset token
          const token = generateResetToken()
          const expires = getResetTokenExpiry()

          // Delete any existing tokens for this user
          await ctx.db.verificationToken.deleteMany({
            where: { identifier: email }
          })

          // Create new verification token
          await ctx.db.verificationToken.create({
            data: {
              identifier: email,
              token,
              expires
            }
          })

          // Build reset link
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
          const resetLink = `${baseUrl}/reset-password?token=${token}`

          // Send email
          await sendResetPasswordEmail({
            to: email,
            resetLink,
            userName: user.name || undefined
          })
        }

        // Always return success to prevent user enumeration
        return {
          success: true,
          message: 'Si existe una cuenta con ese correo, recibirás un enlace de recuperación.'
        }
      } catch (error) {
        console.error('Error in forgotPassword:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ocurrió un error. Por favor intenta de nuevo.'
        })
      }
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, { message: 'Token es requerido' }),
        password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { token, password } = input

      // Find the verification token
      const verificationToken = await ctx.db.verificationToken.findUnique({
        where: { token }
      })

      if (!verificationToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Token inválido o expirado'
        })
      }

      // Check if token has expired
      if (verificationToken.expires < new Date()) {
        // Delete expired token
        await ctx.db.verificationToken.delete({
          where: { token }
        })

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Token expirado. Por favor solicita un nuevo enlace de recuperación.'
        })
      }

      // Get user by email (identifier)
      const user = await ctx.db.user.findUnique({
        where: { email: verificationToken.identifier }
      })

      if (!user) {
        // Delete token if user doesn't exist
        await ctx.db.verificationToken.delete({
          where: { token }
        })

        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuario no encontrado'
        })
      }

      // Hash the new password
      const passwordHash = await saltAndHashPassword(password)

      // Update user password
      await ctx.db.user.update({
        where: { id: user.id },
        data: { passwordHash }
      })

      // Delete the used token
      await ctx.db.verificationToken.delete({
        where: { token }
      })

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      }
    })
})
