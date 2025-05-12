
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, MessageCircle, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Media = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  user_id: string;
  created_at: string;
  date_uploaded: string;
  profile: {
    name: string;
    avatar_url: string | null;
  } | null;
};

const Feed = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [hasPostedToday, setHasPostedToday] = useState(false);

  // Fetch feed data (media posts from family members)
  const { data: feedItems, isLoading, error, refetch } = useQuery({
    queryKey: ["feed", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) {
        return [];
      }

      // Query media items for the family, with latest first
      const { data, error } = await supabase
        .from("media")
        .select(`
          *,
          profile:profiles(name, avatar_url)
        `)
        .eq("family_id", profile.family_id)
        .order("date_uploaded", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Check if user has posted today
      const today = new Date().toISOString().split("T")[0];
      const userPostedToday = data.some(
        (item) => item.user_id === user?.id && item.date_uploaded === today
      );
      setHasPostedToday(userPostedToday);

      return data as Media[];
    },
    enabled: !!profile?.family_id,
  });

  // Handle navigation to post creation
  const handleCreatePost = () => {
    navigate("/create-post");
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load feed. Please try again later.",
      variant: "destructive",
    });
  }

  return (
    <MainLayout title="Feed" requireAuth={true}>
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daily Moments</h1>
          <Button 
            onClick={handleCreatePost} 
            disabled={hasPostedToday}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            {hasPostedToday ? "Posted Today" : "Share Moment"}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-64 bg-gray-100 dark:bg-gray-800">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-4 mb-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : feedItems && feedItems.length > 0 ? (
          <div className="space-y-6">
            {feedItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <img 
                  src={item.url} 
                  alt={item.title}
                  className="w-full h-auto object-cover max-h-[500px]"
                  loading="lazy"
                />
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-4 mb-2">
                    <Avatar>
                      <AvatarImage src={item.profile?.avatar_url || ""} />
                      <AvatarFallback>
                        {item.profile?.name?.substring(0, 2).toUpperCase() || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{item.profile?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mt-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
                  )}
                </CardContent>
                <CardFooter className="flex gap-4 pt-0">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>Like</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>Comment</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8">
            <h3 className="text-xl font-medium mb-2">No moments yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Be the first in your family to share a moment today!
            </p>
            <Button onClick={handleCreatePost} disabled={hasPostedToday}>
              {hasPostedToday ? "You already posted today" : "Share Your Moment"}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Feed;
