
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Media } from "@/types/media";

interface MediaInfoProps {
  media: Media;
}

export function MediaInfo({ media }: MediaInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <ProfileAvatar profile={media.profile} />
      <div>
        <p className="font-medium">{media.profile?.name}</p>
        <p className="text-xs text-gray-500">
          {new Date(media.created_at).toLocaleDateString()}
        </p>
      </div>
      
      {/* Description if available */}
      {media.description && (
        <p className="text-gray-700 dark:text-gray-300 mt-2">{media.description}</p>
      )}
    </div>
  );
}
