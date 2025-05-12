
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SendHorizontal, Users } from "lucide-react";

type Chat = {
  id: string;
  type: 'group' | 'private';
  family_id: string;
  members: string[];
  otherMember?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
};

type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  sender?: {
    name: string;
    avatar_url: string | null;
  };
};

type Profile = {
  id: string;
  name: string;
  avatar_url: string | null;
  family_id: string | null;
};

const Messages = () => {
  const { user, profile } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chats
  const { data: chats = [], isLoading: isLoadingChats } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .or(`members.cs.{${user.id}}`)
        .order("created_at", { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load chats",
          variant: "destructive",
        });
        return [];
      }

      // For private chats, get the other member's profile
      const enhancedChats: Chat[] = await Promise.all(
        data.map(async (chat) => {
          if (chat.type === "private") {
            const otherMemberId = chat.members.find(id => id !== user.id);
            if (otherMemberId) {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("id, name, avatar_url")
                .eq("id", otherMemberId)
                .single();

              return {
                ...chat,
                otherMember: profileData || undefined
              };
            }
          }
          return chat;
        })
      );

      return enhancedChats as Chat[];
    },
    enabled: !!user,
  });

  // Fetch messages for selected chat
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["messages", selectedChat?.id],
    queryFn: async () => {
      if (!selectedChat) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChat.id)
        .order("timestamp", { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
        return [];
      }

      // Cache profiles for messages
      const senderIds = Array.from(new Set(data.map(msg => msg.sender_id)));
      const missingIds = senderIds.filter(id => !profiles[id]);

      if (missingIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", missingIds);

        if (profilesData) {
          const newProfiles = { ...profiles };
          profilesData.forEach(profile => {
            newProfiles[profile.id] = profile;
          });
          setProfiles(newProfiles);
        }
      }

      return data as Message[];
    },
    enabled: !!selectedChat,
  });

  // Set up real-time messages subscription
  useEffect(() => {
    if (!selectedChat) return;

    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT", 
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${selectedChat.id}`
        },
        (payload) => {
          refetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat, refetchMessages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!user || !selectedChat || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          chat_id: selectedChat.id,
          sender_id: user.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Get sender details for message
  const getSender = (senderId: string) => {
    return profiles[senderId] || { name: "Unknown", avatar_url: null };
  };

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
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MainLayout title="Messages" requireAuth={true}>
      <div className="container max-w-6xl mx-auto flex h-[calc(100vh-16rem)] overflow-hidden">
        {/* Chats sidebar */}
        <div className="w-full sm:w-80 border-r bg-white dark:bg-gray-800/50 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoadingChats ? (
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
                    onClick={() => setSelectedChat(chat)}
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

        {/* Chat window */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b bg-white dark:bg-gray-800 flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={getChatAvatar(selectedChat)} />
                  <AvatarFallback className="bg-purple-200 text-purple-700">
                    {selectedChat.type === "group" ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      selectedChat.otherMember?.name.substring(0, 2).toUpperCase() || "?"
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{getChatName(selectedChat)}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedChat.type === "group" 
                      ? `${selectedChat.members.length} members` 
                      : "Private conversation"}
                  </p>
                </div>
              </div>

              {/* Messages */}
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
                      selectedChat.type === "group" && 
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

              {/* Message input */}
              <div className="p-3 bg-white dark:bg-gray-800 border-t">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <Input
                    placeholder="Type a message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim()}
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium">Your Messages</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-1">
                  Select a conversation to start chatting with your family
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
