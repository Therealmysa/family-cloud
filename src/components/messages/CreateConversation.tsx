
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquarePlus, Search, Loader2 } from "lucide-react";
import { Chat } from "@/types/chat";

type CreateConversationProps = {
  onChatCreated: (chat: Chat) => void;
};

export const CreateConversation = ({ onChatCreated }: CreateConversationProps) => {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<Profile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch family members when dialog opens
  useEffect(() => {
    if (open && profile?.family_id) {
      fetchFamilyMembers();
    }
  }, [open, profile?.family_id]);

  const fetchFamilyMembers = async () => {
    if (!user || !profile?.family_id) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("family_id", profile.family_id)
        .neq("id", user.id); // Exclude current user
      
      if (error) throw error;
      
      setFamilyMembers(data || []);
    } catch (error: any) {
      console.error("Error fetching family members:", error);
      toast({
        title: "Error",
        description: "Failed to load family members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateChat = async () => {
    if (!user || selectedMembers.length === 0) return;
    
    setIsCreating(true);
    
    try {
      const chatType = selectedMembers.length > 1 ? "group" : "private";
      const members = [user.id, ...selectedMembers];
      
      const { data: newChat, error } = await supabase
        .from("chats")
        .insert({
          type: chatType,
          members: members,
          family_id: profile?.family_id,
        })
        .select("*")
        .single();
      
      if (error) throw error;
      
      // For private chats, fetch the other member's profile
      if (chatType === "private" && newChat) {
        const otherMemberId = selectedMembers[0];
        const { data: otherMemberData } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .eq("id", otherMemberId)
          .single();
          
        if (otherMemberData) {
          const chatWithMember = {
            ...newChat,
            otherMember: otherMemberData
          };
          
          onChatCreated(chatWithMember);
          setOpen(false);
          toast({
            title: "Success",
            description: `Chat with ${otherMemberData.name} created successfully`,
          });
        }
      } else if (newChat) {
        // Group chat
        onChatCreated(newChat);
        setOpen(false);
        toast({
          title: "Success",
          description: "Group chat created successfully",
        });
      }
    } catch (error: any) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
      setSelectedMembers([]);
    }
  };

  // Filter members based on search query
  const filteredMembers = searchQuery
    ? familyMembers.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : familyMembers;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search family members..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => toggleMemberSelection(member.id)}
                      id={`member-${member.id}`}
                    />
                    <label 
                      htmlFor={`member-${member.id}`}
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                    >
                      <Avatar>
                        <AvatarImage src={member.avatar_url || ""} />
                        <AvatarFallback>
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  {searchQuery ? "No members found" : "No family members available"}
                </p>
              )}
            </div>
          )}
          
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
