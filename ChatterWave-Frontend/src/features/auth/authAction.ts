import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axiosConfig";
import toast from "react-hot-toast";

// Async thunks for authentication lifecycle events (login, register, verify, etc.).

interface LoginDetailsType {
  email: string;
  password: string;
}
interface VerificationDetailsType {
  email: string;
  id: string;
  otp: string;
}

interface RegisterDetailsType {
  name: string;
  email: string;
  password: string;
}

export const login = createAsyncThunk(
  "login",
  async (data: LoginDetailsType) => {
    const { email, password } = data;
    try {
      // const res = await api.post("http://localhost:8000/auth/login", {
      //   email,
      //   password,
      // });
      const res = await api.post("/auth/login", { email, password });
      if (res.status === 200) {
        if (!res?.data?.data?.verified) {
          toast(
            "OTP has been sent to your email.\n\n Please enter the OTP or click the link in the email to proceed."
          );
        } else {
          toast.success("Logged in");
        }
        return res?.data;
      } else {
        toast.error("Invalid Credentials");
      }
    } catch (error: any) {
      console.log("Login Failed", error);
      toast.error(error?.response?.data?.message);
    }
  }
);

export const register = createAsyncThunk(
  "register",
  async (data: RegisterDetailsType) => {
    const { name, email, password } = data;
    try {
      // const res = await api.post("http://localhost:8000/auth/register", {
      //   email,
      //   password,
      //   name,
      // });
      const res = await api.post("/auth/register", { email, password, name });
      console.log(res);
      if (res.status === 201) {
        toast.success("Account Created");
        // if (!res?.data?.data?.verified) {
        //   toast("Account Created");
        // }
        console.log(res?.data);
        return res?.data;
      }
    } catch (error: unknown) {
      console.log(error);
      // @ts-expect-error Toast expects a string but backend error shape is dynamic; runtime guards protect usage.
      toast.error(error?.response?.data?.message);
    }
  }
);

export const logout = createAsyncThunk("logout", async () => {
  try {
    // const res = await api.get("http://localhost:8000/auth/logout");
    const res = await api.get("/auth/logout");
    return res?.data;
  } catch (error: unknown) {
    console.log(error);
  }
});

export const getme = createAsyncThunk("getme", async () => {
  try {
    // const res = await api.get("http://localhost:8000/auth/getme");
    const res = await api.get("/auth/getme");
    if (res.status === 200) {
      return res?.data;
    }
  } catch (error: unknown) {
    console.log(error);
  }
});

export const verifyEmail = createAsyncThunk(
  "verifyEmail",
  async (data: VerificationDetailsType) => {
    const { email, id, otp } = data;
    try {
      // const res = await api.get(
      //   `http://localhost:8000/auth/verify-email?id=${id}&email=${email}&otp=${otp}`
      // );
      const res = await api.get(`/auth/verify-email?id=${id}&email=${email}&otp=${otp}`);
      return res?.data;
    } catch (error: unknown) {
      console.log(error);
    }
  }
);

export const updatePassword = createAsyncThunk(
  "updatePassword",
  async (data: any) => {
    try {
      // const res = await api.post("http://localhost:8000/auth/reset-password", {
      //   oldPassword: data.oldPassword,
      //   newPassword: data.newPassword,
      // });
      const res = await api.post("/auth/reset-password", { oldPassword: data.oldPassword, newPassword: data.newPassword });
      if (res.status === 200) {
        if (data?.onSuccess) {
          data.onSuccess();
        }
        toast.success("Password updated successfully");
        return res?.data;
      } else {
        toast.error("Password update failed");
      }
    } catch (error: unknown) {
      console.log(error);
      toast.error("Password update failed");
    }
  }
);
