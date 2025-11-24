import RegisterComp from "../components/auth/RegisterComp";
import AuthLayout from "../Layouts/AuthLayout";

// Mirrors the login page structure but renders the registration form instead.
export default function Register() {
  return (
    <AuthLayout>
      <RegisterComp />
    </AuthLayout>
  );
}
