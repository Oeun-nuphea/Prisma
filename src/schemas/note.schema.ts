import { z } from "zod";

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const CreateNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
});

export const UpdateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().optional(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
