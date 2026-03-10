import { User, Note } from "@prisma/client";
import { UserResponseDto, LoginResponseDto } from "../dto/user.dto";
import { NoteResponseDto } from "../dto/note.dto";

// ─── User Mappers ─────────────────────────────────────────────────────────────

/**
 * Strips sensitive fields (password, isDeleted, timestamps) from a User record.
 */
export const toUserResponse = (user: User): UserResponseDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

/**
 * Wraps a token + user into the login response shape.
 */
export const toLoginResponse = (
  user: User,
  token: string,
): LoginResponseDto => ({
  token,
  user: toUserResponse(user),
});

// ─── Note Mappers ─────────────────────────────────────────────────────────────

/**
 * Strips internal fields (userId, isDeleted, timestamps) from a Note record.
 */
export const toNoteResponse = (note: Note): NoteResponseDto => ({
  id: note.id,
  title: note.title,
  body: note.body,
});

export const toNoteListResponse = (notes: Note[]): NoteResponseDto[] =>
  notes.map(toNoteResponse);
