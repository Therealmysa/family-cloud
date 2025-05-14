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

// Define a type for the response from join_family_by_invite function
interface JoinFamilyResponse {
  success: boolean;
  message: string;
  family_id?: string;
}

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
      // Use a server-side RPC function
      const { data: result, error } = await supabase
        .rpc('join_family_by_invite', {
          invite_code: data.inviteCode.toUpperCase(),
          user_id: user.id
        });

      if (error) throw error;

      if (!result || result.success !== true) {
        throw new Error(result?.message || "Invalid invite code or failed to join family");
      }

      toast({
        title: "Success!",
        description: "You've successfully joined the family.",
        variant: "success",
      });

      // Redirect to the home page
      navigate('/');
    } catch (error: any) {
      console.error("Join family error:", error);
      toast({
        title: "Error joining family",
        description: error.message || "Failed to join family. Please check the invite code and try again.",
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
