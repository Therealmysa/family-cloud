
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Apply padding to all pages except messages page
  const containerClasses = isMessagesPage 
    ? "flex-grow container mx-auto px-0 py-0" 
    : "flex-grow container mx-auto px-4 py-4 sm:px-6 sm:py-6";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={containerClasses}>
        {children}
      </main>
      <footer className="bg-gray-50 dark:bg-gray-900 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} FamilyCloud. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
