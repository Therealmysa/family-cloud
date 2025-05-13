
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Heart, Lock, Shield, Smile, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  // Show a welcome toast when the page loads
  useEffect(() => {
    if (!user) {
      toast({
        title: "Welcome to FamilyCloud",
        description: "Share moments with your loved ones",
        variant: "success"
      });
    }
  }, [user]);

  return (
    <MainLayout title="Home">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl my-8">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl text-purple-700 dark:text-purple-400">
                    Share moments with your loved ones
                  </h1>
                  <p className="max-w-[600px] text-gray-600 dark:text-gray-300 md:text-xl">
                    FamilyCloud gives you a private and secure space to connect with your family. Share daily moments, chat privately, and build a beautiful gallery of memories.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {!user && (
                    <>
                      <Button asChild size="lg" className="px-8" onClick={() => {
                        toast({
                          title: "Getting Started",
                          description: "Create your family account now!",
                          variant: "success"
                        });
                      }}>
                        <Link to="/auth?signup=true">Get Started <ChevronRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                      <Button asChild variant="outlined" size="lg">
                        <Link to="/auth">Sign In</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[450px] aspect-square">
                  <div className="absolute top-0 left-0 w-full h-full rounded-full bg-purple-200/50 dark:bg-purple-900/30 animate-float delay-200" style={{ animationDuration: '5s' }}></div>
                  <div className="absolute top-[20%] left-[15%] w-[70%] h-[70%] rounded-full bg-purple-300/60 dark:bg-purple-800/40 animate-float" style={{ animationDuration: '7s' }}></div>
                  <div className="absolute top-[30%] left-[25%] w-[50%] h-[50%] rounded-full bg-purple-400/70 dark:bg-purple-700/50 animate-float delay-500" style={{ animationDuration: '4s' }}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center rounded-full bg-white dark:bg-gray-800 p-8 shadow-lg">
                        <Heart size={80} className="text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-purple-700 dark:text-purple-400">
                Everything your family needs
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-[700px] mx-auto">
                Simple, secure, and designed for families to stay connected no matter the distance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="bg-purple-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                    <Smile className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Daily Moments</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Each family member can share one special moment every day - keeping everyone updated on the little things that matter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="bg-purple-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                    <Lock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Private Messaging</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Secure, private conversations between family members with end-to-end encryption for ultimate privacy
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="bg-purple-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                    <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Family Gallery</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Beautiful, organized collections of your family memories that everyone can enjoy and revisit anytime
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="w-full py-12 md:py-16 lg:py-20 bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl my-8">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-lg bg-purple-100 dark:bg-gray-800">
                  <Shield className="h-10 w-10 text-purple-700 dark:text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-purple-700 dark:text-purple-400">
                  Safe, Private, and Family-Friendly
                </h2>
                <p className="max-w-[700px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Your family's memories stay within your family. No ads, no data sharing, just a secure space for your loved ones.
                </p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <Button asChild size="lg" className="w-full">
                  <Link to="/auth?signup=true">Join FamilyCloud Today</Link>
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Create your family's private space in less than a minute
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
