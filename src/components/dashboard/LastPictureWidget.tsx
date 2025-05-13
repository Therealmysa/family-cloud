
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Media } from "@/types/media";

export const LastPictureWidget = () => {
  const { profile } = useAuth();
  const [lastPicture, setLastPicture] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastPicture = async () => {
      if (!profile?.family_id) return;

      try {
        // Get the last picture uploaded to the family
        const { data } = await supabase
          .from("media")
          .select(`
            id, 
            title, 
            url, 
            created_at,
            date_uploaded,
            profile:profiles(name, avatar_url)
          `)
          .eq("family_id", profile.family_id)
          .order("date_uploaded", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          setLastPicture(data[0] as Media);
        }
      } catch (error) {
        console.error("Error fetching last picture:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastPicture();
  }, [profile?.family_id]);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return "Today";
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return "Yesterday";
    }
    
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center text-purple-700 dark:text-purple-400">
          <Image className="h-5 w-5 mr-2" /> Last Picture
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-36 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : lastPicture ? (
          <div>
            <AspectRatio ratio={16/9} className="bg-gray-100 dark:bg-gray-700 rounded-md mb-2 overflow-hidden">
              <img 
                src={lastPicture.url} 
                alt={lastPicture.title}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            <div className="mt-2">
              <p className="text-sm font-medium line-clamp-1">{lastPicture.title}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  By {lastPicture.profile?.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(lastPicture.date_uploaded)}
                </span>
              </div>
              <Link 
                to="/gallery" 
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-2 inline-block"
              >
                View gallery
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No pictures uploaded yet.
            </p>
            <Link 
              to="/create-post" 
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline mt-2 inline-block"
            >
              Share a moment
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
