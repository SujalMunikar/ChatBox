import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axiosConfig";
import toast from "react-hot-toast";

export const getUsers = createAsyncThunk("getUsers", async () => {
  try {
    const res = await api.get("http://localhost:8000/user/");
    if (res.status === 200) {
      // toast.success("Data fetch success");
      return res?.data;
    }
  } catch (error: unknown) {
    console.log(error);
  }
});

export const updateUser = createAsyncThunk("updateUser", async (data: any) => {
  try {
    const res = await api.put("http://localhost:8000/user/update", data);
    if (res.status === 200) {
      if (data?.onSuccess) {
        data.onSuccess();
      }
      toast.success("Data updated successfully");
      return res?.data;
    }
  } catch (error: unknown) {
    console.log(error);
  }
});
