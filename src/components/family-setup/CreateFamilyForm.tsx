
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  familyName: z.string()
    .min(2, {
      message: "Family name must be at least 2 characters.",
    })
    .max(50, {
      message: "Family name must not exceed 50 characters.",
    }),
});

export default function CreateFamilyForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      familyName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a family.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Utiliser la nouvelle fonction qui définit le propriétaire
      const { data, error } = await supabase
        .rpc('create_family_with_owner', {
          family_name: values.familyName,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Family created!",
        description: "Your family has been successfully created.",
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error creating family:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create family. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="familyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your family name" {...field} />
              </FormControl>
              <FormDescription>
                Choose a name for your new family.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Family"
          )}
        </Button>
      </form>
    </Form>
  );
}
