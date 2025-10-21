/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/UI/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { verifyEmail } from "../../features/auth/authAction";
import LogoAnimation from "../../components/auth/LogoAnimation";

function Verify() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const authSlice = useSelector((state: RootState) => state.auth);
  const data = useMemo(() => {
    return {
      id: params.get("id") as string,
      email: params.get("email") as string,
      otp: params.get("otp") as string,
    };
  }, [params]);

  const callVerification = useCallback(async () => {
    console.log(`Called ${data.id} ${data.email} ${data.otp}`);
    if (data.id && data.email && data.otp) {
      dispatch(verifyEmail(data));
    }
  }, [data, dispatch]);

  useLayoutEffect(() => {
    callVerification();
  }, [callVerification]);

  useEffect(() => {
    const call = async () => {
      if (!authSlice.loading && authSlice.success) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve("ok");
          }, 4000);
        });
        navigate("/login");
      }
    };
    call();
  }, [authSlice.loading, authSlice.success, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-800 gap-5">
      <Link to={"/"}>
        <LogoAnimation size="sm" />
      </Link>
      <div className="flex flex-col items-center justify-center gap-4 shadow-lg p-4 text-white bg-slate-900 rounded-sm w-[400px] max-w-[90%] h-[200px] text-center">
        {authSlice.loading ? "Verifying..." : ""}
        {!authSlice.loading && authSlice.success ? (
          <>
            <div className="text-lg">Verified successfully</div>
            <div>Redirecting to login page...</div>
          </>
        ) : (
          ""
        )}
        {!authSlice.loading && !authSlice.success ? "Verification failed" : ""}
      </div>
    </div>
  );
}

export default Verify;