
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import MainLayout from "@/components/layout/MainLayout";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout>
      <Helmet>
        <title>Page Not Found | FamilyCloud</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-purple-600 mb-6">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page not found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default" size="lg" className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/feed">
                <ArrowLeft className="h-4 w-4" />
                Go to Feed
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Looking for something specific?</p>
            <Link to="/gallery" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 flex items-center justify-center gap-2">
              <Search className="h-4 w-4" />
              Search the gallery
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
