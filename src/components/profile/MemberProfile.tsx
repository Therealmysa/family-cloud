
import { useState } from "react";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MemberProfileProps {
  member: Profile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberProfile({ member, isOpen, onClose }: MemberProfileProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleSendMessage = async () => {
    if (!member || !user) return;
    
    setIsCreatingChat(true);
    try {
      // Check if a direct message already exists between the users
      const { data: existingChats, error: chatError } = await supabase
        .from("chats")
        .select("id, members")
        .eq("type", "direct")
        .contains("members", [user.id, member.id]);

      if (chatError) throw chatError;

      let chatId;
      
      if (existingChats && existingChats.length > 0) {
        // Find the chat where members are exactly these two users
        const directChat = existingChats.find(chat => 
          chat.members.length === 2 && 
          chat.members.includes(user.id) && 
          chat.members.includes(member.id)
        );
        
        if (directChat) {
          chatId = directChat.id;
        }
      }
      
      // Create a new chat if none exists
      if (!chatId) {
        const { data: newChat, error: createError } = await supabase
          .from("chats")
          .insert({
            type: "direct",
            members: [user.id, member.id],
            family_id: member.family_id
          })
          .select("id")
          .single();

        if (createError) throw createError;
        chatId = newChat.id;
      }
      
      // Navigate to messages page with the chat ID
      onClose();
      navigate("/messages");
      
      // Use setTimeout to ensure the Messages page has loaded before trying to select the chat
      setTimeout(() => {
        // Store the selected chat ID in sessionStorage for the Messages page to pick up
        sessionStorage.setItem("selectedChatId", chatId);
        // Dispatch an event to notify the Messages page about the selected chat
        window.dispatchEvent(new CustomEvent("chatSelected", { detail: { chatId } }));
      }, 100);
      
    } catch (error: any) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to start a conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Member Profile</DialogTitle>
          <DialogDescription>
            View profile information and contact options
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={member.avatar_url || ""} />
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {member.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-semibold">{member.name}</h2>
          {member.is_admin && (
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full mt-1">
              Administrator
            </span>
          )}
          
          {member.bio && (
            <p className="text-muted-foreground mt-4 text-center max-w-xs">{member.bio}</p>
          )}
        </div>
        
        <div className="flex justify-center gap-4 mt-2">
          <Button 
            variant="outline" 
            onClick={handleSendMessage}
            disabled={isCreatingChat || user?.id === member.id}
            className="w-full"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {isCreatingChat ? "Creating chat..." : "Send Message"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
