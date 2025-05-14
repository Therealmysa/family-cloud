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
import { Media } from "@/types/media";
import { asUpdateType, asUUID } from "@/utils/supabaseHelpers";

const editMediaSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

type EditMediaFormValues = z.infer<typeof editMediaSchema>;

interface MediaEditFormProps {
  media: Media;
  onCancel: () => void;
  onSuccess: () => void;
}

export function MediaEditForm({ media, onCancel, onSuccess }: MediaEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditMediaFormValues>({
    resolver: zodResolver(editMediaSchema),
    defaultValues: {
      title: media.title,
      description: media.description || "",
    },
  });

  const onSubmit = async (values: EditMediaFormValues) => {
    setIsSubmitting(true);
    try {
      // Update media record
      const { error } = await supabase
        .from('media')
        .update(asUpdateType('media', {
          title: values.title,
          description: values.description,
        }))
        .eq('id', asUUID(media.id));

      if (error) {
        console.error("Media update error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      toast({
        description: "Photo details updated successfully",
      });
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast({
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Photo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
