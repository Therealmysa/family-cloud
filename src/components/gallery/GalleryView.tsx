import { Calendar, User } from "lucide-react";
import { Media } from "@/types/media";
import { MediaItem } from "./MediaItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GalleryViewProps {
  isLoading: boolean;
  filteredMedia: Media[];
  onMediaClick: (media: Media) => void;
  viewMode: "all" | "byDate" | "byMember";
  onViewModeChange: (mode: "all" | "byDate" | "byMember") => void;
}

export const GalleryView = ({
  isLoading,
  filteredMedia,
  onMediaClick,
  viewMode,
  onViewModeChange,
}: GalleryViewProps) => {
  // Group images by date
  const groupByDate = (images: Media[]) => {
    const grouped: Record<string, Media[]> = {};
    images.forEach((img) => {
      const date = img.date_uploaded;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(img);
    });
    return Object.entries(grouped).sort(
      ([dateA], [dateB]) =>
        new Date(dateB).getTime() - new Date(dateA).getTime()
    );
  };

  // Group images by family member
  const groupByMember = (images: Media[]) => {
    const grouped: Record<
      string,
      { name: string; avatar: string | null; images: Media[] }
    > = {};
    images.forEach((img) => {
      if (img.profile) {
        const userId = img.user_id;
        if (!grouped[userId]) {
          grouped[userId] = {
            name: img.profile.name,
            avatar: img.profile.avatar_url,
            images: [],
          };
        }
        grouped[userId].images.push(img);
      }
    });
    return Object.values(grouped);
  };

  const groupedByDate = groupByDate(filteredMedia);
  const groupedByMember = groupByMember(filteredMedia);

  return (
    <Tabs
      defaultValue="all"
      value={viewMode}
      onValueChange={(value) => onViewModeChange(value as any)}
      className="mb-6"
    >
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Media</TabsTrigger>
        <TabsTrigger value="byDate">By Date</TabsTrigger>
        <TabsTrigger value="byMember">By Family Member</TabsTrigger>
      </TabsList>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <TabsContent value="all" className="mt-0">
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((item) => (
                  <MediaItem key={item.id} item={item} onClick={onMediaClick} />
                ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-500">No media found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="byDate" className="mt-0 space-y-8">
            {groupedByDate.length > 0 ? (
              groupedByDate.map(([date, images]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-purple-500" />
                    <h3 className="font-semibold">
                      {new Date(date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((item) => (
                      <MediaItem
                        key={item.id}
                        item={item}
                        onClick={onMediaClick}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-500">No media found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="byMember" className="mt-0 space-y-8">
            {groupedByMember.length > 0 ? (
              groupedByMember.map((member, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-purple-500" />
                    <h3 className="font-semibold">{member.name}</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {member.images.map((item) => (
                      <MediaItem
                        key={item.id}
                        item={item}
                        onClick={onMediaClick}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-500">No media found</p>
              </div>
            )}
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};
