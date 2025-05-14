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
import { toast } from "@/components/ui/use-toast";

const createFamilySchema = z.object({
  name: z.string().min(2, "Family name must be at least 2 characters"),
});

type CreateFamilyFormValues = z.infer<typeof createFamilySchema>;

// Define a type for the response from create_family function
interface CreateFamilyResponse {
  family_id: string;
  invite_code: string;
}

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
      // Create new family using RPC function
      const { data: result, error } = await supabase
        .rpc('create_family', {
          family_name: data.name,
          user_id: user.id
        });

      if (error) throw error;
      
      // Cast result to unknown first, then to our defined interface
      const typedResult = result as unknown as CreateFamilyResponse;
      
      if (!typedResult || !typedResult.family_id) {
        throw new Error("Failed to create family");
      }
      
      toast({
        description: "Your family has been successfully created.",
        variant: "success",
      });

      // Redirect to the home page
      navigate('/');
    } catch (error: any) {
      console.error("Create family error:", error);
      toast({
        description: error.message || "Failed to create family. Please try again.",
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
