
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Calendar, User } from "lucide-react";

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

const Gallery = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "byDate" | "byMember">("all");

  // Group images by date
  const groupByDate = (images: Media[]) => {
    const grouped: Record<string, Media[]> = {};
    images.forEach(img => {
      const date = img.date_uploaded;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(img);
    });
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
  };

  // Group images by family member
  const groupByMember = (images: Media[]) => {
    const grouped: Record<string, { name: string, avatar: string | null, images: Media[] }> = {};
    images.forEach(img => {
      if (img.profile) {
        const userId = img.user_id;
        if (!grouped[userId]) {
          grouped[userId] = {
            name: img.profile.name,
            avatar: img.profile.avatar_url,
            images: []
          };
        }
        grouped[userId].images.push(img);
      }
    });
    return Object.values(grouped);
  };

  const { data: mediaItems, isLoading } = useQuery({
    queryKey: ["gallery", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return [];

      const { data, error } = await supabase
        .from("media")
        .select(`
          *,
          profile:profiles(name, avatar_url)
        `)
        .eq("family_id", profile.family_id)
        .order("date_uploaded", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load gallery. Please try again later.",
          variant: "destructive",
        });
        return [];
      }

      return data as Media[];
    },
    enabled: !!profile?.family_id,
  });

  // Filter media items based on search term
  const filteredMedia = mediaItems?.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const groupedByDate = groupByDate(filteredMedia);
  const groupedByMember = groupByMember(filteredMedia);

  return (
    <MainLayout title="Gallery" requireAuth={true}>
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Family Gallery</h1>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search memories..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => setViewMode(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Photos</TabsTrigger>
            <TabsTrigger value="byDate">By Date</TabsTrigger>
            <TabsTrigger value="byMember">By Family Member</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="all" className="mt-0">
                {filteredMedia.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredMedia.map((item) => (
                      <div 
                        key={item.id} 
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(item)}
                      >
                        <img 
                          src={item.url} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500">No photos found</p>
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
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((item) => (
                          <div 
                            key={item.id} 
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImage(item)}
                          >
                            <img 
                              src={item.url} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500">No photos found</p>
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
                          <div 
                            key={item.id} 
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImage(item)}
                          >
                            <img 
                              src={item.url} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500">No photos found</p>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedImage?.title}</DialogTitle>
              {selectedImage?.description && (
                <DialogDescription>
                  {selectedImage.description}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="mt-2">
              <img 
                src={selectedImage?.url} 
                alt={selectedImage?.title} 
                className="w-full h-auto max-h-[70vh] object-contain rounded-md"
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">
                  Shared by {selectedImage?.profile?.name} on {' '}
                  {selectedImage && new Date(selectedImage.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Gallery;
