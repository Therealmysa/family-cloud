
import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Media } from "@/types/media";

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
  return (
    <Card key={item.id} className="overflow-hidden">
      <img 
        src={item.url} 
        alt={item.title}
        className="w-full h-auto object-cover max-h-[500px]"
        loading="lazy"
      />
      <CardContent className="pt-4">
        <div className="flex items-center space-x-4 mb-2">
          <Avatar>
            <AvatarImage src={item.profile?.avatar_url || ""} />
            <AvatarFallback>
              {item.profile?.name?.substring(0, 2).toUpperCase() || ""}
            </AvatarFallback>
          </Avatar>
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
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span>Comment</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
