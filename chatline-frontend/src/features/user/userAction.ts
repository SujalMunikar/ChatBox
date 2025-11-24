import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axiosConfig";
import toast from "react-hot-toast";

// Thin wrapper thunks for fetching and mutating user profile data.
export const getUsers = createAsyncThunk("getUsers", async () => {
  try {
    // const res = await api.get("http://localhost:8000/user/");
    const res = await api.get("/user/");
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
    // const res = await api.put("http://localhost:8000/user/update", data);
    const res = await api.put("/user/update", data);
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

export const deleteAccount = createAsyncThunk(
  "user/deleteAccount",
  async (
    data: { onSuccess?: () => void } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const res = await api.delete("/user/me");
      if (res.status === 200) {
        toast.success(res?.data?.message ?? "Account deleted successfully");
        if (data?.onSuccess) {
          data.onSuccess();
        }
        return res?.data;
      }
      const message = res?.data?.message ?? "Failed to delete account";
      toast.error(message);
      return rejectWithValue(message);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Failed to delete account";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// export const updateProfilePicture = createAsyncThunk(
//   "user/updateProfilePicture",
//   async (file: File, { rejectWithValue }) => {
//     try {
//       const formData = new FormData();
//       formData.append("avatar", file);
//       const res = await api.post(
//         `${BACKEND_URL}/user/profile-picture`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       const payload = res?.data?.data?.user ?? res?.data?.user ?? res?.data;
//       toast.success(res?.data?.message ?? "Profile picture updated");
//       return payload;
//     } catch (error: any) {
//       const message =
//         error?.response?.data?.message ??
//         error?.message ??
//         "Failed to update profile picture";
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );
