
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { EmptyState } from "./EmptyState";
import { Chat } from "@/types/chat";
import { Profile } from "@/types/profile";
import { Message } from "@/types/message";

type ChatContainerProps = {
  selectedChat: Chat | null;
  messages: Message[];
  profiles: Record<string, Profile>;
  isLoadingMessages: boolean;
  onSendMessage: (content: string) => void;
};

export const ChatContainer = ({
  selectedChat,
  messages,
  profiles,
  isLoadingMessages,
  onSendMessage,
}: ChatContainerProps) => {
  if (!selectedChat) {
    return <EmptyState />;
  }

  return (
    <>
      <ChatHeader chat={selectedChat} />
      
      {isLoadingMessages ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <MessageList messages={messages} profiles={profiles} />
      )}
      
      <MessageInput onSendMessage={onSendMessage} />
    </>
  );
};
