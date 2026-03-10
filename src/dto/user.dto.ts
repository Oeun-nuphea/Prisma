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

// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
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
  isActive: boolean;
}