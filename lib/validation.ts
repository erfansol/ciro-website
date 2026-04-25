import { z } from "zod";

const honeypot = z
  .string()
  .max(0, { message: "spam" })
  .optional()
  .or(z.literal(""));

export const waitlistSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }).max(254),
  referral: z.string().max(120).optional().or(z.literal("")),
  source: z.string().max(40).optional().or(z.literal("")),
  website: honeypot,
});

export const partnershipSchema = z.object({
  name: z.string().min(2, { message: "Tell us your name" }).max(80),
  email: z.string().email({ message: "Enter a valid email address" }).max(254),
  role: z.enum(["investor", "partner", "creator", "other"]),
  message: z.string().max(1000).optional().or(z.literal("")),
  website: honeypot,
});

export const notifySchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }).max(254),
  citySlug: z.string().min(1).max(40),
  website: honeypot,
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type PartnershipInput = z.infer<typeof partnershipSchema>;
export type NotifyInput = z.infer<typeof notifySchema>;
