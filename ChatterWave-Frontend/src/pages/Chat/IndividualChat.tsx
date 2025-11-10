// import ChatHomeLayout from "../../Layouts/ChatHomeLayout";
// import ConversationBody from "../../components/Chat/ConversationBody";

// function IndividualChat() {
//   return (
//     <>
//       <ChatHomeLayout>
//         <ConversationBody />
//       </ChatHomeLayout>
//     </>
//   );
// }

// export default IndividualChat;

import ChatHomeLayout from "../../Layouts/ChatHomeLayout";
import ConversationBody from "../../components/Chat/ConversationBody";
import ErrorBoundary from "../../components/ErrorBoundary";
import ProfileLayout from "../../Layouts/ProfileLayout";

function IndividualChat() {
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

export default IndividualChat;