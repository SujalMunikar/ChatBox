// Handles user login form flow and quick-test account shortcuts.
import Button, { ButtonPrimaryGradient } from "../UI/Button/Button";
import { useDispatch } from "react-redux";
import { login, logout } from "../../features/auth/authAction";
import { AppDispatch } from "../../store";
import AuthWrapper from "./AuthWrapper";
import { Link } from "react-router-dom";
import TextInput, { PasswordInput } from "../UI/Inputs/TextInputs";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import React, { useEffect } from "react";

interface FormData {
  email: string;
  password: string;
}

const LoginComp: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Basic validation to keep input data well-formed before hitting the API.
  const validationSchema = Yup.object({
    email: Yup.string()
      .required("Email is required")
      .email("Email is invalid")
      .min(6, "Email must be at least 6 characters"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  // Reset and seed the form with the default QA password on mount.
  useEffect(() => {
    setValue("email", "");
    setValue("password", "12345678");
  }, [setValue]);
  const onSubmit = async (data: FormData) => {
    console.log("Form data:", data);
    // alert("Form data: " + JSON.stringify(data));
    // Attempt to authenticate with the provided credentials.
    dispatch(login({ email: data.email, password: data.password }));
  };

  return (
    <AuthWrapper>
      <h1 className="text-xl leading-8">Login</h1>
      <p className="text-sm">
        Don't have an account?{" "}
        <Link to="/register" className="underline">
          Sign Up
        </Link>
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 py-5"
      >
        <TextInput
          placeholder="Email"
          label="Email"
          name="email"
          register={register("email")}
          error={errors.email?.message}
        />

        <PasswordInput
          placeholder="Password"
          label="Password"
          register={register("password")}
          error={errors.password?.message}
        />

        <ButtonPrimaryGradient type="submit" text="Login" />
      </form>
      <div className="mt-4 flex flex-wrap gap-3">
        {/* Convenience buttons for quickly impersonating seeded accounts. */}
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          onClick={() => {
            dispatch(login({ email: "test1@gmail.com", password: "12345678" }));
          }}
        >
          
        Test1
        </button>
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          onClick={() => {
            dispatch(login({ email: "test2@gmail.com", password: "12345678" }));
          }}
        >
          Test2
        </button>
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          onClick={() => {
            dispatch(login({ email: "test3@gmail.com", password: "12345678" }));
          }}
        >
          Test3
        </button>
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          onClick={() => {
            dispatch(login({ email: "test4@gmail.com", password: "12345678" }));
          }}
        >
          Test4
        </button>
      </div>
    </AuthWrapper>
  );
};

export default LoginComp;
