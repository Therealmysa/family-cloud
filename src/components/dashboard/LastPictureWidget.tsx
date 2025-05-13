
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
    <Card className="border-none shadow-soft hover:shadow-card transition-all duration-300 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2 border-b border-border/50">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-secondary/10">
            <Image className="h-3.5 w-3.5 text-secondary" />
          </div>
          <span>Last Picture</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : lastPicture ? (
          <div>
            <AspectRatio ratio={16/9} className="bg-muted rounded-xl mb-3 overflow-hidden border border-accent/20 shadow-sm">
              <img 
                src={lastPicture.url} 
                alt={lastPicture.title}
                className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
              />
            </AspectRatio>
            <div className="mt-2">
              <p className="text-sm font-medium line-clamp-1">{lastPicture.title}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted-foreground">
                  By {lastPicture.profile?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(lastPicture.date_uploaded)}
                </span>
              </div>
              <Link 
                to="/gallery" 
                className="text-xs text-secondary hover:underline mt-2 inline-flex items-center gap-1 group"
              >
                <span>View gallery</span>
                <svg className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <div className="p-3 rounded-full bg-muted">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No pictures uploaded yet.
            </p>
            <Link 
              to="/create-post" 
              className="text-xs text-secondary hover:underline mt-1 inline-block"
            >
              Share a moment
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
