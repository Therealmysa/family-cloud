
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizontal, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type Comment = {
  id: string;
  media_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    name: string;
    avatar_url: string | null;
  };
};

interface CommentSectionProps {
  mediaId: string;
}

export function CommentSection({ mediaId }: CommentSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  // Fetch comments for the media item
  const { data: comments = [] } = useQuery({
    queryKey: ['comments', mediaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(name, avatar_url)
        `)
        .eq('media_id', mediaId)
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load comments',
          variant: 'destructive',
        });
        return [];
      }

      return data as Comment[];
    },
    enabled: !!mediaId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('comments')
        .insert({
          media_id: mediaId,
          user_id: user.id,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', mediaId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', mediaId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    },
  });

  // Handle comment submission
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate(newComment.trim());
  };

  // Handle comment deletion
  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  // Set up real-time subscription for comments
  useEffect(() => {
    const channel = supabase
      .channel('comments-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `media_id=eq.${mediaId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['comments', mediaId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `media_id=eq.${mediaId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['comments', mediaId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mediaId, queryClient]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Comments ({comments.length})</h3>
      
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.profile?.avatar_url || ''} />
                <AvatarFallback>
                  {comment.profile?.name?.substring(0, 2).toUpperCase() || ''}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{comment.profile?.name}</p>
                    {user?.id === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatDate(comment.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
      )}

      <Separator />
      
      {user ? (
        <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback>
              {user?.email?.substring(0, 2).toUpperCase() || ''}
            </AvatarFallback>
          </Avatar>
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!newComment.trim() || addCommentMutation.isPending}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">Sign in to add a comment</p>
      )}
    </div>
  );
}
