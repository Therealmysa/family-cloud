import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const joinFamilySchema = z.object({
  inviteCode: z.string().length(6, "Invite code must be exactly 6 characters"),
});

type JoinFamilyFormValues = z.infer<typeof joinFamilySchema>;

export default function JoinFamilyForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JoinFamilyFormValues>({
    resolver: zodResolver(joinFamilySchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  const handleJoinFamily = async (data: JoinFamilyFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Find family by invite code
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select('id')
        .eq('invite_code', data.inviteCode.toUpperCase())
        .single();

      if (familyError) {
        if (familyError.code === 'PGRST116') {
          throw new Error("Invalid invite code. Please check and try again.");
        }
        throw familyError;
      }

      // Update user profile with found family_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          family_id: family.id,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Success!",
        description: "You've successfully joined the family.",
        variant: "success",
      });

      // Add user to the family group chat
      const { data: familyChat, error: chatQueryError } = await supabase
        .from('chats')
        .select('id, members')
        .eq('family_id', family.id)
        .eq('type', 'group')
        .single();

      if (!chatQueryError && familyChat) {
        const updatedMembers = [...familyChat.members, user.id];
        
        await supabase
          .from('chats')
          .update({ members: updatedMembers })
          .eq('id', familyChat.id);
      }

      // Redirect to the home page
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error joining family",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleJoinFamily)} className="space-y-4">
        <FormField
          control={form.control}
          name="inviteCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family Invite Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="ABC123" 
                  {...field} 
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  value={field.value.toUpperCase()} 
                  maxLength={6}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Joining Family
            </div>
          ) : (
            "Join Family"
          )}
        </Button>
      </form>
    </Form>
  );
}
