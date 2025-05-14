import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, X } from 'lucide-react';
import { Media } from '@/types/media';
import { asUpdateType } from '@/utils/supabaseHelpers';

const mediaSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

type MediaEditFormValues = z.infer<typeof mediaSchema>;

interface MediaEditFormProps {
  media: Media;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MediaEditForm = ({ media, onSuccess, onCancel }: MediaEditFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MediaEditFormValues>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      title: media.title,
      description: media.description || '',
    },
  });

  const handleSubmit = async (data: MediaEditFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('media')
        .update(asUpdateType('media', {
          title: data.title,
          description: data.description
        }))
        .eq('id', media.id);
      
      if (error) throw error;
      
      // Success
      onSuccess();
    } catch (error: any) {
      console.error('Error updating media:', error);
      toast({
        variant: "destructive",
        description: `Update failed: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
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
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={onCancel}>
                <X className="mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Media'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
