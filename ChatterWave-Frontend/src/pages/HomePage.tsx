import React, { PropsWithChildren } from "react";
import ProfileLayout from "../Layouts/ProfileLayout";
import useAuth from "../hooks/useAuth";
import { BiMessage } from "react-icons/bi";
import { ButtonPrimaryGradient } from "../components/UI/Button/Button";
import heroSvg from "../assets/hero.svg";
import { useAppDispatch } from "../store";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const { authState } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return (
    <ProfileLayout>
      <div className="my-width pb-10">
        <div className="flex mt-[80px] gap-5 flex-col-reverse md:flex-row">
          
          <div className=" flex-1">
            <div className="h-20">
              {" "}
              <h1 className="text-2xl text-font-primary">{`Welcome, ${authState?.user?.name}`}</h1>
              <p className="text-font-secondary">Overview</p>
            </div>
            <div className="w-full bg-secondary-bg-color shadow-md   rounded-lg overflow-hidden">
              <div className=" h-auto md:h-[350px] bg-custom-gradient-hero p-6 px:10 md:px-32 pb-11 flex md:grid md:grid-cols-[1fr_2fr]  gap-10 place-items-center ">
                <div className="hidden md:flex ">
                  <img
                    src={heroSvg}
                    alt="welcome to chatterwave"
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="text-3xl font-bold mb-1 dark:text-white">
                    Do you need secure messaging app? Try out ChatterWave.
                  </div>
                  <p className="mb-4 text-primary-text-color dark:text-white">
                    {" "}
                    Forms that take less than 5 minutes to create
                  </p>
                  <ButtonPrimaryGradient
                    text="Try it now"
                    fitWidth
                    onClick={() => navigate("/chat")}
                  />
                </div>
              </div>
              <div className=" flex-wrap md:flex-nowrap md:h-[200px] p-4 md:p-0 flex items-center justify-center ">
                <div className="cards-row w-3/4 flex flex-col md:flex-row  gap-3 translate-x-0 md:translate-y-[-50px]">
                  {[...Array(3)].map(() => {
                    return (
                      <div className="card md:size-1/3 h-[180px]  p-4 py-6 shadow-lg bg-unit-bg-color rounded-md flex flex-1 flex-col items-center justify-between ">
                        <BiMessage className="text-secondary-text-color text-[40px]" />
                        <div className="text-primary-text-color text-[40px] font-extrabold">
                          150
                        </div>
                        <div className="text-sm text-secondary-text-color">
                          Pending Review
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

export default HomePage;
