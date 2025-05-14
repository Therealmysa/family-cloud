
import { useState } from 'react';
import { X, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { toast } from '@/components/ui/use-toast';
import { Media } from '@/types/media';

interface FullscreenViewProps {
  media: Media;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FullscreenView({ media, open, onOpenChange }: FullscreenViewProps) {
  // Handle download
  const handleDownload = () => {
    if (!media) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = media.url;
    
    // Set the download attribute with a filename
    // Extract the filename from the URL or use the title/default
    const filename = media.title || 
                     media.url.split('/').pop() || 
                     'download.jpg';
    
    link.setAttribute('download', filename);
    
    // Append to the document temporarily
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    toast({
      description: "Download started",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-screen p-0 max-w-full flex items-center justify-center bg-black/95">
        <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
          <img 
            src={media.url} 
            alt={media.title} 
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
              onClick={handleDownload}
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
