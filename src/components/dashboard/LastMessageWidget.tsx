
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

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
    <Card className="border-none shadow-soft hover:shadow-card transition-all duration-300 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2 border-b border-border/50">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-primary/10">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
          </div>
          <span>Last Message</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12 ml-auto" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : lastMessage ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarImage src={lastMessage.sender_avatar || undefined} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {lastMessage.sender_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{lastMessage.sender_name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {formatTime(lastMessage.timestamp)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded-lg rounded-tl-none">
              {lastMessage.content}
            </p>
            <Link 
              to="/messages" 
              className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1 group"
            >
              <span>View all messages</span>
              <svg className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <div className="p-3 rounded-full bg-muted">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No messages yet. Start a conversation with your family!
            </p>
            <Link 
              to="/messages" 
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              Start messaging
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
