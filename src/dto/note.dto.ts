// ─── Block Types ─────────────────────────────────────────────────────────────

export type BlockType = "paragraph" | "heading1" | "heading2" | "bullet" | "todo" | "code" | "image";

export interface Block {
  id: string;
  type: BlockType;
  content?: string;   // 👈 optional — image blocks have no text content
  checked?: boolean;  // todo only
  filePath?: string;  // image only — stored in DB e.g. /notes/photo.jpg
  fileId?: string;    // image only — for ImageKit deletion
  url?: string;       // image only — reconstructed in mapper, not stored in DB
  caption?: string;   // image only — optional caption
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