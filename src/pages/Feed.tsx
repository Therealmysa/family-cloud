
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { FeedItem } from "@/components/feed/FeedItem";
import { EmptyFeed } from "@/components/feed/EmptyFeed";
import { FeedSkeleton } from "@/components/feed/FeedSkeleton";
import { useFeed } from "@/hooks/useFeed";
import { useIsMobile } from "@/hooks/use-mobile";

const Feed = () => {
  const navigate = useNavigate();
  const { 
    feedItems, 
    isLoading, 
    hasPostedToday, 
    handleLikeToggle,
    likeMutation
  } = useFeed();
  const isMobile = useIsMobile();

  // Handle navigation to post creation
  const handleCreatePost = () => {
    navigate("/create-post");
  };

  return (
    <MainLayout title="Feed" requireAuth={true}>
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daily Moments</h1>
          <Button 
            onClick={handleCreatePost} 
            disabled={hasPostedToday}
            className={`flex items-center gap-2 ${isMobile ? 'py-5' : ''}`}
            variant={hasPostedToday ? "soft" : "primary"}
            size={isMobile ? "default" : "default"}
          >
            <PlusCircle className="h-4 w-4" />
            {hasPostedToday ? "Posted Today" : "Share Moment"}
          </Button>
        </div>

        {isLoading ? (
          <FeedSkeleton />
        ) : feedItems && feedItems.length > 0 ? (
          <div className="space-y-6">
            {feedItems.map((item) => (
              <FeedItem 
                key={item.id} 
                item={item} 
                onLikeToggle={handleLikeToggle}
                likeMutationIsPending={likeMutation.isPending} 
              />
            ))}
          </div>
        ) : (
          <EmptyFeed 
            onCreatePost={handleCreatePost}
            hasPostedToday={hasPostedToday}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Feed;
