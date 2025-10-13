import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getme, login, logout, register, verifyEmail } from "./authAction";
import { getSocket } from "../socket/socketConfig";

export interface CounterState {
  value: number;
  user: unknown;
  loading: boolean;
  success: boolean;
}

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
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      const socket = getSocket();
      socket?.disconnect();
    },
    resetAuthFulfilledState: (state) => {
      state.success = false;
      state.loading = false;
    },
  },
  extraReducers(builder) {
    // LOGIN
    builder.addCase(login.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      login.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        if (payload?.success) {
          state.user = payload.data;
          localStorage.setItem("user", JSON.stringify(payload.data));
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
        if (payload?.success) {
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
        if (payload?.success) {
          state.user = payload.data;
          localStorage.setItem("user", JSON.stringify(payload.data));
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
        if (payload?.success) {
          state.user = payload.data;
          localStorage.setItem("user", JSON.stringify(payload.data));
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
