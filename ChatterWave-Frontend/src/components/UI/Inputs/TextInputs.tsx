import { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  // register: ReturnType<typeof useForm>["register"];
  // register: UseFormRegister<FieldValues>;
  register?: UseFormRegisterReturn;
}

function TextInput(props: InputProps) {
  const { label, name, id, error, register, ...rest } = props;
  return (
    <label htmlFor={name} className="flex flex-col">
      <div className="mb-1 text-sm">{label}</div>
      <input
        type="text"
        id={id}
        {...register}
        {...rest}
        className="px-4 py-2 outline-none bg-transparent rounded-md border border-input-border-stationary active:border-input-border-primary focus:border-input-border-primary hover:border-input-border-primary leading-5"
      />
      {error && (
        <div className="error-text block text-red-500 mt-1 text-sm">
          {error}
        </div>
      )}
    </label>
  );
}

export default TextInput;

export const PasswordInput = (props: InputProps) => {
  const { label, name, id, register, error, ...rest } = props;
  const [visible, setVisible] = useState(false);
  return (
    <label htmlFor={name} className="flex flex-col">
      <div className="mb-1 text-sm">{label}</div>
      <div className="flex-1  flex flex-col relative">
        <input
          type={visible ? "text" : "password"}
          id={id}
          {...register}
          {...rest}
          className="px-4 py-2 flex-1 outline-none bg-transparent rounded-md border border-input-border-stationary active:border-input-border-primary focus:border-input-border-primary hover:border-input-border-primary leading-5"
        />
        <button
          type="button"
          className="absolute right-0 top-0 h-full px-3 text-lg"
          onClick={() => {
            setVisible(!visible);
          }}
        >
          {!visible ? <IoIosEyeOff /> : <IoIosEye />}
        </button>
      </div>
      {error && (
        <div className="error-text block w-full text-red-500 mt-1 text-sm">
          {error}
        </div>
      )}
    </label>
  );
};
