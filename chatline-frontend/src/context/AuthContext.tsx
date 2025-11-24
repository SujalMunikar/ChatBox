import { createContext, PropsWithChildren, useContext, useState } from "react";

// Provides a simple wrapper around session-backed auth user data for non-Redux consumers.

export const AuthContext = createContext(undefined);
// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  return useContext(AuthContext);
};
export const AuthContextProvider = (props: PropsWithChildren) => {
  const { children } = props;
  // Hydrate initial auth state from sessionStorage so tabs close resets auth automatically.
  const initialUser = (() => {
    if (typeof window === "undefined") {
      return null;
    }
    const stored = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn("Failed to parse stored auth user", error);
      return null;
    }
  })();

  const [authUser, setAuthUser] = useState(initialUser);
  return (
    // @ts-expect-error Context consumers expect a lightweight loose shape; strict typing is deferred.
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};
