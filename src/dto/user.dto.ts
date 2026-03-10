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
}

export interface LoginResponseDto {
  token: string;
  user: UserResponseDto;
}


// Request Admin DTOs


export interface LoginAdminDto {
  email: string;
  password: string;
  private: string
}