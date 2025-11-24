import { createSlice } from "@reduxjs/toolkit";

export interface UIStateType {
  isDarkTheme: boolean;
  loading: boolean;
  success: boolean;
  isNavbarOpen: boolean;
  isSidebarOpen: boolean;
}

// Central UI slice keeps track of global chrome toggles and feedback flags.
const initialState: UIStateType = {
  isDarkTheme: false,
  loading: false,
  success: false,
  isNavbarOpen: false,
  isSidebarOpen: true,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    changeTheme: (state, action) => {
      const root = document.getElementsByTagName("html")[0]; // '0' to assign the first (and only `HTML` tag)

      if (action.payload) {
        localStorage.setItem("theme", "dark");
        root.setAttribute("class", "dark");
      } else {
        localStorage.setItem("theme", "light");
        root.removeAttribute("class");
      }
      // Flag lets the rest of the app know which theme is active (useful for icons and inline logic).
      state.isDarkTheme = action.payload;
    },
    toggleNavbar: (state, action) => {
      // Toggle when payload omitted; allow direct set when boolean is provided.
      state.isNavbarOpen = action?.payload ?? !state.isNavbarOpen;
    },
    toggleSidebar: (state, action) => {
      state.isSidebarOpen = action?.payload ?? !state.isSidebarOpen;
    },
  },
  extraReducers() {},
});

// Action creators are generated for each case reducer function
export const { changeTheme, toggleNavbar, toggleSidebar } = uiSlice.actions;

export default uiSlice.reducer;
