
import { Play } from "lucide-react";
import { Media } from "@/types/media";

interface MediaItemProps {
  item: Media;
  onClick: (item: Media) => void;
}

export const MediaItem = ({ item, onClick }: MediaItemProps) => {
  // Check if an item is a video
  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg)$/i) !== null;
  };

  return (
    <div 
      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative"
      onClick={() => onClick(item)}
    >
      {isVideo(item.url) ? (
        <div className="relative h-full w-full">
          <video 
            src={item.url} 
            className="w-full h-full object-cover"
            poster={item.thumbnail_url}
            preload="metadata"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Play className="h-12 w-12 text-white" />
          </div>
        </div>
      ) : (
        <img 
          src={item.url} 
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
};
