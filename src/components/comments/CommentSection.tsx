import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Comment } from "@/types/media";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

export function CommentSection({ mediaId }: { mediaId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch comments
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      // Use the database function we created
      const { data, error } = await supabase
        .rpc('get_comments_with_profiles', { media_id_param: mediaId });

      if (error) throw error;
      
      // Check if data exists and is an array
      if (data && Array.isArray(data)) {
        setComments(data as Comment[]);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        description: "Failed to load comments",
        variant: "destructive",
      });
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Post new comment
  const handlePostComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      // Insert directly into the comments table
      const { error } = await supabase
        .from('comments')
        .insert({
          media_id: mediaId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment("");
      fetchComments(); // Refetch comments
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        description: "Failed to post comment",
        variant: "destructive",
      });
    }
  };

  // Set up real-time comments subscription
  useEffect(() => {
    // Initial fetch
    fetchComments();

    // Set up subscription
    const channel = supabase
      .channel("comments-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `media_id=eq.${mediaId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mediaId]);

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Comments</h3>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 max-h-[200px] overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <ProfileAvatar 
                profile={comment.profile} 
                size="sm"
                clickable={!!comment.profile?.id}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{comment.profile?.name}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-2">No comments yet</p>
      )}

      {user && (
        <div className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1"
          />
          <Button 
            size="sm" 
            onClick={handlePostComment}
            disabled={!newComment.trim()}
          >
            Post
          </Button>
        </div>
      )}
    </div>
  );
}
