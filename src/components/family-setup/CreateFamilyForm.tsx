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

const createFamilySchema = z.object({
  name: z.string().min(2, "Family name must be at least 2 characters"),
});

type CreateFamilyFormValues = z.infer<typeof createFamilySchema>;

export default function CreateFamilyForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateFamilyFormValues>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      name: "",
    },
  });

  const handleCreateFamily = async (data: CreateFamilyFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Create new family - generate invite code directly here to avoid RLS issues
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name: data.name,
          invite_code: inviteCode,
        })
        .select('id')
        .single();

      if (familyError) throw familyError;

      // Update user profile with family_id and admin status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          family_id: family.id,
          is_admin: true,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Family created!",
        description: "Your family has been successfully created.",
        variant: "success",
      });

      // Create the default family group chat
      const { error: chatError } = await supabase
        .from('chats')
        .insert({
          family_id: family.id,
          type: 'group',
          members: [user.id],
        });

      if (chatError) {
        console.error("Error creating family chat:", chatError);
        toast({
          title: "Warning",
          description: "Family created, but group chat creation failed.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Chat created",
          description: "Family group chat has been created.",
          variant: "success",
        });
      }

      // Redirect to the home page
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error creating family",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreateFamily)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family Name</FormLabel>
              <FormControl>
                <Input placeholder="The Smiths" {...field} />
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
              Creating Family
            </div>
          ) : (
            "Create Family"
          )}
        </Button>
      </form>
    </Form>
  );
}
