import LoginComp from "../components/auth/LoginComp";
import AuthLayout from "../Layouts/AuthLayout";

// Wraps the login form with auth-specific chrome (logo, background, etc.).
function Login() {
  return (
    <AuthLayout>
      <LoginComp />
    </AuthLayout>
  );
}

export default Login;
