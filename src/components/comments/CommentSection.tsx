
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Comment } from "@/types/media";
import { asCommentInsert } from "@/utils/supabaseHelpers";
import { format } from "date-fns";

export function CommentSection({ mediaId }: { mediaId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Function to fetch comments
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_comments_with_profiles', { media_id_param: mediaId });

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      // Transform data if needed
      setComments(data as Comment[]);
    } catch (error) {
      console.error("Error in comment fetch:", error);
    }
  };

  // Effect to load comments on component mount
  useEffect(() => {
    // Temporarily disabled comment functionality
    // fetchComments();
  }, [mediaId]);

  // Function to post a new comment
  const handlePostComment = async () => {
    if (!commentText.trim() || !user || !profile) return;
    
    setLoading(true);
    try {
      // Prepare comment data with proper typing
      const commentData = asCommentInsert({
        content: commentText.trim(),
        media_id: mediaId,
        user_id: user.id
      });

      // Insert comment
      const { error } = await supabase
        .from("comments")
        .insert(commentData);

      if (error) {
        toast({
          title: "Error posting comment",
          description: error.message,
          variant: "destructive",
        });
        console.error("Error posting comment:", error);
      } else {
        // Clear input and refresh comments
        setCommentText("");
        fetchComments();
        toast({
          title: "Comment posted",
          description: "Your comment has been added successfully.",
        });
      }
    } catch (error) {
      console.error("Error in comment post:", error);
      toast({
        title: "Something went wrong",
        description: "Unable to post your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Temporarily disabled component
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Comments</h3>
      
      <div className="p-4 border border-dashed rounded-md bg-gray-50 dark:bg-gray-900">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Comments are temporarily disabled
        </p>
      </div>
      
      {/* Disabled comment input */}
      <div className="flex gap-2">
        <Input
          disabled
          placeholder="Comments temporarily disabled"
          className="flex-1"
        />
        <Button 
          size="sm" 
          disabled
        >
          Post
        </Button>
      </div>
    </div>
  );
}
