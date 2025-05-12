
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Users } from "lucide-react";
import { Chat } from "@/types/chat";
import { Button } from "@/components/ui/button";

type ChatHeaderProps = {
  chat: Chat;
  onBackClick?: () => void;
};

export const ChatHeader = ({ chat, onBackClick }: ChatHeaderProps) => {
  // Format chat name
  const getChatName = (chat: Chat) => {
    if (chat.type === "group") return "Family Group Chat";
    return chat.otherMember?.name || "Private Chat";
  };

  // Get avatar for chat
  const getChatAvatar = (chat: Chat) => {
    if (chat.type === "group") return null; // Use fallback for group
    return chat.otherMember?.avatar_url || null;
  };

  return (
    <div className="sticky top-0 z-10 p-4 border-b bg-white dark:bg-gray-800 flex items-center gap-3">
      {onBackClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBackClick} 
          className="mr-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      
      <Avatar>
        <AvatarImage src={getChatAvatar(chat)} />
        <AvatarFallback className="bg-purple-200 text-purple-700">
          {chat.type === "group" ? (
            <Users className="h-4 w-4" />
          ) : (
            chat.otherMember?.name.substring(0, 2).toUpperCase() || "?"
          )}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-medium">{getChatName(chat)}</h3>
        <p className="text-xs text-gray-500">
          {chat.type === "group" 
            ? `${chat.members.length} members` 
            : "Private conversation"}
        </p>
      </div>
    </div>
  );
};
