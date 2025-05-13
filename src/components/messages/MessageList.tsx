
import { useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "@/types/message";
import { Profile } from "@/types/profile";
import { useIsMobile } from "@/hooks/use-mobile";

type MessageListProps = {
  messages: Message[];
  profiles: Record<string, Profile>;
  compact?: boolean;
};

export const MessageList = ({ messages, profiles, compact = false }: MessageListProps) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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

  // Determine max-width classes based on compact mode and device
  const getMessageWidthClass = (isCurrentUser: boolean) => {
    // Compact mode (for widgets) uses more narrow messages
    if (compact) {
      return isCurrentUser 
        ? "max-w-[80%] sm:max-w-[70%]"
        : "max-w-[80%] sm:max-w-[70%]";
    }
    
    // Regular mode uses more constrained width on larger screens to avoid too-wide messages
    return isMobile
      ? "max-w-[90%]"
      : "max-w-[60%] lg:max-w-[55%] xl:max-w-[50%]";
  };

  return (
    <div className={`flex-1 overflow-y-auto ${compact ? 'p-2 sm:p-3' : 'p-4 sm:p-6 md:p-8'} space-y-5 bg-gray-50/60 dark:bg-gray-900/60`}>
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
                <div className="flex items-center gap-2 mb-1 px-1">
                  <Avatar className={compact ? "h-4 w-4" : "h-5 w-5"}>
                    <AvatarImage src={sender.avatar_url || ""} />
                    <AvatarFallback className={compact ? "text-[8px]" : "text-[10px]"}>
                      {sender.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500 font-medium">{sender.name}</span>
                </div>
              )}

              <div
                className={`${compact ? 'px-3 py-2' : 'px-4 py-3 md:px-5 md:py-4'} rounded-lg ${
                  isCurrentUser
                    ? "bg-primary text-white shadow-md"
                    : "bg-white dark:bg-gray-800 shadow-md border border-border/20"
                } ${getMessageWidthClass(isCurrentUser)}`}
              >
                <p className={compact ? "text-xs sm:text-sm" : "text-sm sm:text-base md:text-lg"}>
                  {compact && message.content.length > 100 
                    ? message.content.substring(0, 100) + "..." 
                    : message.content}
                </p>
                <span
                  className={`text-xs md:text-sm mt-1 block ${
                    isCurrentUser ? "text-primary-foreground/80" : "text-gray-500"
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
