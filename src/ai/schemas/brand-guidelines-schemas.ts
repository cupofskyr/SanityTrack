
import { z } from 'zod';

export const BrandGuidelinesDataSchema = z.object({
  brandName: z.string().min(1, "Brand name is required."),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color."),
  brandVoice: z.string().min(1, "Brand voice is required."),
  forbiddenWords: z.string(), // comma-separated string
  address: z.string().optional(),
  socials: z.object({
    facebookConnected: z.boolean().default(false),
    instagramConnected: z.boolean().default(false),
  }).optional(),
});

export type BrandGuidelinesData = z.infer<typeof BrandGuidelinesDataSchema>;
