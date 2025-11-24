// Shared user shape reused across slices, hooks, and components.
export interface UserType {
  id: string;
  email: string;
  verified: boolean;
  name: string;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
  isOnline?: boolean;
  lastSeen?: string | null;
  otp?: string;
}
