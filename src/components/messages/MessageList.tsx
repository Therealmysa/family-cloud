
import { useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "@/types/message";
import { Profile } from "@/types/profile";

type MessageListProps = {
  messages: Message[];
  profiles: Record<string, Profile>;
};

export const MessageList = ({ messages, profiles }: MessageListProps) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get sender details for message
  const getSender = (senderId: string) => {
    return profiles[senderId] || { name: "Unknown", avatar_url: null };
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const isCurrentUser = message.sender_id === user?.id;
          const sender = getSender(message.sender_id);
          const showSender = 
            messages[0].chat_id.startsWith('group-') && 
            (index === 0 || messages[index - 1].sender_id !== message.sender_id);

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
            >
              {showSender && !isCurrentUser && (
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={sender.avatar_url || ""} />
                    <AvatarFallback className="text-[10px]">
                      {sender.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500">{sender.name}</span>
                </div>
              )}

              <div
                className={`px-4 py-2 rounded-lg max-w-[80%] ${
                  isCurrentUser
                    ? "bg-purple-500 text-white"
                    : "bg-white dark:bg-gray-800"
                }`}
              >
                <p>{message.content}</p>
                <span
                  className={`text-xs mt-1 block ${
                    isCurrentUser ? "text-purple-100" : "text-gray-500"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
