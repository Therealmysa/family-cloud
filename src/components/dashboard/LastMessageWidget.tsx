
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { isSafeData, safeMessageAccess } from "@/utils/supabaseHelpers";

export function LastMessageWidget() {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchLastMessage();
    }
  }, [user?.id]);

  const fetchLastMessage = async () => {
    try {
      setLoading(true);
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('id')
        .contains('members', [user?.id])
        .limit(10);

      if (chatsError || !chatsData || chatsData.length === 0) {
        setLoading(false);
        return;
      }

      const chatIds = chatsData.map(chat => chat.id);
      
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select(`
          id, content, timestamp, chat_id, sender_id,
          sender:profiles(id, name, avatar_url, family_id)
        `)
        .in('chat_id', chatIds)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (messageError) {
        console.error("Error fetching last message:", messageError);
        setLoading(false);
        return;
      }

      setLastMessage(messageData);
      setLoading(false);
    } catch (error) {
      console.error("Error in LastMessageWidget:", error);
      setLoading(false);
    }
  };

  // Create a safe message object that checks for errors
  const safeMessage = safeMessageAccess(lastMessage, {
    id: '',
    content: '',
    timestamp: new Date().toISOString(),
    chat_id: '',
    sender_id: '',
    sender: [{
      id: '',
      name: 'Unknown',
      avatar_url: null,
      family_id: null
    }]
  });

  // Pull out properties safely
  const {
    content = '',
    timestamp = new Date().toISOString(),
    sender_id = '',
    chat_id = ''
  } = safeMessage;

  // Handle sender data safely
  const sender = Array.isArray(safeMessage.sender) ? safeMessage.sender[0] : safeMessage.sender;
  const senderName = sender?.name || 'Unknown';
  const senderInitial = senderName.charAt(0).toUpperCase();
  const senderAvatar = sender?.avatar_url || null;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Message</CardTitle>
          <CardDescription>Your latest conversation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lastMessage) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Message</CardTitle>
          <CardDescription>Your latest conversation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-gray-500 border border-dashed rounded-md">
            No recent messages found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Message</CardTitle>
        <CardDescription>Your latest conversation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={senderAvatar || undefined} alt={senderName} />
            <AvatarFallback>{senderInitial}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <p className="font-medium leading-none">{senderName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {content}
            </p>
            <p className="text-xs text-gray-500">
              {format(new Date(timestamp), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
