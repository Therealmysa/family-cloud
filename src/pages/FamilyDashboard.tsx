
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Image, Calendar, Users, Cloud, Heart, Share } from "lucide-react";
import { LastMessageWidget } from "@/components/dashboard/LastMessageWidget";
import { LastPictureWidget } from "@/components/dashboard/LastPictureWidget";
import { useIsMobile } from "@/hooks/use-mobile";

const FamilyDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Redirect to setup family if user doesn't have a family yet
  useEffect(() => {
    if (!loading && user && !profile?.family_id) {
      navigate("/setup-family");
    }
  }, [user, profile, loading, navigate]);

  // If user is not authenticated, redirect to home page
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);
  
  if (loading) return null;

  return (
    <MainLayout title="Family Dashboard" requireAuth={true}>
      <div className="w-full">
        <div className="mb-8 md:mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-secondary/20 mb-5">
            <Heart className="h-9 w-9 text-primary animate-float" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {profile?.name ? `Welcome, ${profile.name}` : 'Welcome to Your Family Space'}
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-md mx-auto">
            Your private space to share moments and stay connected with loved ones
          </p>
        </div>
        
        {/* Activity Highlights Section */}
        <div className="mb-8 md:mb-14 bg-gradient-to-br from-background to-muted p-4 md:p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl md:text-2xl font-semibold mb-5 flex items-center gap-2">
            <Cloud className="h-6 w-6 text-secondary" />
            <span>Recent Family Activity</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <LastMessageWidget />
            <LastPictureWidget />
          </div>
        </div>
        
        {/* Quick Access Section */}
        <div className="mb-8 md:mb-14">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
            <Share className="h-6 w-6 text-secondary" />
            <span>Quick Access</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 overflow-hidden group">
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <span>Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-base text-muted-foreground mb-5 line-clamp-2">
                  Chat with family members in private conversations
                </p>
                <Button 
                  asChild 
                  variant="primary" 
                  className={`w-full text-base font-medium ${isMobile ? 'py-5' : ''}`}
                >
                  <Link to="/messages">Open Messages</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 overflow-hidden group">
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <div className="p-2 rounded-full bg-secondary/10">
                    <Image className="h-5 w-5 text-secondary" />
                  </div>
                  <span>Gallery</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-base text-muted-foreground mb-5 line-clamp-2">
                  Browse all family photos and videos in one place
                </p>
                <Button 
                  asChild 
                  variant="secondary" 
                  className={`w-full text-base font-medium ${isMobile ? 'py-5' : ''}`}
                >
                  <Link to="/gallery">View Gallery</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 overflow-hidden group">
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <div className="p-2 rounded-full bg-accent/10">
                    <Calendar className="h-5 w-5 text-accent" />
                  </div>
                  <span>Daily Feed</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-base text-muted-foreground mb-5 line-clamp-2">
                  See today's moments shared by family members
                </p>
                <Button 
                  asChild 
                  variant="accent" 
                  className={`w-full text-base font-medium ${isMobile ? 'py-5' : ''}`}
                >
                  <Link to="/feed">Go to Feed</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 overflow-hidden group">
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/5 dark:bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <span>Family</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {profile?.is_admin ? (
                  <>
                    <p className="text-base text-muted-foreground mb-5 line-clamp-2">
                      Manage family members and settings
                    </p>
                    <Button 
                      asChild 
                      variant="outlined" 
                      className={`w-full text-base font-medium ${isMobile ? 'py-5' : ''}`}
                    >
                      <Link to="/family-admin">Family Admin</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-base text-muted-foreground mb-5 line-clamp-2">
                      View your profile and settings
                    </p>
                    <Button 
                      asChild 
                      variant="outlined" 
                      className={`w-full text-base font-medium ${isMobile ? 'py-5' : ''}`}
                    >
                      <Link to="/profile">My Profile</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Create Post/Share Moment button */}
        <div className="mb-8 text-center">
          <Button 
            asChild 
            size={isMobile ? "xl" : "xl"} 
            variant="primary"
            className="rounded-full px-6 md:px-8 py-6 md:py-7 shadow-md hover:shadow-lg text-lg font-medium"
          >
            <Link to="/create-post" className="flex items-center gap-2">
              <Heart className="h-6 w-6" />
              <span>Share Today's Moment</span>
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default FamilyDashboard;
