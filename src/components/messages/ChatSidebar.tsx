
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { Chat } from "@/types/chat";

type ChatSidebarProps = {
  chats: Chat[];
  isLoading: boolean;
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
};

export const ChatSidebar = ({
  chats,
  isLoading,
  selectedChat,
  onSelectChat,
}: ChatSidebarProps) => {
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
    <div className="w-full sm:w-80 border-r bg-white dark:bg-gray-800/50 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Messages</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chats.length > 0 ? (
          <div className="divide-y">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors ${
                  selectedChat?.id === chat.id ? "bg-purple-50 dark:bg-gray-700" : ""
                }`}
                onClick={() => onSelectChat(chat)}
              >
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
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{getChatName(chat)}</h4>
                  <p className="text-xs text-gray-500 truncate">
                    {chat.type === "group" ? "Everyone in your family" : "Direct messages"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
