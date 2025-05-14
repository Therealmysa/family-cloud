
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { asUUID, isError, safeAccess } from "@/utils/supabaseHelpers";

export const LastMessageWidget = () => {
  const { profile } = useAuth();
  const [lastMessage, setLastMessage] = useState<{
    content: string;
    timestamp: string;
    sender_name: string;
    sender_avatar: string | null;
    sender_id: string;
    chat_id: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchLastMessage = async () => {
      if (!profile?.family_id) return;

      try {
        // Get all chats for the family
        const { data: chats, error: chatError } = await supabase
          .from("chats")
          .select("id")
          .eq("family_id", asUUID(profile.family_id));

        if (chatError || !chats || chats.length === 0) {
          setLoading(false);
          return;
        }

        const chatIds = chats.map(chat => chat.id);

        // Get the last message from any chat
        const { data: messages, error: messageError } = await supabase
          .from("messages")
          .select(`
            id, 
            content, 
            timestamp, 
            chat_id,
            sender_id,
            sender: profiles!messages_sender_id_fkey(name, avatar_url, id)
          `)
          .in("chat_id", chatIds)
          .order("timestamp", { ascending: false })
          .limit(1);

        if (messageError || !messages || messages.length === 0) {
          setLoading(false);
          return;
        }

        const message = messages[0];
        
        if (message && !isError(message)) {
          // Safely handle the response data
          const senderData = message.sender && 
            Array.isArray(message.sender) && 
            message.sender.length > 0 ? message.sender[0] : null;
          
          setLastMessage({
            content: message.content || "",
            timestamp: message.timestamp || new Date().toISOString(),
            sender_name: senderData?.name || "Unknown",
            sender_avatar: senderData?.avatar_url || null,
            sender_id: message.sender_id || "",
            chat_id: message.chat_id || ""
          });
        }
      } catch (error) {
        console.error("Error fetching last message:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastMessage();
  }, [profile?.family_id]);

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

  // Truncate message content based on available space
  const truncateMessage = (content: string, isCompact: boolean = false) => {
    const limit = isCompact ? 60 : 120;
    if (content.length <= limit) return content;
    return content.substring(0, limit) + '...';
  };

  // Create a profile object for the ProfileAvatar component
  const senderProfile = lastMessage ? {
    id: lastMessage.sender_id,
    name: lastMessage.sender_name,
    avatar_url: lastMessage.sender_avatar,
    family_id: profile?.family_id || null
  } : null;

  return (
    <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden h-full">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <span>Last Message</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex flex-col h-[calc(100%-60px)]">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        ) : lastMessage ? (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-center gap-2 bg-muted/70 dark:bg-gray-700/70 p-2 sm:p-3 rounded-lg mx-1 sm:mx-0 shadow-sm">
              <ProfileAvatar 
                profile={senderProfile} 
                size={isMobile ? "sm" : "md"}
                className="border border-primary/20"
              />
              <span className="text-sm sm:text-base font-medium line-clamp-1">{lastMessage.sender_name}</span>
              <span className="text-xs font-semibold text-foreground ml-auto">
                {formatTime(lastMessage.timestamp)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm sm:text-base text-foreground bg-muted/70 dark:bg-gray-700/70 p-3 rounded-lg rounded-tl-none mx-1 sm:mx-0 shadow-sm">
                {truncateMessage(lastMessage.content, isMobile)}
              </p>
            </div>
            <Button 
              asChild 
              variant="primary" 
              size={isMobile ? "sm" : "sm"} 
              className="w-full sm:w-auto mt-auto"
            >
              <Link to="/messages" className="flex items-center justify-center gap-1">
                View all messages
                <svg className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              No messages yet. Start a conversation with your family!
            </p>
            <Button 
              asChild 
              variant="primary"
              size={isMobile ? "sm" : "sm"}
              className="mt-auto"
            >
              <Link to="/messages">
                Start messaging
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
