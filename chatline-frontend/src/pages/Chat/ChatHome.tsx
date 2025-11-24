import { useEffect } from "react";
import ChatHomeLayout from "../../Layouts/ChatHomeLayout";
import WelcomeChat from "../../components/Chat/WelcomeChat";
import { useAppDispatch } from "../../store";
import { setConversationUser } from "../../features/user/userSlice";
import ProfileLayout from "../../Layouts/ProfileLayout";

// Landing view for the chat section showing a friendly welcome panel.
function ChatHome() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    //cleanup
    return () => {
      dispatch(setConversationUser(null));
    };
  }, [dispatch]);
  return (
    <ProfileLayout>
      <ChatHomeLayout embedded>
        <WelcomeChat />
      </ChatHomeLayout>
    </ProfileLayout>
  );
}

export default ChatHome;
