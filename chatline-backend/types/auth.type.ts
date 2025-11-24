// DTOs describing payload shapes used throughout the auth layer.
export interface Register {
  name: string;
  email: string;
  password: string;
}

// Minimal subset of the Prisma user record stored inside JWTs and middleware context.
export interface User {
  name: string;
  email: string;
  id: string;
}

// Query params accepted by the email verification endpoint.
export interface VerifyUser {
  id?: string;
  email?: string;
  otp?: string;
}
