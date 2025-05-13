
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  title?: string;
}

export default function MainLayout({ children, requireAuth = false, title }: MainLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMessagesPage = location.pathname === "/messages";
  
  useEffect(() => {
    if (!loading && requireAuth && !user) {
      navigate("/auth");
    }
  }, [user, loading, requireAuth, navigate]);
  
  useEffect(() => {
    if (title) {
      document.title = `${title} | FamilyCloud`;
    } else {
      document.title = "FamilyCloud";
    }
  }, [title]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Apply specific styling for messages page to center content
  const containerClasses = isMessagesPage 
    ? "flex-grow container max-w-4xl mx-auto px-2" 
    : "flex-grow container mx-auto px-4 py-6 sm:px-6 sm:py-8";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main className={containerClasses}>
        {children}
      </main>
      <footer className="bg-white/50 dark:bg-gray-900/50 py-6 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© {new Date().getFullYear()} FamilyCloud. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
