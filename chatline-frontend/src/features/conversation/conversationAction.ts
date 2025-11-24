// import { createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../../config/axiosConfig";
// import toast from "react-hot-toast";
// import { BACKEND_URL } from "../../config/urlConfig";

// export const getConversations = createAsyncThunk(
//   "getConversations",
//   async (id: string) => {
//     try {
//       const res = await api.get(`${BACKEND_URL}/message/${id}`);
//       if (res.status === 200) {
//         toast.success("Conversation fetch success");
//         return res?.data;
//       }
//     } catch (error: unknown) {
//       console.log(error);
//     }
//   }
// );

// interface SendMessageArgumentType {
//   id: string;
//   message: string;
// }

// export const sendMessage = createAsyncThunk(
//   "sendMessage",
//   async (data: SendMessageArgumentType) => {
//     const { id, message } = data;
//     try {
//       const res = await api.post(`${BACKEND_URL}/message/send/${id}`, {
//         message,
//       });
//       if (res.status === 201) {
//         // toast.success("Message Sent success");
//         return res?.data;
//       }
//     } catch (error: unknown) {
//       console.log(error);
//     }
//   }
// );

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axiosConfig";
import toast from "react-hot-toast";
// import { BACKEND_URL } from "../../config/urlConfig";

// Thunks for fetching existing conversations and sending new messages.

export const getConversations = createAsyncThunk(
  "getConversations",
  async (id: string, { rejectWithValue }) => {
    try {
      console.log("Fetching conversations for user:", id);
      // const res = await api.get(`${BACKEND_URL}/message/${id}`);

      const res = await api.get(`/message/${id}`);
      
      if (res.status === 200) {
        console.log("Conversations fetched successfully:", res.data);
        return res.data;
      } else {
        throw new Error(`Unexpected status: ${res.status}`);
      }
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch conversations";
      // Bubble up the failure so components can surface an inline retry UI while still notifying via toast.
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

interface SendMessageArgumentType {
  id: string;
  message: string;
}

export const sendMessage = createAsyncThunk(
  "sendMessage",
  async (data: SendMessageArgumentType, { rejectWithValue }) => {
    const { id, message } = data;
    try {
      console.log("Sending message:", message, "to user:", id);
      // const res = await api.post(`${BACKEND_URL}/message/send/${id}`, {
      //   message,
      // });

      const res = await api.post(`/message/send/${id}`, { message });
      
      if (res.status === 201) {
        console.log("Message sent successfully:", res.data);
        toast.success("Message sent successfully");
        return res.data;
      } else {
        throw new Error(`Unexpected status: ${res.status}`);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to send message";
      // Reject with a descriptive message so reducers can revert optimistic UI if needed.
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);