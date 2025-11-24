// Provides the profile settings form for updating display name or deleting the account.
import TextInput from "./UI/Inputs/TextInputs";
import { ButtonDangerGradient, ButtonPrimaryGradient } from "./UI/Button/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAppDispatch } from "../store";
import { updateUser, deleteAccount } from "../features/user/userAction";
import { getme, logout as logoutUser } from "../features/auth/authAction";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createToastDismissController } from "../helper/toastDismiss.helper";

function EditInformationForm() {
  interface FormData {
    name: string;
  }
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .min(3, "Name must be at least 3 characters"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Ask the user to confirm the name change before dispatching the update.
  const confirmNameUpdate = (data: FormData) => {
    if (!data?.name?.trim()) {
      return;
    }

    const toastId = "update-name-confirmation";
    // Reuse the toast controller so consecutive submits reuse the same prompt and auto-dismiss rules.
    const controller = createToastDismissController(toastId);
    toast.custom(
      (t) => (
        <div
          data-toast-id={t.id}
          className="rounded-lg bg-secondary-bg-color px-4 py-3 shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="text-sm font-medium text-primary-text-color">
            Update your display name to "{data.name}"?
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white shadow hover:bg-sky-700 hover:shadow-lg"
              onClick={() => {
                controller.dismiss();
                dispatch(
                  updateUser({
                    name: data.name.trim(),
                    onSuccess: () => {
                      // Refresh profile data and reset the form on success.
                      dispatch(getme());
                      reset({ name: "" });
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
                controller.dismiss();
                reset({ name: "" });
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
    controller.attach();
  };

  // Present a destructive action confirmation before wiping the account.
  const confirmAccountDeletion = () => {
    const toastId = "delete-account";
    // Separate controller to manage the destructive confirmation toast lifecycle.
    const controller = createToastDismissController(toastId);
    toast.custom(
      (t) => (
        <div
          data-toast-id={t.id}
          className="rounded-lg bg-secondary-bg-color px-4 py-3 shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="text-sm font-medium text-primary-text-color">
            Are you sure you want to delete your account? This action cannot be undone.
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white shadow hover:bg-red-700 hover:shadow-md"
              onClick={() => {
                controller.dismiss();
                dispatch(
                  deleteAccount({
                    onSuccess: () => {
                      // Log the user out and redirect to login once the account is gone.
                      dispatch(logoutUser());
                      navigate("/login", { replace: true });
                    },
                  })
                );
              }}
            >
              Yes
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-primary-text-color shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => {
                controller.dismiss();
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
    controller.attach();
  };
  return (
    <div className="flex flex-col flex-1 gap-3">
      <div className="text-lg">Edit information</div>
      <form
        className="flex flex-col gap-2"
        onSubmit={handleSubmit(confirmNameUpdate)}
      >
        {/* Capture the new display name value before confirming the update. */}
        <TextInput
          label="Name"
          register={register("name")}
          error={errors.name?.message}
        />
        <ButtonPrimaryGradient
          text="Update name"
          type="submit"
          className="w-full sm:min-w-[180px]"
        />
        <div className="pt-6">
          <ButtonDangerGradient
            text="Delete account"
            type="button"
            className="w-full sm:min-w-[180px]"
            onClick={confirmAccountDeletion}
          />
        </div>
      </form>
    </div>
  );
}

export default EditInformationForm;
