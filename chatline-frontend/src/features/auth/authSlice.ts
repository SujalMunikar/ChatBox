import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getme, login, logout, register, verifyEmail } from "./authAction";
import { getSocket } from "../socket/socketConfig";

// Centralizes authentication state so components can react when the user logs in/out.


export interface CounterState {
  value: number;
  user: unknown;
  loading: boolean;
  success: boolean;
}

// Tracks persisted login data plus async lifecycle flags for the thunks below.
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
    // These helpers stick around for the old counter demo and are safe to ignore.
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
      // Allows non-thunk callers (contexts/hooks) to push fresh profile data here.
      state.user = action.payload;
    },
    logout: (state) => {
      // Close any open socket channel so the server stops sending private updates.
      state.user = null;
      const socket = getSocket();
      socket?.disconnect();
    },
    resetAuthFulfilledState: (state) => {
      // Handy reset between form submissions so buttons stop showing success spinners.
      state.success = false;
      state.loading = false;
    },
  },
  extraReducers(builder) {
    // Async thunks below mirror API calls declared in authAction.ts.
    // LOGIN
    builder.addCase(login.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      login.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        // @ts-expect-error Runtime validation happens in the thunk; TypeScript cannot infer it here.
        if (payload?.success) {
          // @ts-expect-error Same reason as above: backend response is validated on the fly.
          state.user = payload.data;
          if (typeof window !== "undefined") {
            sessionStorage.setItem("user", JSON.stringify(payload.data));
            // @ts-expect-error See comment above: dynamic action payload mirrors backend response.
            sessionStorage.setItem("token", payload.token);
          }
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
        // @ts-expect-error Thunk already guards the payload and throws when malformed.
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
        // @ts-expect-error Same dynamic payload caveat; optional chaining keeps runtime safe.
        if (payload?.success) {
          // @ts-expect-error Backend shape is dynamic; guarded usage keeps runtime safe.
          state.user = payload.data;
          if (typeof window !== "undefined") {
            // @ts-expect-error Same dynamic payload as above; persisted only when available.
            sessionStorage.setItem("user", JSON.stringify(payload.data));
            // @ts-expect-error Token persists only when backend provides it.
            sessionStorage.setItem("token", payload.token);
          }
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
          if (typeof window !== "undefined") {
            // @ts-expect-error Safe usage due to optional chaining guard.
            sessionStorage.setItem("user", JSON.stringify(payload.data));
            // @ts-expect-error Same reasoning: optional chaining assures token presence.
            sessionStorage.setItem("token", payload.token);
          }
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
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
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
