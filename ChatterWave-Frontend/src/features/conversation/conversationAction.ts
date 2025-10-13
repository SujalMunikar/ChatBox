import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axiosConfig";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../../config/urlConfig";

export const getConversations = createAsyncThunk(
  "getConversations",
  async (id: string) => {
    try {
      const res = await api.get(`${BACKEND_URL}/message/${id}`);
      if (res.status === 200) {
        toast.success("Conversation fetch success");
        return res?.data;
      }
    } catch (error: unknown) {
      console.log(error);
    }
  }
);

interface SendMessageArgumentType {
  id: string;
  message: string;
}

export const sendMessage = createAsyncThunk(
  "sendMessage",
  async (data: SendMessageArgumentType) => {
    const { id, message } = data;
    try {
      const res = await api.post(`${BACKEND_URL}/message/send/${id}`, {
        message,
      });
      if (res.status === 201) {
        // toast.success("Message Sent success");
        return res?.data;
      }
    } catch (error: unknown) {
      console.log(error);
    }
  }
);
