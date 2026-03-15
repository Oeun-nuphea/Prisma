import { z } from "zod";

// ─── Block Schema ─────────────────────────────────────────────────────────────

const BlockSchema = z.object({
  id: z.string(),
  type: z.enum(["paragraph", "heading1", "heading2", "bullet", "todo", "code", "image"]),
  content: z.string().optional(),
  checked: z.boolean().optional(),   // todo only
  filePath: z.string().optional(),   // image only
  fileId: z.string().optional(),     // image only
  url: z.string().optional(),        // image only
  caption: z.string().optional(),    // image only
});

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const CreateNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.array(BlockSchema).optional().default([]),  // 👈 Block[] not string
  isFavorite: z.boolean().optional().default(false),
});

export const UpdateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.array(BlockSchema).optional(),              // 👈 Block[] not string
  isFavorite: z.boolean().optional(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type BlockInput = z.infer<typeof BlockSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;