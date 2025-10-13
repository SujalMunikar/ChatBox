import { useEffect } from "react";
import ChatHomeLayout from "../../Layouts/ChatHomeLayout";
import WelcomeChat from "../../components/Chat/WelcomeChat";
import { useAppDispatch } from "../../store";
import { setConversationUser } from "../../features/user/userSlice";

function ChatHome() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    //cleanup
    return () => {
      dispatch(setConversationUser(null));
    };
  }, [dispatch]);
  return (
    <>
      <ChatHomeLayout>
        <>
          <WelcomeChat />
        </>
      </ChatHomeLayout>
    </>
  );
}

export default ChatHome;
