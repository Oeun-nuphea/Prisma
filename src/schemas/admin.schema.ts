import { z } from "zod";

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const LoginAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  privateKey: z.string().min(1, "Private key is required"),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type LoginAdminInput = z.infer<typeof LoginAdminSchema>;
