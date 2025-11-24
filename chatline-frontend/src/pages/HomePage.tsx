import { useEffect, useMemo, useState } from "react";
import ProfileLayout from "../Layouts/ProfileLayout";
import useAuth from "../hooks/useAuth";
import { BiCheckCircle, BiMessage } from "react-icons/bi";
import { ButtonPrimaryGradient } from "../components/UI/Button/Button";
import heroLayerOne from "../assets/1.png";
import heroLayerTwo from "../assets/2.png";
import heroLayerThree from "../assets/3.png";
import api from "../config/axiosConfig";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";
import { HiOutlinePaperAirplane } from "react-icons/hi";

function HomePage() {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    conversations: 0,
    messages: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // Dashboard tiles pull a lightweight aggregate count so the landing hero can feel dynamic.
        const res = await api.get("/user/stats");
        if (isMounted && res?.data?.success) {
          setStats({
            users: res.data.data.users ?? 0,
            conversations: res.data.data.conversations ?? 0,
            messages: res.data.data.messages ?? 0,
          });
        }
      } catch (error: any) {
        if (isMounted) {
          // Surfacing a toast keeps failures obvious without breaking the rest of the page.
          const message = error?.response?.data?.message ?? "Unable to load dashboard stats";
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        label: "Total users",
        value: stats.users,
        icon: <FaUsers className="text-secondary-text-color text-[40px]" />,
      },
      {
        label: "Total conversations",
        value: stats.conversations,
        icon: <BsChatDots className="text-secondary-text-color text-[38px]" />,
      },
      {
        label: "Total messages sent",
        value: stats.messages,
        icon: <HiOutlinePaperAirplane className="text-secondary-text-color text-[40px]" />,
      },
    ],
    [stats]
  );
  return (
    <ProfileLayout>
      <div className="my-width pb-10">
        <header className="mt-6 mb-8">
          <h1 className="text-2xl md:text-3xl text-font-primary font-semibold">
            {`Welcome, ${authState?.user?.name}`}
          </h1>
          {/* <p className="text-font-secondary">Overview</p> */}
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-white/30 bg-secondary-bg-color shadow-xl shadow-black/5 dark:border-slate-800/60">
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center px-6 py-10 sm:px-10 md:px-16">
            <div className="relative z-10 flex flex-col gap-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-100/40 px-4 py-1 text-xs font-medium uppercase tracking-widest text-sky-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-sky-300">
                  Encrypted chats, everywhere
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-text-color dark:text-white leading-tight">
                Start a secure conversation in seconds and stay connected.
              </h2>
              <p className="text-secondary-text-color max-w-xl leading-relaxed dark:text-slate-200">
                Chatline pairs advanced encryption security with users across the platform. Join chat, manage trusted friends, and keep every message private across all your devices.
              </p>

              <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
                {[
                  "Verified friend requests",
                  "Real-time encrypted messaging",
                  "Adaptive light & dark themes",
                  "Multi-device sync with ease",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-primary-text-color dark:text-white">
                    <BiCheckCircle className="text-sky-500 text-lg" />
                    <span className="text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <ButtonPrimaryGradient
                  text="Try it now"
                  fitWidth
                  onClick={() => navigate("/chat")}
                />
                <button
                  onClick={() => navigate("/friends")}
                  className="inline-flex items-center justify-center rounded-full border border-sky-500/40 px-6 py-3 text-sm font-semibold text-sky-600 transition-colors hover:border-sky-500 hover:bg-sky-100/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 focus-visible:ring-offset-2 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Explore global friends
                </button>
              </div>
            </div>

            <div className="relative h-[280px] sm:h-[380px] lg:h-[440px]">
              <div
                aria-hidden
                className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-sky-100/80 via-indigo-100/70 to-purple-100/60 blur-xl dark:from-slate-900/70 dark:via-indigo-900/50 dark:to-slate-950/70"
              />
              <div className="absolute inset-0 rounded-[2.5rem] border border-white/50 bg-white/30 backdrop-blur-3xl dark:border-slate-800/60 dark:bg-slate-900/30" />

              <div className="relative z-10 h-full w-full">
                <figure className="absolute bottom-6 left-2 w-[64%] max-w-[260px] -rotate-3 sm:left-8 sm:w-[55%] sm:max-w-[300px]">
                  <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl shadow-sky-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
                    <img
                      src={heroLayerOne}
                      alt="Secure messaging"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </figure>

                <figure className="absolute right-0 top-6 w-[58%] max-w-[260px] rotate-2 sm:right-8 sm:w-[52%] sm:max-w-[300px]">
                  <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl shadow-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
                    <img
                      src={heroLayerTwo}
                      alt="Chat interface"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </figure>

                <figure className="absolute left-1/2 top-[48%] w-[46%] max-w-[240px] -translate-x-1/2 -translate-y-1/2 rotate-1 sm:w-[40%] sm:max-w-[260px]">
                  <div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-purple-400/20 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
                    <img
                      src={heroLayerThree}
                      alt="Private conversations"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </figure>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/40 bg-white/70 px-6 pb-10 pt-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70 sm:px-10 md:px-16">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-sky-500/10 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-full bg-sky-500/10 p-3 text-sky-600 dark:bg-slate-800 dark:text-sky-300">
                      {card.icon}
                    </div>
                    <BiMessage className="text-secondary-text-color/80 text-xl dark:text-slate-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-primary-text-color dark:text-white">
                    {loadingStats ? "--" : card.value.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-secondary-text-color dark:text-slate-300">
                    {card.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ProfileLayout>
  );
}

export default HomePage;
