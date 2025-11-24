// import { createSlice } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";
// import { getConversations, sendMessage } from "./conversationAction";

// export interface ConversationState {
//   value: number;
//   conversation: unknown;
//   loading: boolean;
//   success: boolean;
//   conversation_loading: boolean;
//   conversation_success: boolean;
//   sendMessage_loading: boolean;
//   sendMessage_success: boolean;
// }

// const initialState: ConversationState = {
//   value: 0,
//   conversation: null,
//   loading: false,
//   success: false,
//   conversation_loading: false,
//   conversation_success: false,
//   sendMessage_loading: false,
//   sendMessage_success: false,
// };

// export const conversationSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     appendConversation: (state, action) => {
//       state.conversation = state.conversation
//         ? [...state.conversation, action.payload]
//         : [action.payload];
//     },
//   },
//   extraReducers(builder) {
//     // get conversations
//     builder.addCase(getConversations.pending, (state) => {
//       state.conversation_loading = true;
//     });
//     builder.addCase(
//       getConversations.fulfilled,
//       (state, { payload }: PayloadAction<unknown>) => {
//         state.conversation = payload?.data?.conversation
//           ? payload?.data?.conversation?.messages
//           : null;
//         state.conversation_loading = false;
//         state.conversation_success = true;
//       }
//     );
//     builder.addCase(getConversations.rejected, (state) => {
//       state.conversation_loading = false;
//       state.conversation_success = false;
//     });

//     //send message
//     builder.addCase(sendMessage.pending, (state) => {
//       state.sendMessage_loading = true;
//     });
//     builder.addCase(
//       sendMessage.fulfilled,
//       (state, { payload }: PayloadAction<unknown>) => {
//         state.conversation = state.conversation
//           ? [...state.conversation, payload?.data?.newMessage]
//           : [payload?.data?.newMessage];

//         state.sendMessage_loading = false;
//         state.sendMessage_success = true;
//       }
//     );
//     builder.addCase(sendMessage.rejected, (state) => {
//       state.sendMessage_loading = false;
//       state.sendMessage_success = false;
//     });
//   },
// });

// // Action creators are generated for each case reducer function
// export const { appendConversation } = conversationSlice.actions;

// export default conversationSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getConversations, sendMessage } from "./conversationAction";
import { logout } from "../auth/authAction";

// Manages the active conversation transcript along with async status flags for message actions.

export interface ConversationState {
  value: number;
  conversation: any[];
  loading: boolean;
  success: boolean;
  conversation_loading: boolean;
  conversation_success: boolean;
  sendMessage_loading: boolean;
  sendMessage_success: boolean;
  error: string | null;
  unreadCounts: Record<string, number>;
}

const createInitialState = (): ConversationState => ({
  value: 0,
  conversation: [],
  loading: false,
  success: false,
  conversation_loading: false,
  conversation_success: false,
  sendMessage_loading: false,
  sendMessage_success: false,
  error: null,
  unreadCounts: {},
});

const initialState: ConversationState = createInitialState();

export const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    // Allow manual appends when socket events push new messages.
    appendConversation: (state, action) => {
      if (action.payload) {
        state.conversation = state.conversation
          ? [...state.conversation, action.payload]
          : [action.payload];
      }
    },
    // Resets error banner while keeping transcript intact.
    clearError: (state) => {
      state.error = null;
    },
    // Clears the currently focused conversation, e.g., when navigating away.
    clearConversation: (state) => {
      state.conversation = [];
    },
    // Increment per-user unread tally when a new message arrives outside the active chat.
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (!userId) {
        return;
      }
      state.unreadCounts[userId] = (state.unreadCounts[userId] ?? 0) + 1;
    },
    // Reset unread tally for a conversation once the user opens it.
    clearUnreadCount: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (!userId) {
        return;
      }
      if (userId in state.unreadCounts) {
        delete state.unreadCounts[userId];
      }
    },
    // Allow bulk reset (e.g., on logout) without touching other state slices.
    resetAllUnreadCounts: (state) => {
      state.unreadCounts = {};
    },
  },
  extraReducers(builder) {
    // get conversations
    builder.addCase(getConversations.pending, (state) => {
      state.conversation_loading = true;
      state.error = null;
    });
    builder.addCase(
      getConversations.fulfilled,
      (state, { payload }: PayloadAction<any>) => {
        console.log("Conversation fulfilled with payload:", payload);
        state.conversation = payload?.data?.conversation?.messages || [];
        state.conversation_loading = false;
        state.conversation_success = true;
        state.error = null;
      }
    );
    builder.addCase(getConversations.rejected, (state, action) => {
      state.conversation_loading = false;
      state.conversation_success = false;
      state.error = action.payload as string || "Failed to fetch conversations";
    });

    //send message
    builder.addCase(sendMessage.pending, (state) => {
      state.sendMessage_loading = true;
      state.error = null;
    });
    builder.addCase(
      sendMessage.fulfilled,
      (state, { payload }: PayloadAction<any>) => {
        console.log("Send message fulfilled with payload:", payload);
        if (payload?.data?.newMessage) {
          state.conversation = state.conversation
            ? [...state.conversation, payload.data.newMessage]
            : [payload.data.newMessage];
        }
        state.sendMessage_loading = false;
        state.sendMessage_success = true;
        state.error = null;
      }
    );
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.sendMessage_loading = false;
      state.sendMessage_success = false;
      state.error = action.payload as string || "Failed to send message";
    });

    builder.addCase(logout.fulfilled, () => createInitialState());
  },
});

// Action creators are generated for each case reducer function
export const {
  appendConversation,
  clearError,
  clearConversation,
  incrementUnreadCount,
  clearUnreadCount,
  resetAllUnreadCounts,
} = conversationSlice.actions;

export default conversationSlice.reducer;