import React, { ReactNode } from "react";
import { cn } from "../../../helper/tailwindMergeClass.helper";
import Spinner from "../Spinner";

// Shared button primitives ensure consistent styling across the app with optional loading states.

interface ButtonType extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  width?: number;
  fullWidth?: boolean;
  fitWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

interface ButtonWithIconType
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  children: ReactNode;
}

function Button(props: ButtonType) {
  return (
    <button
      type="button"
      className="px-5 py-2 shadow-xl rounded-[40px] bg-slate-50 hover:bg-slate-300 text-gray-950"
      {...props}
    >
      {props?.text}
    </button>
  );
}

export default Button;

export const ButtonWithIcon = (props: ButtonWithIconType) => {
  return (
    <button
      type="button"
      className="text-[22px] p-3 rounded text-black hover:bg-[#DBDDE1] dark:text-white  dark:hover:bg-[#272A30]"
      {...props}
    >
      {/* dark:hover:text-[#337EFF] */}
      {props.children}
    </button>
  );
};

export const ButtonPrimaryGradient = (props: ButtonType) => {
  const {
    text,
    fullWidth,
    fitWidth,
    loading,
    disabled,
    className,
    ...rest
  } = props;
  return (
    <button
      type="button"
      className={cn(
        "px-4 py-2 rounded-md bg-custom-gradient  text-white font-bold uppercase text-sm flex items-center justify-center",
        {
          "w-full flex-1": fullWidth,
          "w-fit": fitWidth,
          "hover:shadow-custom-pink ": !loading && !disabled,
          "opacity-60": disabled || loading,
        },
        className
      )}
      disabled={loading || disabled}
      {...rest}
    >
      {/* Inline spinner keeps CTA responsive without shifting layout. */}
      {loading && <Spinner />}

      {text}
    </button>
  );
};

export const ButtonDangerGradient = (props: ButtonType) => {
  const {
    text,
    fullWidth,
    fitWidth,
    loading,
    disabled,
    className,
    ...rest
  } = props;
  return (
    <button
      type="button"
      className={cn(
        "px-4 py-2 rounded-md bg-danger-gradient text-white font-bold uppercase text-sm flex items-center justify-center",
        {
          "w-full flex-1": fullWidth,
          "w-fit": fitWidth,
          "hover:shadow-custom-red": !loading && !disabled,
          "opacity-60": disabled || loading,
        },
        className
      )}
      disabled={loading || disabled}
      {...rest}
    >
      {/* Danger variant mirrors above but with the red gradient palette. */}
      {loading && <Spinner />}

      {text}
    </button>
  );
};
