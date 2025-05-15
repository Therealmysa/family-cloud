
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/message";
import { Profile } from "@/types/profile";
import { Chat } from "@/types/chat";
import { toast } from "@/components/ui/use-toast";

export function useMessages(selectedChat: Chat | null, userId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch messages for selected chat
  const fetchMessages = async () => {
    if (!selectedChat || !userId) return;
    
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

      console.log("Fetched messages:", data);
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
        .select("id, name, avatar_url, family_id, email, is_admin")
        .in("id", missingIds);

      if (profilesData) {
        const newProfiles: Record<string, Profile> = { ...profiles };
        profilesData.forEach(profile => {
          newProfiles[profile.id] = profile;
        });
        setProfiles(newProfiles);
      }
    }
  };

  // Send message
  const handleSendMessage = async (content: string) => {
    if (!userId || !selectedChat) return;

    try {
      console.log("Sending message:", {
        chat_id: selectedChat.id,
        sender_id: userId,
        content
      });
      
      const { error } = await supabase
        .from("messages")
        .insert({
          chat_id: selectedChat.id,
          sender_id: userId,
          content,
        });

      if (error) {
        console.error("Error inserting message:", error);
        throw error;
      }
      
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

  // Helper function to truncate message content
  const truncateMessage = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!selectedChat) return;

    // Initial fetch
    fetchMessages();

    console.log("Setting up realtime subscription for chat:", selectedChat.id);
    
    // Set up realtime subscription using the newer channel API
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
          console.log("New message received:", payload);
          
          const newMessage = payload.new as Message;
          
          // Update messages
          setMessages(current => [...current, newMessage]);
          
          // Fetch profile for new message sender if needed
          if (!profiles[newMessage.sender_id]) {
            const { data } = await supabase
              .from("profiles")
              .select("id, name, avatar_url, family_id, email, is_admin")
              .eq("id", newMessage.sender_id)
              .single();
              
            if (data) {
              setProfiles(current => ({
                ...current,
                [data.id]: data as Profile
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Removing channel for chat:", selectedChat.id);
      supabase.removeChannel(channel);
    };
  }, [selectedChat]);

  return {
    messages,
    profiles,
    isLoadingMessages,
    sendMessage: handleSendMessage,
    truncateMessage
  };
}
