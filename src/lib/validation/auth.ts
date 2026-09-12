import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(100, "Password is too long."),
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name cannot exceed 50 characters."),
  characterName: z
    .string()
    .min(2, "Character name must be at least 2 characters.")
    .max(50, "Character name cannot exceed 50 characters.")
    .optional(),
  timezone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const OnboardingSchema = z.object({
  characterName: z.string().min(2).max(50),
  preferredTheme: z.enum(["dark", "light", "arcane", "emerald"]),
  focusAttribute: z.enum(["STRENGTH", "INTELLECT", "DISCIPLINE", "CREATIVITY", "VITALITY", "SOCIAL"]),
});
