// backend/src/models/User.ts
export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  nombre: string;
  created_at: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  nombre: string;
  created_at: string;
}