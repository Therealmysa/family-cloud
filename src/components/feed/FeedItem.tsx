
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useState } from "react";
import { MediaDialog } from "../media/MediaDialog";
import { Media } from "@/types/media";
import { useAuth } from "@/hooks/useAuth";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

type FeedItemProps = {
  item: Media;
  onLikeToggle: (mediaId: string, isLiked: boolean) => void;
  likeMutationIsPending: boolean;
};

export const FeedItem = ({ 
  item, 
  onLikeToggle, 
  likeMutationIsPending 
}: FeedItemProps) => {
  const { profile } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card key={item.id} className="overflow-hidden">
        <img 
          src={item.url} 
          alt={item.title}
          className="w-full h-auto object-cover max-h-[500px] cursor-pointer"
          loading="lazy"
          onClick={() => setDialogOpen(true)}
        />
        <CardContent className="pt-4">
          <div className="flex items-center space-x-4 mb-2">
            <ProfileAvatar profile={item.profile} />
            <div>
              <p className="font-medium">{item.profile?.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <h3 className="font-bold text-lg mt-1">{item.title}</h3>
          {item.description && (
            <p className="text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
          )}
        </CardContent>
        <CardFooter className="flex gap-4 pt-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 ${item.is_liked ? 'text-red-500' : ''}`}
            onClick={() => onLikeToggle(item.id, !!item.is_liked)}
            disabled={likeMutationIsPending}
          >
            <Heart className={`h-4 w-4 ${item.is_liked ? 'fill-current' : ''}`} />
            <span>{item.likes_count || 0} {item.likes_count === 1 ? 'Like' : 'Likes'}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setDialogOpen(true)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
          </Button>
        </CardFooter>
      </Card>

      <MediaDialog 
        media={dialogOpen ? item : null} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        familyId={profile?.family_id} 
      />
    </>
  );
};
