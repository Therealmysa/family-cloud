
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

const FamilyDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
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
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
            <Heart className="h-8 w-8 text-primary animate-float" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {profile?.name ? `Welcome, ${profile.name}` : 'Welcome to Your Family Space'}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Your private space to share moments and stay connected with loved ones
          </p>
        </div>
        
        {/* Activity Highlights Section */}
        <div className="mb-12 bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            <span>Recent Family Activity</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LastMessageWidget />
            <LastPictureWidget />
          </div>
        </div>
        
        {/* Quick Access Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Share className="h-5 w-5 text-primary" />
            <span>Quick Access</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-soft hover:shadow-card transition-all duration-300 bg-white/50 dark:bg-gray-800/50 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <span>Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  Chat with family members in private conversations
                </p>
                <Button asChild variant="outline" className="w-full bubble-button bg-primary/10 border-0 text-primary hover:bg-primary/20">
                  <Link to="/messages">Open Messages</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-soft hover:shadow-card transition-all duration-300 bg-white/50 dark:bg-gray-800/50 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-full bg-secondary/10">
                    <Image className="h-4 w-4 text-secondary" />
                  </div>
                  <span>Gallery</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  Browse all family photos and videos in one place
                </p>
                <Button asChild variant="outline" className="w-full bubble-button bg-secondary/10 border-0 text-secondary hover:bg-secondary/20">
                  <Link to="/gallery">View Gallery</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-soft hover:shadow-card transition-all duration-300 bg-white/50 dark:bg-gray-800/50 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-full bg-accent/10">
                    <Calendar className="h-4 w-4 text-accent" />
                  </div>
                  <span>Daily Feed</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  See today's moments shared by family members
                </p>
                <Button asChild variant="outline" className="w-full bubble-button bg-accent/10 border-0 text-accent hover:bg-accent/20">
                  <Link to="/feed">Go to Feed</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-soft hover:shadow-card transition-all duration-300 bg-white/50 dark:bg-gray-800/50 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/5 dark:bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span>Family</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {profile?.is_admin ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      Manage family members and settings
                    </p>
                    <Button asChild variant="outline" className="w-full bubble-button bg-primary/10 border-0 text-primary hover:bg-primary/20">
                      <Link to="/family-admin">Family Admin</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      View your profile and settings
                    </p>
                    <Button asChild variant="outline" className="w-full bubble-button bg-primary/10 border-0 text-primary hover:bg-primary/20">
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
            size="lg" 
            className="rounded-full px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Link to="/create-post" className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              <span>Share Today's Moment</span>
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default FamilyDashboard;
