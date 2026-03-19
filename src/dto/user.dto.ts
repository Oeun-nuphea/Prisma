// ─── Request DTOs ────────────────────────────────────────────────────────────

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UpdateAvatarDto {
  avatarUrl: string;    // path stored in DB e.g. /avatars/filename.jpg
  avatarFileId: string; // ImageKit fileId for deletion
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponseDto {
  accessToken: string;
  user: UserResponseDto;
}

export interface UserResponseWithStatusDto {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
}

export interface UserDeviceResponseDto {
  id: number;
  userId: number;
  broswer: string;
  os: string;
  ip: string;
  isDeleted: boolean;
  createdAt: Date;
}