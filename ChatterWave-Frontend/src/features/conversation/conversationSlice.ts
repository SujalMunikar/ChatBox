import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getConversations, sendMessage } from "./conversationAction";

export interface ConversationState {
  value: number;
  conversation: unknown;
  loading: boolean;
  success: boolean;
  conversation_loading: boolean;
  conversation_success: boolean;
  sendMessage_loading: boolean;
  sendMessage_success: boolean;
}

const initialState: ConversationState = {
  value: 0,
  conversation: null,
  loading: false,
  success: false,
  conversation_loading: false,
  conversation_success: false,
  sendMessage_loading: false,
  sendMessage_success: false,
};

export const conversationSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    appendConversation: (state, action) => {
      state.conversation = state.conversation
        ? [...state.conversation, action.payload]
        : [action.payload];
    },
  },
  extraReducers(builder) {
    // get conversations
    builder.addCase(getConversations.pending, (state) => {
      state.conversation_loading = true;
    });
    builder.addCase(
      getConversations.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        state.conversation = payload?.data?.conversation
          ? payload?.data?.conversation?.messages
          : null;
        state.conversation_loading = false;
        state.conversation_success = true;
      }
    );
    builder.addCase(getConversations.rejected, (state) => {
      state.conversation_loading = false;
      state.conversation_success = false;
    });

    //send message
    builder.addCase(sendMessage.pending, (state) => {
      state.sendMessage_loading = true;
    });
    builder.addCase(
      sendMessage.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        state.conversation = state.conversation
          ? [...state.conversation, payload?.data?.newMessage]
          : [payload?.data?.newMessage];

        state.sendMessage_loading = false;
        state.sendMessage_success = true;
      }
    );
    builder.addCase(sendMessage.rejected, (state) => {
      state.sendMessage_loading = false;
      state.sendMessage_success = false;
    });
  },
});

// Action creators are generated for each case reducer function
export const { appendConversation } = conversationSlice.actions;

export default conversationSlice.reducer;
