
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const LastMessageWidget = () => {
  const { profile } = useAuth();
  const [lastMessage, setLastMessage] = useState<{
    content: string;
    timestamp: string;
    sender_name: string;
    sender_avatar: string | null;
    chat_id: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastMessage = async () => {
      if (!profile?.family_id) return;

      try {
        // Get all chats for the family
        const { data: chats } = await supabase
          .from("chats")
          .select("id")
          .eq("family_id", profile.family_id);

        if (!chats || chats.length === 0) {
          setLoading(false);
          return;
        }

        const chatIds = chats.map(chat => chat.id);

        // Get the last message from any chat
        const { data: messages } = await supabase
          .from("messages")
          .select(`
            id, 
            content, 
            timestamp, 
            chat_id,
            sender: profiles!messages_sender_id_fkey(name, avatar_url)
          `)
          .in("chat_id", chatIds)
          .order("timestamp", { ascending: false })
          .limit(1);

        if (messages && messages.length > 0) {
          const message = messages[0];
          setLastMessage({
            content: message.content,
            timestamp: message.timestamp,
            sender_name: message.sender?.name || "Unknown",
            sender_avatar: message.sender?.avatar_url,
            chat_id: message.chat_id
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

  return (
    <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <span>Last Message</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
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
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-muted/70 p-2 rounded-lg">
              <Avatar className="h-10 w-10 border border-primary/20">
                <AvatarImage src={lastMessage.sender_avatar || undefined} />
                <AvatarFallback className="text-sm bg-primary/10 text-primary">
                  {lastMessage.sender_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-base font-medium">{lastMessage.sender_name}</span>
              <span className="text-sm font-semibold text-foreground ml-auto">
                {formatTime(lastMessage.timestamp)}
              </span>
            </div>
            <p className="text-base text-foreground bg-muted/70 p-3 rounded-lg rounded-tl-none">
              {lastMessage.content}
            </p>
            <Button 
              asChild 
              variant="primary" 
              size="sm" 
              className="w-full md:w-auto"
            >
              <Link to="/messages">
                View all messages
                <svg className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <MessageSquare className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-base text-muted-foreground">
              No messages yet. Start a conversation with your family!
            </p>
            <Button 
              asChild 
              variant="primary"
              size="sm"
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
