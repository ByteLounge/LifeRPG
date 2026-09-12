import { z } from "zod";

export const CreateQuestSchema = z.object({
  title: z
    .string()
    .min(1, "Quest title cannot be empty.")
    .max(120, "Quest title cannot exceed 120 characters."),
  description: z.string().max(500, "Description cannot exceed 500 characters.").optional(),
  category: z.string().min(1).max(50).default("General"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EPIC"]).default("MEDIUM"),
  attributeType: z
    .enum(["STRENGTH", "INTELLECT", "DISCIPLINE", "CREATIVITY", "VITALITY", "SOCIAL"])
    .default("DISCIPLINE"),
  estimatedMinutes: z.coerce.number().int().min(1).max(720).default(30),
  repeatType: z.enum(["NONE", "DAILY", "WEEKLY"]).default("NONE"),
  dueDate: z.string().datetime().optional().nullable(),
});

export const UpdateQuestSchema = CreateQuestSchema.partial().extend({
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
});

export const CompleteQuestSchema = z.object({
  questId: z.string().min(1, "Quest ID is required."),
  idempotencyKey: z.string().optional(),
});
