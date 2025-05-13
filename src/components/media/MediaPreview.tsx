
import { Button } from "@/components/ui/button";
import { FileDown, Maximize, Play } from "lucide-react";
import { Media } from "@/types/media";

interface MediaPreviewProps {
  media: Media;
  onFullscreenView: () => void;
  onDownload: () => void;
}

export function MediaPreview({ media, onFullscreenView, onDownload }: MediaPreviewProps) {
  // Check if media is a video
  const isVideo = media.url?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="md:col-span-3 relative">
      {isVideo ? (
        <video 
          src={media.url} 
          controls
          className="w-full h-auto rounded-md object-contain max-h-[500px]"
        />
      ) : (
        <div className="relative group">
          <img 
            src={media.url} 
            alt={media.title} 
            className="w-full h-auto rounded-md object-contain max-h-[500px] cursor-pointer" 
            onClick={onFullscreenView}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              variant="secondary" 
              className="rounded-full p-2 h-8 w-8"
              onClick={onFullscreenView}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Media action buttons */}
      <div className="flex justify-end mt-2 space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="flex items-center gap-1"
        >
          <FileDown className="h-4 w-4" />
          <span>Download</span>
        </Button>
      </div>
    </div>
  );
}
