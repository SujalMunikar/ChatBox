// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { useLayoutEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import Button, {
//   ButtonPrimaryGradient,
// } from "../../components/UI/Button/Button";
// import useAuth from "../../hooks/useAuth";
// import AuthLayout from "../../Layouts/AuthLayout";
// import TextInput from "../../components/UI/Inputs/TextInputs";
// import { useAppDispatch } from "../../store";
// import { logout } from "../../features/auth/authAction";

// function VerifyOtp() {
//   const [params, setParams] = useSearchParams();
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const { authState } = useAuth();
//   const [otp, setOtp] = useState<string>("");

//   useLayoutEffect(() => {}, []);
//   return (
//     <AuthLayout>
//       <div className="w-full px-6">
//         <h2 className="font-sm mb-5">
//           Verify OTP for {authState?.user?.email}
//         </h2>
//         <TextInput
//           label="OTP"
//           value={otp}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//             setOtp(e.target.value);
//           }}
//         />
//         <div className="mb-4"></div>
//         <ButtonPrimaryGradient
//           text="Verify OTP"
//           fullWidth
//           onClick={() => {
//             if (otp?.length === 6) {
//               navigate(
//                 `/verify?id=${authState.user.id}&email=${authState.user.email}&otp=${otp}`
//               );
//             }
//           }}
//         />
//         <div className="flex flex-col gap-4 mt-4">
//           <Button
//             text="Login with Another Account"
//             fullWidth
//             onClick={() => {
//               // resend otp
//               dispatch(logout());
//             }}
//           />
//           <Button
//             text="Register"
//             fullWidth
//             onClick={() => {
//               navigate("/register");
//             }}
//           />
//         </div>
//       </div>
//     </AuthLayout>
//   );
// }

// export default VerifyOtp;

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useLayoutEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button, {
  ButtonPrimaryGradient,
} from "../../components/UI/Button/Button";
import useAuth from "../../hooks/useAuth";
import AuthLayout from "../../Layouts/AuthLayout";
import TextInput from "../../components/UI/Inputs/TextInputs";
import { useAppDispatch } from "../../store";
import { logout } from "../../features/auth/authAction";

// Renders the manual OTP entry screen for cases where the user copies the code instead of clicking the email link.
function VerifyOtp() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { authState } = useAuth();
  const [otp, setOtp] = useState<string>("");

  useLayoutEffect(() => {}, []);
  return (
    <AuthLayout>
      <div className="w-full px-6">
        <h2 className="font-sm mb-5">
          Verify OTP for {authState?.user?.email}
        </h2>
        <TextInput
          label="OTP"
          value={otp}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setOtp(e.target.value);
          }}
        />
        <div className="mb-4"></div>
        <ButtonPrimaryGradient
          text="Verify OTP"
          fullWidth
          onClick={() => {
            if (otp?.length === 6) {
              // Redirect into the same auto-verification route used by the email link.
              navigate(
                `/verify?id=${authState.user.id}&email=${authState.user.email}&otp=${otp}`
              );
            }
          }}
        />
        <div className="flex flex-col gap-4 mt-4">
          <Button
            text="Login with Another Account"
            fullWidth
            onClick={() => {
              // Equivalent to "use a different email"; logs the current user out then takes them back.
              dispatch(logout());
            }}
          />
          <Button
            text="Register"
            fullWidth
            onClick={() => {
              navigate("/register");
            }}
          />
        </div>
      </div>
    </AuthLayout>
  );
}

export default VerifyOtp;