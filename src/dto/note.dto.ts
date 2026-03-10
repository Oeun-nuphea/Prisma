// ─── Request DTOs ────────────────────────────────────────────────────────────

export interface CreateNoteDto {
  title: string;
  body: string;
}

export interface UpdateNoteDto {
  title?: string;
  body?: string;
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface NoteResponseDto {
  id: number;
  title: string;
  body: string;
}
