
import { useEffect } from "react";
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

  // Handle new chat creation
  const handleChatCreated = (newChat: Chat) => {
    console.log("New chat created:", newChat);
    refetchChats();
    setSelectedChat(newChat);
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
      <div className="container max-w-6xl mx-auto flex h-[calc(100vh-16rem)] overflow-hidden">
        {/* Chats sidebar with create conversation button */}
        <div className="w-full sm:w-80 border-r bg-white dark:bg-gray-800/50 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium">Messages</h2>
            <CreateConversation onChatCreated={handleChatCreated} />
          </div>
          
          <ChatSidebar 
            chats={chats} 
            isLoading={isLoadingChats} 
            selectedChat={selectedChat} 
            onSelectChat={(chat) => {
              setSelectedChat(chat);
            }} 
          />
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          <ChatContainer
            selectedChat={selectedChat}
            messages={messages}
            profiles={profiles}
            isLoadingMessages={isLoadingMessages}
            onSendMessage={sendMessage}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
