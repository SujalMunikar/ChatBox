import Button, { ButtonPrimaryGradient } from "../UI/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  logout,
  register as registerApi,
} from "../../features/auth/authAction";
import { AppDispatch, RootState } from "../../store";
import AuthWrapper from "./AuthWrapper";
import { Link, useNavigate } from "react-router-dom";
import TextInput, { PasswordInput } from "../UI/Inputs/TextInputs";
import { set, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import React, { useEffect } from "react";
import { resetAuthFulfilledState } from "../../features/auth/authSlice";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterComp: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authSlice = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required").min(2, "Name is too short"),
    email: Yup.string()
      .required("Email is required")
      .email("Email is invalid")
      .min(6, "Email must be at least 6 characters"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("password"), ""], "Passwords must match"),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  useEffect(() => {
    setValue("name", "Test ACC");
    setValue("email", "test3@gmail.com");
    setValue("password", "12345678");
    setValue("confirmPassword", "12345678");
    return () => {};
  }, [setValue]);

  useEffect(() => {
    if (authSlice.success && !authSlice.loading) {
      reset();
      navigate("/login");
    }
    return () => {
      dispatch(resetAuthFulfilledState());
    };
  }, [authSlice.loading, authSlice.success, dispatch, navigate, reset]);

  const onSubmit = async (data: FormData) => {
    console.log("Form data:", data);
    // alert("Form data: " + JSON.stringify(data));
    dispatch(
      registerApi({
        email: data.email,
        password: data.password,
        name: data.name,
      })
    );
  };
  const onSubmitError = (error: Record<string, unknown>) => {
    console.log("Form error:", error);
  };

  return (
    <AuthWrapper>
      <h1 className="text-xl leading-8">Register</h1>
      <p className="text-sm">
        Already have an account?{" "}
        <Link to="/login" className="underline">
          Login
        </Link>
      </p>

      <form
        onSubmit={handleSubmit(onSubmit, onSubmitError)}
        className="flex flex-col gap-2 py-5"
      >
        <TextInput
          placeholder="Name"
          label="Name"
          name="name"
          register={register("name")}
          error={errors.name?.message}
        />
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
          name="password"
          register={register("password")}
          error={errors.password?.message}
        />
        <PasswordInput
          placeholder="Confirm Password"
          label="Confirm Password"
          name="confirmPassword"
          register={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <ButtonPrimaryGradient type="submit" text="Register" />
      </form>
    </AuthWrapper>
  );
};

export default RegisterComp;
