import { PasswordInput } from "./UI/Inputs/TextInputs";
import { ButtonPrimaryGradient } from "./UI/Button/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAppDispatch } from "../store";
import { getme, updatePassword } from "../features/auth/authAction";

function ChangePasswordFrom() {
  interface FormData {
    oldPassword: string;
    newPassword: string;
  }
  const validationSchema = Yup.object({
    oldPassword: Yup.string().required("Old Password is required."),
    newPassword: Yup.string()
      .required("New Password is required.")
      .min(8, "Password must be at least 8 characters"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const dispatch = useAppDispatch();

  const onSubmit = async (data: FormData) => {
    dispatch(
      updatePassword({
        ...data,
        onSuccess: () => {
          dispatch(getme());
          setValue("oldPassword", "");
          setValue("newPassword", "");
        },
      })
    );
  };
  return (
    <div className="flex flex-col flex-1 gap-3">
      <div className="text-lg">Change Passsword</div>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <PasswordInput
          label="Current Password"
          register={register("oldPassword")}
          error={errors.oldPassword?.message}
        />

        <PasswordInput
          label="New Password"
          register={register("newPassword")}
          error={errors.newPassword?.message}
        />
        <ButtonPrimaryGradient text="Update Password" type="submit" />
      </form>
    </div>
  );
}

export default ChangePasswordFrom;
