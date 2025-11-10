import { createContext, PropsWithChildren, useContext, useState } from "react";

// Provides a simple wrapper around localStorage-backed auth user data for non-Redux consumers.

export const AuthContext = createContext(undefined);
// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  return useContext(AuthContext);
};
export const AuthContextProvider = (props: PropsWithChildren) => {
  const { children } = props;
  // Hydrate initial auth state from localStorage so SSR refreshes remain logged in.
  const [authUser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("user") as string) || null
  );
  return (
    // @ts-expect-error Context consumers expect a lightweight loose shape; strict typing is deferred.
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};
