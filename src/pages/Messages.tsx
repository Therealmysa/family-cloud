
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Chat } from "@/types/chat";
import { Message } from "@/types/message";
import { Profile } from "@/types/profile";
import { ChatSidebar } from "@/components/messages/ChatSidebar";
import { ChatHeader } from "@/components/messages/ChatHeader";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { EmptyState } from "@/components/messages/EmptyState";

const Messages = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

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
          // Ensure chat.type is cast to the correct type
          const typedChat: Chat = {
            ...chat,
            type: chat.type as 'group' | 'private'
          };
          
          if (typedChat.type === "private") {
            const otherMemberId = typedChat.members.find(id => id !== user.id);
            if (otherMemberId) {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("id, name, avatar_url")
                .eq("id", otherMemberId)
                .single();

              if (profileData) {
                return {
                  ...typedChat,
                  otherMember: profileData
                };
              }
            }
          }
          return typedChat;
        })
      );

      return enhancedChats;
    },
    enabled: !!user,
  });

  // Fetch messages for selected chat
  const fetchMessages = async () => {
    if (!selectedChat || !user) return;
    
    setIsLoadingMessages(true);
    
    try {
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
        setMessages([]);
        return;
      }

      setMessages(data);

      // Cache profiles for messages
      await fetchProfiles(data);
      
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Fetch profiles for messages
  const fetchProfiles = async (messagesData: Message[]) => {
    if (!messagesData.length) return;
    
    // Get unique sender IDs
    const senderIds = Array.from(new Set(messagesData.map(msg => msg.sender_id)));
    const missingIds = senderIds.filter(id => !profiles[id]);

    if (missingIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, family_id")
        .in("id", missingIds);

      if (profilesData) {
        const newProfiles = { ...profiles };
        profilesData.forEach(profile => {
          newProfiles[profile.id] = profile;
        });
        setProfiles(newProfiles);
      }
    }
  };

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!selectedChat) return;

    // Initial fetch
    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`room-${selectedChat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT", 
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${selectedChat.id}`
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Update messages
          setMessages(current => [...current, newMessage]);
          
          // Fetch profile for new message sender if needed
          if (!profiles[newMessage.sender_id]) {
            const { data } = await supabase
              .from("profiles")
              .select("id, name, avatar_url, family_id")
              .eq("id", newMessage.sender_id)
              .single();
              
            if (data) {
              setProfiles(current => ({
                ...current,
                [data.id]: data
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat]);

  // Send message
  const handleSendMessage = async (content: string) => {
    if (!user || !selectedChat) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          chat_id: selectedChat.id,
          sender_id: user.id,
          content,
        });

      if (error) throw error;
      
      // No need to manually refetch as the realtime subscription will update the UI
      
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout title="Messages" requireAuth={true}>
      <div className="container max-w-6xl mx-auto flex h-[calc(100vh-16rem)] overflow-hidden">
        {/* Chats sidebar */}
        <ChatSidebar 
          chats={chats} 
          isLoading={isLoadingChats} 
          selectedChat={selectedChat} 
          onSelectChat={(chat) => {
            setSelectedChat(chat);
            setMessages([]);
          }} 
        />

        {/* Chat window */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          {selectedChat ? (
            <>
              <ChatHeader chat={selectedChat} />
              
              {isLoadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <MessageList messages={messages} profiles={profiles} />
              )}
              
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
