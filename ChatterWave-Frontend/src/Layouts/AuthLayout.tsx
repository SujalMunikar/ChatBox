import LogoAnimation from "../components/auth/LogoAnimation";
import { PropsWithChildren } from "react";
// import Navbar from "../components/Navbar";

function AuthLayout(props: PropsWithChildren) {
  const { children } = props;
  return (
    <div className=" h-screen flex flex-col md:flex-row">
      <div className="left w-full bg-slate-800 flex items-center justify-center h-60 md:h-full">
        <LogoAnimation />
      </div>
      <div className="right w-full  md:w-[600px] flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
