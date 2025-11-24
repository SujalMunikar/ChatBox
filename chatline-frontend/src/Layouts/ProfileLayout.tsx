import { PropsWithChildren } from "react";

import Navbar from "../components/Navbar";

function ProfileLayout(props: PropsWithChildren) {
  const { children } = props;
  return (
    <div className="w-full min-h-screen flex-col relative  bg-primary-bg-color">
      {/* Shared layout for authenticated pages: persistent top nav + themed body wrapper. */}
      <Navbar />
      <div className="main-section flex-1">{children}</div>
    </div>
  );
}

export default ProfileLayout;
