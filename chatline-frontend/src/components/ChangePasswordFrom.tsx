import { PasswordInput } from "./UI/Inputs/TextInputs";
import { ButtonPrimaryGradient } from "./UI/Button/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAppDispatch } from "../store";
import { getme, updatePassword } from "../features/auth/authAction";
import toast from "react-hot-toast";
import { createToastDismissController } from "../helper/toastDismiss.helper";

// Password change form wires its confirmation toast through createToastDismissController
// so the prompt self-dismisses after five seconds or when the user interacts elsewhere.

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

  const confirmPasswordUpdate = async (data: FormData) => {
    const toastId = "update-password-confirmation";
    // Controller keeps one active toast per action and handles the auto-dismiss triggers.
    const controller = createToastDismissController(toastId);
    toast.custom(
      (t) => (
        <div
          data-toast-id={t.id}
          className="rounded-lg bg-secondary-bg-color px-4 py-3 shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="text-sm font-medium text-primary-text-color">
            Update your account password?
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white shadow hover:bg-sky-700 hover:shadow-lg"
              onClick={() => {
                // Confirm path: close the toast, dispatch the update, and reset field state via onSuccess.
                controller.dismiss();
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
              }}
            >
              Yes
            </button>
            <button
              type="button"
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white shadow hover:bg-red-700 hover:shadow-md"
              onClick={() => {
                // Cancel path: close the toast and clear inputs so the form is ready for another attempt.
                controller.dismiss();
                setValue("oldPassword", "");
                setValue("newPassword", "");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        id: toastId,
        position: "bottom-right",
        duration: 10000,
      }
    );
    // Finally arm the timeout/outside-click listeners for this toast instance.
    controller.attach();
  };
  return (
    <div className="flex flex-col flex-1 gap-3">
      <div className="text-lg">Change Passsword</div>
      <form
        className="flex flex-col gap-2"
        onSubmit={handleSubmit(confirmPasswordUpdate)}
      >
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
