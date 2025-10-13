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

  useEffect(() => {
    setValue("email", "");
    setValue("password", "12345678");
  }, [setValue]);
  const onSubmit = async (data: FormData) => {
    console.log("Form data:", data);
    // alert("Form data: " + JSON.stringify(data));
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
      <div>
        <Button
          text="Login Test1"
          onClick={() => {
            dispatch(login({ email: "test1@gmail.com", password: "12345678" }));
          }}
        />
        <Button
          text="Login Test2"
          onClick={() => {
            dispatch(login({ email: "test2@gmail.com", password: "12345678" }));
          }}
        />
        <Button
          text="Login Test3"
          onClick={() => {
            dispatch(login({ email: "test3@gmail.com", password: "12345678" }));
          }}
        />
        <Button
          text="Login Test4"
          onClick={() => {
            dispatch(login({ email: "test4@gmail.com", password: "12345678" }));
          }}
        />
      </div>
    </AuthWrapper>
  );
};

export default LoginComp;
