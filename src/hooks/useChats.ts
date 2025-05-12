
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Chat } from "@/types/chat";
import { toast } from "@/components/ui/use-toast";

export function useChats(userId: string | undefined) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Fetch chats
  const { 
    data: chats = [], 
    isLoading: isLoadingChats, 
    refetch: refetchChats 
  } = useQuery({
    queryKey: ["chats", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .or(`members.cs.{${userId}}`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching chats:", error);
        toast({
          title: "Error",
          description: "Failed to load chats",
          variant: "destructive",
        });
        return [];
      }

      console.log("Fetched chats:", data);

      // For private chats, get the other member's profile
      const enhancedChats: Chat[] = await Promise.all(
        data.map(async (chat) => {
          // Ensure chat.type is cast to the correct type
          const typedChat: Chat = {
            ...chat,
            type: chat.type as 'group' | 'private'
          };
          
          if (typedChat.type === "private") {
            const otherMemberId = typedChat.members.find(id => id !== userId);
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
    enabled: !!userId,
  });

  return {
    chats,
    selectedChat,
    setSelectedChat,
    isLoadingChats,
    refetchChats
  };
}
