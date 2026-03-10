import { User, Note, Admin } from "@prisma/client";
import {
  UserResponseDto,
  LoginResponseDto,
  UserResponseWithStatusDto,
} from "../dto/user.dto";
import { AdminResponseDto, LoginAdminResponseDto } from "../dto/admin.dto";
import { NoteResponseDto } from "../dto/note.dto";

// ─── User Mappers ─────────────────────────────────────────────────────────────

/**
 * Strips sensitive fields (password, isDeleted, timestamps) from a User record.
 */
export const toUserResponse = (user: User): UserResponseDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
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

/**
 * Includes isActive status — used for admin activate/deactivate responses.
 */
export const toUserResponseWithStatus = (
  user: User,
): UserResponseWithStatusDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  isActive: user.isActive,
});

/**
 * Maps an Admin record to the admin response shape.
 */
export const toAdminResponse = (admin: Admin): AdminResponseDto => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
});

/**
 * Wraps a token + admin into the admin login response shape.
 */
export const toAdminLoginResponse = (
  admin: Admin,
  token: string,
): LoginAdminResponseDto => ({
  token,
  admin: toAdminResponse(admin),
});

// ─── Note Mappers ─────────────────────────────────────────────────────────────

/**
 * Strips internal fields (userId, isDeleted, timestamps) from a Note record.
 */
export const toNoteResponse = (note: Note): NoteResponseDto => ({
  id: note.id,
  title: note.title,
  body: note.body,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});

export const toNoteListResponse = (notes: Note[]): NoteResponseDto[] =>
  notes.map(toNoteResponse);
