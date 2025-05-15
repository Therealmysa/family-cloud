
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Profile } from "@/types/profile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

interface MemberProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: Profile;
}

export function MemberProfileDialog({ isOpen, onOpenChange, member }: MemberProfileDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const startPrivateChat = async () => {
    if (!user || !member) return;

    setIsCreatingChat(true);

    try {
      // Check if a private chat between these two users already exists
      const { data: existingChats, error: chatError } = await supabase
        .from("chats")
        .select("id")
        .eq("type", "private")
        .contains("members", [user.id, member.id])
        .order("created_at", { ascending: false });

      if (chatError) throw chatError;

      let chatId;

      // If chat exists, use it
      if (existingChats && existingChats.length > 0) {
        chatId = existingChats[0].id;
      } else {
        // Create new chat
        const { data: newChat, error: createError } = await supabase
          .from("chats")
          .insert({
            type: "private",
            members: [user.id, member.id],
            family_id: member.family_id
          })
          .select("id")
          .single();

        if (createError) throw createError;
        chatId = newChat.id;
      }

      // Close dialog and navigate to chat
      onOpenChange(false);
      navigate(`/messages?chat=${chatId}`);
    } catch (error: any) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Member Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <div className="mb-4">
            <ProfileAvatar profile={member} size="lg" />
          </div>
          
          <h3 className="text-xl font-bold">{member.name}</h3>
          
          {member.is_admin && (
            <span className="text-sm text-purple-600 font-medium mt-1">Administrator</span>
          )}
          
          {member.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-4">
              {member.bio}
            </p>
          )}
          
          {user && user.id !== member.id && (
            <Button 
              onClick={startPrivateChat}
              disabled={isCreatingChat}
              className="mt-6"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {isCreatingChat ? "Starting..." : "Send Message"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
