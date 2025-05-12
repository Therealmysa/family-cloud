
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
        () => {
          refetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat, refetchMessages]);

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
    } catch (error: any) {
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
          onSelectChat={setSelectedChat} 
        />

        {/* Chat window */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          {selectedChat ? (
            <>
              <ChatHeader chat={selectedChat} />
              <MessageList messages={messages} profiles={profiles} />
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
