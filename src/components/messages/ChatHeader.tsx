import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Users } from "lucide-react";
import { Chat } from "@/types/chat";
import { Button } from "@/components/ui/button";
type ChatHeaderProps = {
  chat: Chat;
  onBackClick?: () => void;
};
export const ChatHeader = ({
  chat,
  onBackClick
}: ChatHeaderProps) => {
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
  return <div className="sticky top-0 z-10 p-4 sm:p-5 border-b border-b-border/40 bg-white dark:bg-gray-800 flex items-center gap-3 shadow-sm">
      {onBackClick && <Button variant="ghost" size="icon" onClick={onBackClick} className="flex-shrink-0 hover:bg-muted/50">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to chat list</span>
        </Button>}
      
      <Avatar className="h-9 w-9 sm:h-11 sm:w-11 border border-primary/20">
        <AvatarImage src={getChatAvatar(chat)} />
        <AvatarFallback className="bg-purple-200 text-purple-700 text-xs sm:text-sm">
          {chat.type === "group" ? <Users className="h-4 w-4 sm:h-5 sm:w-5" /> : chat.otherMember?.name.substring(0, 2).toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-base sm:text-lg truncate">{getChatName(chat)}</h3>
        <p className="text-xs sm:text-sm text-gray-500 truncate">
          {chat.type === "group" ? `${chat.members.length} members` : "Private conversation"}
        </p>
      </div>
    </div>;
};