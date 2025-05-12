
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Image, Calendar, Users } from "lucide-react";

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">
            {profile?.name ? `Welcome, ${profile.name}` : 'Welcome to Your Family Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Your private family space to share and connect
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-purple-700 dark:text-purple-400">
                <MessageSquare className="h-5 w-5 mr-2" /> Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Chat with family members in private conversations
              </p>
              <Button asChild size="sm" className="w-full">
                <Link to="/messages">Open Messages</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-purple-700 dark:text-purple-400">
                <Image className="h-5 w-5 mr-2" /> Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Browse all family photos and videos in one place
              </p>
              <Button asChild size="sm" className="w-full">
                <Link to="/gallery">View Gallery</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-purple-700 dark:text-purple-400">
                <Calendar className="h-5 w-5 mr-2" /> Daily Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                See today's moments shared by family members
              </p>
              <Button asChild size="sm" className="w-full">
                <Link to="/feed">Go to Feed</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-purple-700 dark:text-purple-400">
                <Users className="h-5 w-5 mr-2" /> Family Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.is_admin ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Manage family members and settings
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to="/family-admin">Family Admin</Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    View your profile and settings
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to="/profile">My Profile</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Create Post/Share Moment button */}
        <div className="mb-8">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/create-post">Share Today's Moment</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default FamilyDashboard;
