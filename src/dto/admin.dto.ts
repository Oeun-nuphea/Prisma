// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface LoginAdminDto {
  email: string;
  password: string;
  privateKey: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface AdminResponseDto {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginAdminResponseDto {
  accessToken: string;
  admin: AdminResponseDto;
}
