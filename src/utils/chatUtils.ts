
import { supabase } from "@/integrations/supabase/client";
import { Chat } from "@/types/chat";
import { toast } from "@/components/ui/use-toast";

export async function createNewChat(
  userId: string, 
  selectedMembers: string[], 
  familyId: string | null
): Promise<Chat | null> {
  if (!userId || selectedMembers.length === 0 || !familyId) {
    toast({
      title: "Error",
      description: "Missing required information to create chat",
      variant: "destructive",
    });
    return null;
  }
  
  try {
    // Double-check authentication status
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      throw new Error(`Authentication error: ${sessionError.message}`);
    }
    
    if (!sessionData.session) {
      throw new Error("No valid authentication session found");
    }
    
    console.log("Auth token before chat creation:", sessionData.session.access_token.substring(0, 10) + "...");
    
    // Make sure to explicitly set the chat type as 'group' or 'private'
    const chatType = selectedMembers.length > 1 ? 'group' : 'private';
    const members = [userId, ...selectedMembers];
    
    console.log("Creating chat with:", {
      type: chatType,
      members,
      family_id: familyId
    });
    
    // Create the chat with explicit types
    const { data: newChat, error } = await supabase
      .from("chats")
      .insert({
        type: chatType,
        members: members,
        family_id: familyId,
      })
      .select("*")
      .single();
    
    if (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
    
    console.log("Chat created successfully:", newChat);
    
    // For private chats, fetch the other member's profile
    if (chatType === 'private' && newChat) {
      const otherMemberId = selectedMembers[0];
      const { data: otherMemberData, error: memberError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("id", otherMemberId)
        .single();
        
      if (memberError) {
        console.error("Error fetching member:", memberError);
      }
        
      if (otherMemberData) {
        const chatWithMember: Chat = {
          ...newChat,
          type: chatType as 'group' | 'private',
          otherMember: otherMemberData
        };
        
        toast({
          title: "Success",
          description: `Chat with ${otherMemberData.name} created successfully`,
        });
        
        return chatWithMember;
      }
    }
    
    // Group chat or failed to fetch member profile
    if (newChat) {
      const typedChat: Chat = {
        ...newChat,
        type: chatType as 'group' | 'private'
      };
      
      toast({
        title: "Success",
        description: "Group chat created successfully",
      });
      
      return typedChat;
    }
    
    return null;
  } catch (error: any) {
    console.error("Error creating chat:", error);
    toast({
      title: "Error",
      description: `Failed to create conversation: ${error.message || "Please try again."}`,
      variant: "destructive",
    });
    return null;
  }
}
