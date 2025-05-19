
import { useState, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { EmptyState } from "./EmptyState";
import { Chat } from "@/types/chat";
import { Profile } from "@/types/profile";
import { Message } from "@/types/message";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";

type ChatContainerProps = {
  selectedChat: Chat | null;
  messages: Message[];
  profiles: Record<string, Profile>;
  isLoadingMessages: boolean;
  onSendMessage: (content: string) => void;
  onBackToList?: () => void;
};

export const ChatContainer = ({
  selectedChat,
  messages,
  profiles,
  isLoadingMessages,
  onSendMessage,
  onBackToList,
}: ChatContainerProps) => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  if (!selectedChat) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <ChatHeader 
        chat={selectedChat} 
        onBackClick={isMobile ? onBackToList : undefined}
      />
      
      {isLoadingMessages ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-3 border-t-transparent border-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <MessageList messages={messages} profiles={profiles} />
      )}
      
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};
