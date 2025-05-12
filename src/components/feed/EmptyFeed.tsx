
import { Button } from "@/components/ui/button";

type EmptyFeedProps = {
  onCreatePost: () => void;
  hasPostedToday: boolean;
};

export const EmptyFeed = ({ onCreatePost, hasPostedToday }: EmptyFeedProps) => {
  return (
    <div className="text-center p-8">
      <h3 className="text-xl font-medium mb-2">No moments yet</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Be the first in your family to share a moment today!
      </p>
      <Button onClick={onCreatePost} disabled={hasPostedToday}>
        {hasPostedToday ? "You already posted today" : "Share Your Moment"}
      </Button>
    </div>
  );
};
