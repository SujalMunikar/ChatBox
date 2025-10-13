import React from "react";
import ProfileLayout from "../Layouts/ProfileLayout";
import PageTitleSection from "../components/UI/PageTitleSection";
import Avatar from "../components/Avatar";
import { sizeList } from "../constants/avatarSize";
import useAuth from "../hooks/useAuth";
import { ButtonPrimaryGradient } from "../components/UI/Button/Button";
import EditInformationForm from "../components/EditInformationForm";
import ChangePasswordFrom from "../components/ChangePasswordFrom";

function ProfilePage() {
  const { authState } = useAuth();
  return (
    <ProfileLayout>
      <div className="my-width pb-10">
        <PageTitleSection title="Profile" p="Personalize your experience." />
        <div className="bg-secondary-bg-color pb-10 ">
          <div className="flex flex-col items-center justify-center p-4 py-10 ">
            <Avatar name={authState?.user.name} size={sizeList.large} />
            <h1 className="text-primary-accent-color text-xl mt-1 font-bold">
              {authState?.user.name}
            </h1>
            <p className="text-secondary-text-color mb-3">
              {authState?.user.email}
            </p>

            <ButtonPrimaryGradient
              text="Edit Primary"
              // onClick={() => alert("hello")}
            />
          </div>
          <div className="border-t border-[#333] p-6 md:px-28  text-primary-text-color flex flex-col md:flex-row justify-center gap-12 md:gap-28">
            <EditInformationForm />
            <ChangePasswordFrom />
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

export default ProfilePage;
