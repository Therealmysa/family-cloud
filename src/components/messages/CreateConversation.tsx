
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import { Chat } from "@/types/chat";
import { useConversationMembers } from "@/hooks/useConversationMembers";
import { SearchMembers } from "./SearchMembers";
import { MemberList } from "./MemberList";
import { createNewChat } from "@/utils/chatUtils";

type CreateConversationProps = {
  onChatCreated: (chat: Chat) => void;
};

export const CreateConversation = ({ onChatCreated }: CreateConversationProps) => {
  const { user, profile, session } = useAuth();
  const [open, setOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const {
    filteredMembers,
    selectedMembers,
    isLoading,
    searchQuery,
    setSearchQuery,
    toggleMemberSelection,
    setSelectedMembers
  } = useConversationMembers(profile?.family_id || null, user?.id || null, open);
  
  // Check authentication when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    
    if (newOpen) {
      // Debug log for authentication
      if (user) {
        console.log("Authenticated user in CreateConversation:", user.id);
        console.log("User profile in CreateConversation:", profile);
        if (session) {
          console.log("Session in CreateConversation - expires:", new Date(session.expires_at * 1000).toISOString());
          console.log("Session token starts with:", session.access_token.substring(0, 10) + "...");
        } else {
          console.error("No session object found in CreateConversation!");
          setAuthError("Session not available. Please refresh the page and try again.");
        }
      } else {
        console.error("No authenticated user found in CreateConversation!");
        setAuthError("No authenticated user found. Please sign in again.");
      }
    } else {
      // Clear any errors when closing
      setAuthError(null);
    }
  };

  const handleCreateChat = async () => {
    if (!user || selectedMembers.length === 0 || !profile?.family_id) {
      toast({
        title: "Error",
        description: "Please select at least one family member",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const newChat = await createNewChat(user.id, selectedMembers, profile.family_id);
      
      if (newChat) {
        onChatCreated(newChat);
        setOpen(false);
      }
    } finally {
      setIsCreating(false);
      setSelectedMembers([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Select family members to start a conversation with.
          </DialogDescription>
        </DialogHeader>
        
        {authError && (
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-md text-red-700 dark:text-red-300 mb-4">
            {authError}
          </div>
        )}
        
        <div className="space-y-4 py-4">
          <SearchMembers 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          
          <MemberList
            filteredMembers={filteredMembers}
            selectedMembers={selectedMembers}
            isLoading={isLoading}
            toggleMemberSelection={toggleMemberSelection}
            searchQuery={searchQuery}
          />
          
          <div className="flex justify-end">
            <Button
              onClick={handleCreateChat}
              disabled={selectedMembers.length === 0 || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Start Conversation"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
