import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { ChatSidebar } from "@/components/messages/ChatSidebar";
import { ChatContainer } from "@/components/messages/ChatContainer";
import { CreateConversation } from "@/components/messages/CreateConversation";
import { useChats } from "@/hooks/useChats";
import { useMessages } from "@/hooks/useMessages";
import { Chat } from "@/types/chat";
import { useIsMobile } from "@/hooks/use-mobile";

const Messages = () => {
  const { user } = useAuth();
  const { 
    chats, 
    selectedChat, 
    setSelectedChat, 
    isLoadingChats, 
    refetchChats 
  } = useChats(user?.id);

  const { 
    messages, 
    profiles, 
    isLoadingMessages, 
    sendMessage 
  } = useMessages(selectedChat, user?.id);
  
  const isMobile = useIsMobile();
  const [showChatList, setShowChatList] = useState(true);

  // Check for selected chat from member profile
  useEffect(() => {
    const handleChatSelected = (event: CustomEvent) => {
      const { chatId } = event.detail;
      if (chatId && chats) {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
          setSelectedChat(chat);
          if (isMobile) {
            setShowChatList(false);
          }
        }
      }
    };

    // Check if there's a stored chat ID in sessionStorage
    const storedChatId = sessionStorage.getItem("selectedChatId");
    if (storedChatId && chats) {
      const chat = chats.find(c => c.id === storedChatId);
      if (chat) {
        setSelectedChat(chat);
        if (isMobile) {
          setShowChatList(false);
        }
        // Clear after using it
        sessionStorage.removeItem("selectedChatId");
      }
    }

    // Listen for the chatSelected event
    window.addEventListener("chatSelected", handleChatSelected as EventListener);

    return () => {
      window.removeEventListener("chatSelected", handleChatSelected as EventListener);
    };
  }, [chats, setSelectedChat, isMobile]);

  // Toggle between chat list and chat content on mobile
  useEffect(() => {
    if (isMobile) {
      setShowChatList(!selectedChat);
    } else {
      setShowChatList(true);
    }
  }, [selectedChat, isMobile]);

  // Handle new chat creation
  const handleChatCreated = (newChat: Chat) => {
    console.log("New chat created:", newChat);
    refetchChats();
    setSelectedChat(newChat);
    if (isMobile) {
      setShowChatList(false);
    }
  };
  
  // Handle chat selection
  const handleChatSelected = (chat: Chat) => {
    setSelectedChat(chat);
    if (isMobile) {
      setShowChatList(false);
    }
  };
  
  // Handle back to list on mobile
  const handleBackToList = () => {
    setShowChatList(true);
  };

  // Add debugging for RLS policy check
  useEffect(() => {
    // Check if RLS policies are in effect
    const checkRlsPolicies = async () => {
      if (!user) return;
      
      console.log("Checking RLS policies for user:", user.id);
      
      try {
        // Attempt to read chats table metadata
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .limit(1);
          
        console.log("RLS policy check result:", { data, error });
        
        if (error) {
          console.error("RLS policy check failed:", error);
          toast({
            title: "Error",
            description: "There might be an issue with database permissions. Please contact support.",
            variant: "destructive",
          });
        }
      } catch (e) {
        console.error("Error checking RLS policies:", e);
      }
    };
    
    if (user) {
      checkRlsPolicies();
    }
  }, [user]);

  return (
    <MainLayout title="Messages" requireAuth={true}>
      <div className="flex flex-col sm:flex-row h-[calc(100vh-140px)] overflow-hidden rounded-md shadow-lg border border-border/30 mx-0 my-0">
        {/* Chats sidebar - show only when showChatList is true on mobile */}
        {(!isMobile || showChatList) && (
          <div className="w-full sm:w-[350px] lg:w-[400px] border-r border-r-border/30 bg-white dark:bg-gray-800/60 flex flex-col h-full">
            <div className="p-4 border-b border-b-border/30 flex justify-between items-center bg-muted/20">
              <h2 className="text-lg font-medium">Messages</h2>
              <CreateConversation onChatCreated={handleChatCreated} />
            </div>
            
            <ChatSidebar 
              chats={chats} 
              isLoading={isLoadingChats} 
              selectedChat={selectedChat} 
              onSelectChat={handleChatSelected} 
            />
          </div>
        )}

        {/* Chat window - show only when showChatList is false on mobile */}
        {(!isMobile || !showChatList) && (
          <div className="flex-1 flex flex-col bg-gray-50/80 dark:bg-gray-900/60 h-full">
            <ChatContainer
              selectedChat={selectedChat}
              messages={messages}
              profiles={profiles}
              isLoadingMessages={isLoadingMessages}
              onSendMessage={sendMessage}
              onBackToList={handleBackToList}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Messages;
