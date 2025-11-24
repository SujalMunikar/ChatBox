import useAuth from "../../hooks/useAuth";

// Friendly placeholder that greets the user before they pick a conversation.
function WelcomeChat() {
  const { authState } = useAuth();
  const displayName = authState?.user?.name ?? "there";
  return (
    <div className="h-full w-full flex items-center justify-center text-[20px] sm:text-[40px] dark:text-neutral-100">
      Welcome, {displayName}
    </div>
  );
}

export default WelcomeChat;
