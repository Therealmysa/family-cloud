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
      // Appeler la RPC pour créer la famille et lier l'utilisateur à la famille
      const { data: family, error: familyError } = await supabase
        .rpc('create_family_and_link_profile', {
          _invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          _name: data.name,
        });

      if (familyError) throw familyError;

      toast({
        title: "Family created!",
        description: "Your family has been successfully created and linked.",
        variant: "success",
      });

      // Rediriger vers le dashboard après le succès
      navigate("/dashboard");
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
