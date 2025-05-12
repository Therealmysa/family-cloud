
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FeedSkeleton = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-64 bg-gray-100 dark:bg-gray-800">
            <Skeleton className="h-full w-full" />
          </div>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-4 mb-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
