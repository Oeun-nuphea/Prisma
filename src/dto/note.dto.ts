// ─── Block Types ─────────────────────────────────────────────────────────────

export type BlockType = "paragraph" | "heading1" | "heading2" | "bullet" | "todo" | "code";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // todo only
}

// ─── Request DTOs ────────────────────────────────────────────────────────────

export interface CreateNoteDto {
  title: string;
  body: Block[];
  isFavorite?: boolean;  // 👈 optional, defaults to false
}

export interface UpdateNoteDto {
  title?: string;
  body?: Block[];        // 👈 Block[] not string
  isFavorite?: boolean;
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface NoteResponseDto {
  id: number;
  title: string;
  body: Block[];         // 👈 Block[] not string
  isFavorite: boolean;
  shareToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}