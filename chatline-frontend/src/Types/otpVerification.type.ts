// DTO used when submitting an OTP back to the auth API.
export interface otpVerificationType {
  id: string;
  email: string;
  otp: string;
}
