// ─── Request DTOs ────────────────────────────────────────────────────────────

export interface CreateNoteDto {
  title: string;
  body: string;
  isFavorite: boolean;
}

export interface UpdateNoteDto {
  title?: string;
  body?: string;
  isFavorite?: boolean;
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface NoteResponseDto {
  id: number;
  title: string;
  body: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}
