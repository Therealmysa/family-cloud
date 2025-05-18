
import { Skeleton } from "@/components/ui/skeleton";

export function GallerySkeleton() {
  return (
    <div className="space-y-6">
      {/* View mode tabs skeleton */}
      <div className="flex mb-6">
        <Skeleton className="h-10 w-52" />
      </div>
      
      {/* Gallery grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  );
}
