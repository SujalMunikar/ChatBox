import { useEffect } from "react";
import ChatHomeLayout from "../../Layouts/ChatHomeLayout";
import { useAppDispatch } from "../../store";
import { setConversationUser } from "../../features/user/userSlice";
import ProfileLayout from "../../Layouts/ProfileLayout";
import ConversationBody from "../../components/Chat/ConversationBody";
import ErrorBoundary from "../../components/ErrorBoundary";

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
        <ErrorBoundary>
          <ConversationBody />
        </ErrorBoundary>
      </ChatHomeLayout>
    </ProfileLayout>
  );
}

export default ChatHome;
