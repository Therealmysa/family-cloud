
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

const createFamilySchema = z.object({
  name: z.string().min(2, "Family name must be at least 2 characters"),
});

const joinFamilySchema = z.object({
  inviteCode: z.string().length(6, "Invite code must be exactly 6 characters"),
});

type CreateFamilyFormValues = z.infer<typeof createFamilySchema>;
type JoinFamilyFormValues = z.infer<typeof joinFamilySchema>;

export default function SetupFamily() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("create");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createFamilyForm = useForm<CreateFamilyFormValues>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      name: "",
    },
  });

  const joinFamilyForm = useForm<JoinFamilyFormValues>({
    resolver: zodResolver(joinFamilySchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  // Redirect if user already has a family
  if (profile?.family_id) {
    navigate('/');
    return null;
  }

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
    <MainLayout title="Set Up Your Family" requireAuth={true}>
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to FamilyCloud
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "create" 
                ? "Create your family to get started" 
                : "Join an existing family by entering the invite code"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="create">Create Family</TabsTrigger>
                <TabsTrigger value="join">Join Family</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create">
                <Form {...createFamilyForm}>
                  <form onSubmit={createFamilyForm.handleSubmit(handleCreateFamily)} className="space-y-4">
                    <FormField
                      control={createFamilyForm.control}
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
              </TabsContent>
              
              <TabsContent value="join">
                <Form {...joinFamilyForm}>
                  <form onSubmit={joinFamilyForm.handleSubmit(handleJoinFamily)} className="space-y-4">
                    <FormField
                      control={joinFamilyForm.control}
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
