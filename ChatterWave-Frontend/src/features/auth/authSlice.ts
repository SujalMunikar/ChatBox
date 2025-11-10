import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getme, login, logout, register, verifyEmail } from "./authAction";
import { getSocket } from "../socket/socketConfig";

// Centralized auth slice controls login/register state and caches the user payload.


export interface CounterState {
  value: number;
  user: unknown;
  loading: boolean;
  success: boolean;
}

// Reflects the persisted login data and async request lifecycles.
const initialState: CounterState = {
  value: 0,
  user: null,
  loading: false,
  success: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // The following demo reducers are kept for potential counter UI experiments.
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    setAuthUser: (state, action: PayloadAction<unknown>) => {
      // Accept updated user information from external callers (e.g., context refresh).
      state.user = action.payload;
    },
    logout: (state) => {
      // Ensure any active socket connection closes before clearing credentials.
      state.user = null;
      const socket = getSocket();
      socket?.disconnect();
    },
    resetAuthFulfilledState: (state) => {
      // Helper to reset transient flags between guarded flows (e.g., form submissions).
      state.success = false;
      state.loading = false;
    },
  },
  extraReducers(builder) {
    // Async thunks update the slice based on server responses.
    // LOGIN
    builder.addCase(login.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      login.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        // @ts-expect-error The thunk resolves with a runtime-validated API payload the slice narrows via optional chaining.
        if (payload?.success) {
          // @ts-expect-error Properties are guarded at runtime; TypeScript cannot infer the dynamic response structure here.
          state.user = payload.data;
          // @ts-expect-error Token is persisted only when backend supplies it; optional chaining guards the usage.
          localStorage.setItem("user", JSON.stringify(payload.data));
          // @ts-expect-error See comment above: dynamic action payload mirrors backend response.
          localStorage.setItem("token", payload.token);
        }
        state.loading = false;
      }
    );
    builder.addCase(login.rejected, (state) => {
      state.loading = false;
    });

    // REGISTER
    builder.addCase(register.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      register.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        // @ts-expect-error Runtime guards ensure payload has the expected shape.
        if (payload?.success) {
          // @ts-expect-error Console debugging for API payload; optional chaining already guards access.
          console.log(payload?.data);

          // state.user = payload.data;
          // localStorage.setItem("user", JSON.stringify(payload.data));
          // localStorage.setItem("token", payload.token);

          console.log(
            "USER REGISTERED---- Now it should redirect to login page"
          );
          state.success = true;
        }
        state.loading = false;
      }
    );
    builder.addCase(register.rejected, (state) => {
      state.loading = false;
    });

    // GETME
    builder.addCase(getme.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      getme.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        // @ts-expect-error Optional chaining ensures safe access to dynamic payload.
        if (payload?.success) {
          // @ts-expect-error Backend shape is dynamic; guarded usage keeps runtime safe.
          state.user = payload.data;
          // @ts-expect-error Same dynamic payload as above; persisted only when available.
          localStorage.setItem("user", JSON.stringify(payload.data));
          // @ts-expect-error Token persists only when backend provides it.
          localStorage.setItem("token", payload.token);
        }
        state.loading = false;
      }
    );
    builder.addCase(getme.rejected, (state) => {
      state.loading = false;
    });

    //verifyEmail
    builder.addCase(verifyEmail.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      verifyEmail.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        console.log(payload);
        // @ts-expect-error The response is validated at runtime prior to being stored.
        if (payload?.success) {
          // @ts-expect-error Guarded dynamic payload handling as described above.
          state.user = payload.data;
          // @ts-expect-error Safe usage due to optional chaining guard.
          localStorage.setItem("user", JSON.stringify(payload.data));
          // @ts-expect-error Same reasoning: optional chaining assures token presence.
          localStorage.setItem("token", payload.token);
          state.success = true;
        }
        state.loading = false;
      }
    );
    builder.addCase(verifyEmail.rejected, (state) => {
      state.loading = false;
      state.success = false;
    });

    // LOGOUT
    builder.addCase(logout.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      logout.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        state.user = null;
        // @ts-expect-error Logout response is loosely typed; guard ensures success flag exists before clearing storage.
        if (payload?.success) {
          localStorage.clear();
        }
        state.loading = false;
      }
    );
    builder.addCase(logout.rejected, (state) => {
      state.loading = false;
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  increment,
  decrement,
  incrementByAmount,
  setAuthUser,
  resetAuthFulfilledState,
} = authSlice.actions;

export default authSlice.reducer;
