
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Media } from "@/types/media";
import { asUUID, asUpdateType } from "@/utils/supabaseHelpers";

const editSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional().nullable(),
});

type EditFormValues = z.infer<typeof editSchema>;

interface MediaEditFormProps {
  media: Media;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MediaEditForm({ media, onSuccess, onCancel }: MediaEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: media.title || "",
      description: media.description || "",
    },
  });

  const onSubmit = async (values: EditFormValues) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('media')
        .update(asUpdateType('media', {
          title: values.title,
          description: values.description
        }))
        .eq('id', asUUID(media.id));
      
      if (error) throw error;
      
      onSuccess();
    } catch (error: any) {
      console.error("Error updating media:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="My special moment" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Share more about this moment..."
                    className="resize-none"
                    rows={3}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
