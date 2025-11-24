import LogoAnimation from "../components/auth/LogoAnimation";
import { PropsWithChildren } from "react";
import BrandMark from "../components/BrandMark";

function AuthLayout(props: PropsWithChildren) {
  const { children } = props;
  return (
    <div className=" h-screen flex flex-col md:flex-row">
      {/* Left pane shows branding/animation, right pane hosts the form content passed in. */}
      <div className="left relative w-full bg-slate-800 flex items-center justify-center h-60 md:h-full">
        <BrandMark className="absolute left-6 top-6 origin-top-left scale-90 sm:scale-95 md:scale-100" />
        <LogoAnimation />
      </div>
      <div className="right w-full  md:w-[600px] flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
