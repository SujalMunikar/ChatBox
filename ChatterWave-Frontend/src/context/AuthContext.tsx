import { createContext, PropsWithChildren, useContext, useState } from "react";

export const AuthContext = createContext(undefined);
// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  return useContext(AuthContext);
};
export const AuthContextProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [authUser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("user") as string) || null
  );
  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};
