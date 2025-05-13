
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
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center text-purple-700 dark:text-purple-400">
          <MessageSquare className="h-5 w-5 mr-2" /> Last Message
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : lastMessage ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={lastMessage.sender_avatar || undefined} />
                <AvatarFallback className="text-xs">
                  {lastMessage.sender_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{lastMessage.sender_name}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {formatTime(lastMessage.timestamp)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {lastMessage.content}
            </p>
            <Link 
              to="/messages" 
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1 inline-block"
            >
              View all messages
            </Link>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No messages yet. Start a conversation with your family!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
