
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to the dashboard
  useEffect(() => {
    if (user) {
      if (!profile?.family_id) {
        navigate("/setup-family");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, profile, navigate]);

  return (
    <MainLayout title="Home">
      <div className="flex flex-col items-center justify-center px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-400 mb-4 md:text-5xl">
            Welcome to FamilyCloud
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Your private and secure space to share special moments with loved ones
          </p>
          {!user && (
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/auth?signup=true">Join FamilyCloud</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          <Card className="bg-purple-50 dark:bg-gray-800 border-none shadow-md">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="bg-purple-100 dark:bg-gray-700 p-3 rounded-full inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 10C2 5.58172 5.58172 2 10 2V10H18C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 14L22 22" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Daily Moments</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Each day, every family member can share one special photo or video
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-gray-800 border-none shadow-md">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="bg-purple-100 dark:bg-gray-700 p-3 rounded-full inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H15L12 19L9 16Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Private Messaging</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Securely chat with your family through encrypted messages
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-gray-800 border-none shadow-md">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="bg-purple-100 dark:bg-gray-700 p-3 rounded-full inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Family Gallery</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Beautiful gallery to preserve and view all your family memories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <div className="mt-16 max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-4">
            Safe, Private, and Family-Friendly
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            FamilyCloud is designed with your privacy in mind. Your family's memories stay within your family, with no ads or data sharing. It's the secure way to stay connected with loved ones near and far.
          </p>

          <Button asChild size="lg">
            <Link to="/auth?signup=true">Get Started Now</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
