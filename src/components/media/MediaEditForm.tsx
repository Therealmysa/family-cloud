import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Media } from '@/types/media';
import { safeTypeCast } from '@/utils/supabaseHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MediaEditForm({ 
  media, 
  onCancel, 
  onSuccess 
}: { 
  media: Media, 
  onCancel: () => void, 
  onSuccess: () => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<{
    title: string;
    description: string;
  }>({
    defaultValues: {
      title: media.title || '',
      description: media.description || '',
    },
  });

  const handleSubmit = async (values: { title: string; description: string }) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('media')
        .update(safeTypeCast('media', {
          title: values.title,
          description: values.description
        }))
        .eq('id', media.id);

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error("Error updating media:", error);
      toast({
        description: "Failed to update media information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register('title')} className="w-full" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...form.register('description')} className="w-full" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update'}
        </Button>
      </div>
    </form>
  );
}
