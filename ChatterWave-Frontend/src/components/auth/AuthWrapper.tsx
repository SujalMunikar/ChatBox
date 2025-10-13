import React, { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import TextInput, { PasswordInput } from "../UI/Inputs/TextInputs";
import { ButtonPrimaryGradient } from "../UI/Button/Button";

function AuthWrapper(props: PropsWithChildren) {
  const { children } = props;
  return (
    <div className="flex flex-col flex-1 w-full p-8  justify-center ">
      {children}
    </div>
  );
}

export default AuthWrapper;
