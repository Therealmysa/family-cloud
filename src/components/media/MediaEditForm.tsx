
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Media } from '@/types/media';

interface MediaEditFormProps {
  media: Media;
  onCancel: () => void;
  onSuccess: () => void;
}

interface FormValues {
  title: string;
  description: string;
}

export function MediaEditForm({ media, onCancel, onSuccess }: MediaEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: media.title,
      description: media.description || '',
    }
  });

  // Mutation for updating media
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const { error } = await supabase
        .from('media')
        .update({
          title: data.title,
          description: data.description || null,
        })
        .eq('id', media.id);

      if (error) throw error;
      return { ...media, ...data };
    },
    onSuccess: (updatedMedia) => {
      // Update cache data
      ["feed", "gallery"].forEach(cacheKey => {
        queryClient.setQueryData<Media[]>([cacheKey, media.profile?.family_id], (oldData) => {
          if (!oldData) return [];
          
          return oldData.map(item => {
            if (item.id === media.id) {
              return {
                ...item,
                title: updatedMedia.title,
                description: updatedMedia.description,
              };
            }
            return item;
          });
        });
      });

      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update photo details",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    updateMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image preview */}
        <div>
          <img 
            src={media.url} 
            alt={media.title} 
            className="w-full h-auto rounded-md object-cover max-h-[400px]" 
          />
        </div>
        
        {/* Edit form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="Photo title"
              className="w-full"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Add a description (optional)"
              className="w-full min-h-[150px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
