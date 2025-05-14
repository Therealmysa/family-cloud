import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Media, isVideoFile, isVideoUrl } from "@/types/media";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile";

interface MediaContentProps {
  media: Media;
  onMediaUpdated: () => void;
  onMediaDeleted: () => void;
  familyId: string | undefined;
}

export function MediaContent({
  media,
  onMediaUpdated,
  onMediaDeleted,
  familyId,
}: MediaContentProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobile = useIsMobile();

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    setIsPlaying(false);
  }, [media.url]);

  const handleDeleteMedia = async () => {
    if (!media.id) {
      toast({
        title: "Error",
        description: "Media ID is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete the media item from the database
      const { error: deleteError } = await supabase
        .from("media")
        .delete()
        .eq("id", media.id);

      if (deleteError) {
        throw deleteError;
      }

      // Delete the image from storage
      const imageUrlParts = media.url.split('/');
      const imagePath = imageUrlParts.slice(3).join('/');

      const { error: storageError } = await supabase.storage
        .from('images')
        .remove([imagePath]);

      if (storageError) {
        console.error("Error deleting image from storage:", storageError);
        toast({
          title: "Warning",
          description: "Media deleted from database, but could not be deleted from storage. Please contact support.",
          variant: "warning",
        });
      } else {
        toast({
          title: "Success",
          description: "Media deleted successfully.",
        });
      }

      onMediaDeleted();
    } catch (error: any) {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete media.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          {isVideoFile(new File([], media.url)) || isVideoUrl(media.url) ? (
            <video
              ref={videoRef}
              src={media.url}
              controls
              className="w-full h-full object-cover rounded-md"
              onClick={togglePlay}
            />
          ) : (
            <img
              src={media.url}
              alt={media.title}
              className="w-full h-full object-cover rounded-md"
            />
          )}
        </AspectRatio>

        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user?.id === media.user_id && (
                <>
                  <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleDeleteMedia();
                    }}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(media.url);
                  toast({
                    description: "Media URL copied to clipboard.",
                  });
                }}
              >
                Copy media URL
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {media.title}
      </h3>
      <p className="text-sm text-muted-foreground">
        Uploaded on {format(new Date(media.date_uploaded), 'PPP')} by {media?.profile?.name}
      </p>
      <p className="text-muted-foreground">{media.description}</p>
    </div>
  );
}
