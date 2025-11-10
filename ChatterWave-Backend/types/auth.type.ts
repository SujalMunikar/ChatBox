// DTOs describing payload shapes used throughout the auth layer.
export interface Register {
  name: string;
  email: string;
  password: string;
}

export interface User {
  name: string;
  email: string;
  id: string;
}

export interface VerifyUser {
  id?: string;
  email?: string;
  otp?: string;
}
