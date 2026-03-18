import { User, Note, Admin } from "@prisma/client";
import {
  UserResponseDto,
  LoginResponseDto,
  UserResponseWithStatusDto,
} from "../dto/user.dto";
import { AdminResponseDto, LoginAdminResponseDto } from "../dto/admin.dto";
import { NoteResponseDto, Block } from "../dto/note.dto";

// ─── User Mappers ─────────────────────────────────────────────────────────────

/**
 * Strips sensitive fields (password, isDeleted, timestamps) from a User record.
 */
export const toUserResponse = (user: User): UserResponseDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl
    ? `${process.env.IMAGEKIT_URL_ENDPOINT}${user.avatarUrl}`
    : null,
  isActive: user.isActive,
  isDeleted: user.isDeleted,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * Wraps a token + user into the login response shape.
 */
export const toLoginResponse = (
  user: User,
  accessToken: string,
): LoginResponseDto => ({
  accessToken,
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
  avatarUrl: user.avatarUrl
    ? `${process.env.IMAGEKIT_URL_ENDPOINT}${user.avatarUrl}`
    : null,
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
  accessToken: string,
): LoginAdminResponseDto => ({
  accessToken,
  admin: toAdminResponse(admin),
});

// ─── Note Mappers ─────────────────────────────────────────────────────────────

export const toNoteResponse = (note: Note): NoteResponseDto => {
  // 👇 body might be a string "[]" from old records — parse it safely
  let rawBody = note.body;
  if (typeof rawBody === "string") {
    try {
      rawBody = JSON.parse(rawBody);
    } catch {
      rawBody = [];
    }
  }

  const body = (Array.isArray(rawBody) ? rawBody as unknown as Block[] : []).map((block) => {
    if (block.type === "image" && block.filePath) {
      return {
        ...block,
        url: `${process.env.IMAGEKIT_URL_ENDPOINT}${block.filePath}`,
      };
    }
    return block;
  });

  return {
    id: note.id,
    title: note.title,
    body,
    isFavorite: note.isFavorite,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
};

export const toNoteListResponse = (notes: Note[]): NoteResponseDto[] =>
  notes.map(toNoteResponse);

