import useAuth from "../../hooks/useAuth";

function WelcomeChat() {
  const { authState } = useAuth();
  return (
    <div className="h-full w-full flex items-center justify-center text-[20px] sm:text-[40px] dark:text-neutral-100">
      Welcome, {authState.user.name.toUpperCase()} 👋
    </div>
  );
}

export default WelcomeChat;
