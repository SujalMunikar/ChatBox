import TextInput from "./UI/Inputs/TextInputs";
import { ButtonPrimaryGradient } from "./UI/Button/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAppDispatch } from "../store";
import { updateUser } from "../features/user/userAction";
import { getme } from "../features/auth/authAction";

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
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const dispatch = useAppDispatch();

  const onSubmit = async (data: FormData) => {
    // alert("submitted" + data.name);
    dispatch(
      updateUser({
        name: data?.name,
        onSuccess: () => dispatch(getme()),
      })
    );
  };
  return (
    <div className="flex flex-col flex-1 gap-3">
      <div className="text-lg">Edit information</div>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          label="Name"
          register={register("name")}
          error={errors.name?.message}
        />
        <ButtonPrimaryGradient text="Update name" type="submit" />
      </form>
    </div>
  );
}

export default EditInformationForm;
