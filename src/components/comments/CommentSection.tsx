
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CommentSection({ mediaId }: { mediaId: string }) {
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
