
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Grid, User } from "lucide-react";
import { Media } from "@/types/media";
import { GallerySkeleton } from "./GallerySkeleton";
import { EmptyGallery } from "./EmptyGallery";
import { MediaItem } from "./MediaItem";
import { useLanguage } from "@/contexts/LanguageContext";

interface GalleryViewProps {
  isLoading: boolean;
  filteredMedia: Media[];
  onMediaClick: (media: Media) => void;
  viewMode: "all" | "byDate" | "byMember";
  onViewModeChange: (mode: "all" | "byDate" | "byMember") => void;
}

export function GalleryView({
  isLoading,
  filteredMedia,
  onMediaClick,
  viewMode,
  onViewModeChange,
}: GalleryViewProps) {
  const { t } = useLanguage();

  // Group media items by date (YYYY-MM-DD)
  const groupByDate = (media: Media[]) => {
    const groups = media.reduce((acc, item) => {
      const date = new Date(item.date_uploaded || item.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as Record<string, Media[]>);
    
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  // Group media items by member who uploaded
  const groupByMember = (media: Media[]) => {
    const groups = media.reduce((acc, item) => {
      const memberId = item.profile?.id || 'unknown';
      const memberName = item.profile?.name || 'Unknown';
      
      const key = `${memberId}|${memberName}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, Media[]>);
    
    return Object.entries(groups).map(([key, items]) => {
      const [id, name] = key.split('|');
      return { id, name, items };
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return <GallerySkeleton />;
  }

  if (!filteredMedia.length) {
    return <EmptyGallery isSearching={false} />;
  }

  return (
    <div>
      <div className="mb-6">
        <Tabs defaultValue="all" value={viewMode} onValueChange={(v) => onViewModeChange(v as any)}>
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">{t('gallery.all_view')}</span>
            </TabsTrigger>
            <TabsTrigger value="byDate" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">{t('gallery.date_view')}</span>
            </TabsTrigger>
            <TabsTrigger value="byMember" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('gallery.member_view')}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === "all" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <MediaItem key={item.id} item={item} onClick={() => onMediaClick(item)} />
          ))}
        </div>
      )}

      {viewMode === "byDate" && (
        <div className="space-y-10">
          {groupByDate(filteredMedia).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">{formatDate(date)}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <MediaItem key={item.id} item={item} onClick={() => onMediaClick(item)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "byMember" && (
        <div className="space-y-10">
          {groupByMember(filteredMedia).map((group) => (
            <div key={group.id}>
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                {group.name}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.items.map((item) => (
                  <MediaItem key={item.id} item={item} onClick={() => onMediaClick(item)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
