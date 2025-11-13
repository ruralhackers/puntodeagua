import { idSchema } from '@pda/common/domain'
import { z } from 'zod'
import { ProviderType } from '../value-objects/provider-type'

export const providerSchema = z.object({
  id: idSchema,
  companyName: z.string().min(1, 'Company name is required'),
  taxId: z.string().optional(),

  // Contact information
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  contactEmail: z.string().email().optional().or(z.literal('')),
  secondaryPhone: z.string().optional(),
  billingEmail: z.string().email().optional().or(z.literal('')),

  // Address
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  province: z.string().optional(),

  // Provider type (in English)
  providerType: z.enum(ProviderType.values() as [string, ...string[]]),

  // Operational details
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
  businessHours: z.string().optional(),
  emergencyAvailable: z.boolean().default(false),
  emergencyPhone: z.string().optional(),

  // Administrative/Financial
  bankAccount: z.string().optional(),
  paymentTerms: z.string().optional(),
  website: z.string().optional(),

  // Relations
  communityId: idSchema.optional()
})

export type ProviderDto = z.infer<typeof providerSchema>

export const providerUpdateSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  taxId: z.string().optional(),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  contactEmail: z.string().email().optional().or(z.literal('')),
  secondaryPhone: z.string().optional(),
  billingEmail: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  province: z.string().optional(),
  providerType: z.enum(ProviderType.values() as [string, ...string[]]),
  isActive: z.boolean(),
  notes: z.string().optional(),
  businessHours: z.string().optional(),
  emergencyAvailable: z.boolean(),
  emergencyPhone: z.string().optional(),
  bankAccount: z.string().optional(),
  paymentTerms: z.string().optional(),
  website: z.string().optional(),
  communityId: idSchema.optional()
})

export type ProviderUpdateDto = z.infer<typeof providerUpdateSchema>
