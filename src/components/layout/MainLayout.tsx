
import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "./Header";
import ObfuscatedEmail from "@/components/ui/obfuscated-email";

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  title?: string;
}

export default function MainLayout({ children, requireAuth = false, title }: MainLayoutProps) {
  const { user, loading } = useAuth();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isMessagesPage = location.pathname.endsWith("/messages");
  
  useEffect(() => {
    if (!loading && requireAuth && !user) {
      navigate(`/${locale}/auth`);
    }
  }, [user, loading, requireAuth, navigate, locale]);
  
  useEffect(() => {
    if (title) {
      document.title = `${title} | ${t('app.name')}`;
    } else {
      document.title = t('app.name');
    }
  }, [title, t, locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" role="status">
          <span className="sr-only">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  // Apply specific styling for messages page to make it larger on big screens
  const containerClasses = isMessagesPage 
    ? "flex-grow w-full max-w-[1600px] mx-auto" 
    : "flex-grow container mx-auto px-4 py-6 sm:px-6 sm:py-8";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main className={containerClasses} id="main-content">
        {children}
      </main>
      <footer className="bg-white/50 dark:bg-gray-900/50 py-6 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© {new Date().getFullYear()} {t('app.name')}. {t('common.all_rights_reserved')}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <address className="not-italic">
              <a href="https://mysa-tech.fr" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">MYSA Tech</a> | 
              <ObfuscatedEmail email="contact@mysa-tech.fr" className="hover:text-primary transition-colors ml-1" />
            </address>
            <Link to={`/${locale}/legal`} className="hover:text-primary transition-colors">{t('nav.legal')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
