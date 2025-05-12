
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Chat } from "@/types/chat";
import { Message } from "@/types/message";

type ChatSidebarProps = {
  chats: Chat[];
  isLoading: boolean;
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
};

type ChatWithLastMessage = Chat & {
  lastMessage?: {
    content: string;
    timestamp: string;
  }
};

export const ChatSidebar = ({
  chats,
  isLoading,
  selectedChat,
  onSelectChat,
}: ChatSidebarProps) => {
  const { user } = useAuth();
  const [enhancedChats, setEnhancedChats] = useState<ChatWithLastMessage[]>([]);

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

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return "Yesterday";
    }
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Get last message for each chat
  useEffect(() => {
    const fetchLastMessages = async () => {
      if (!chats.length) return;
      
      const chatWithMessages = await Promise.all(
        chats.map(async (chat) => {
          const { data } = await supabase
            .from("messages")
            .select("content, timestamp")
            .eq("chat_id", chat.id)
            .order("timestamp", { ascending: false })
            .limit(1);
          
          return {
            ...chat,
            lastMessage: data && data.length > 0 ? data[0] : undefined,
          };
        })
      );
      
      setEnhancedChats(chatWithMessages);
    };
    
    fetchLastMessages();
    
    // Set up realtime subscription for new messages
    const channels = chats.map(chat => {
      return supabase
        .channel(`sidebar-${chat.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT", 
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${chat.id}`
          },
          async (payload) => {
            const newMessage = payload.new as Message;
            
            // Update the chat with the new last message
            setEnhancedChats(current => 
              current.map(c => 
                c.id === chat.id
                  ? {
                      ...c,
                      lastMessage: {
                        content: newMessage.content,
                        timestamp: newMessage.timestamp
                      }
                    }
                  : c
              )
            );
          }
        )
        .subscribe();
    });
    
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [chats]);

  // Sort chats by most recent message
  const sortedChats = [...enhancedChats].sort((a, b) => {
    if (!a.lastMessage && !b.lastMessage) return 0;
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    
    return new Date(b.lastMessage.timestamp).getTime() - 
           new Date(a.lastMessage.timestamp).getTime();
  });

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
        ) : sortedChats.length > 0 ? (
          <div className="divide-y">
            {sortedChats.map((chat) => (
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
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-medium truncate">{getChatName(chat)}</h4>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 shrink-0">
                        {formatTime(chat.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  
                  {chat.lastMessage ? (
                    <p className="text-xs text-gray-500 truncate">
                      {chat.type === 'private' || chat.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 truncate">
                      {chat.type === "group" ? "Everyone in your family" : "Start a conversation"}
                    </p>
                  )}
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
