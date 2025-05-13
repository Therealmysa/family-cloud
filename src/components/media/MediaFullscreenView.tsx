
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { FileDown, X } from "lucide-react";

interface MediaFullscreenViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string;
  mediaTitle: string;
  onDownload: () => void;
}

export function MediaFullscreenView({
  open,
  onOpenChange,
  mediaUrl,
  mediaTitle,
  onDownload
}: MediaFullscreenViewProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-screen p-0 max-w-full flex items-center justify-center bg-black/95">
        <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
          <img 
            src={mediaUrl} 
            alt={mediaTitle} 
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Improved visibility for buttons - semi-transparent background and better positioning */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button 
              variant="secondary" 
              size="icon"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white border-none rounded-full w-10 h-10 shadow-md"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="absolute bottom-4 right-4 z-10">
            <Button
              variant="secondary"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white border-none rounded-full shadow-md flex items-center gap-2 px-4"
              onClick={onDownload}
            >
              <FileDown className="h-5 w-5" />
              Download
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
