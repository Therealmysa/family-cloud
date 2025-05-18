
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import NavigationItems from "./NavigationItems";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Menu } from "lucide-react";

export default function Header() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { t, locale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Navigation items based on auth status
  const navigationItems = user
    ? [
        { name: t('nav.dashboard'), path: `/${locale}/dashboard` },
        { name: t('nav.feed'), path: `/${locale}/feed` },
        { name: t('nav.gallery'), path: `/${locale}/gallery` },
        { name: t('nav.messages'), path: `/${locale}/messages` },
      ]
    : [
        { name: t('nav.home'), path: `/${locale}/` },
      ];
  
  // Don't show the header on the auth page
  if (location.pathname === "/auth" || location.pathname === "/en/auth" || location.pathname === "/fr/auth") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo Section with FamilyCloud text */}
        <Link to={`/${locale}/`} className="flex items-center gap-3 mr-6">
          <div className="inline-flex items-center justify-center">
            <img 
                src="/lovable-uploads/bee75be3-3697-49b4-8ca0-80505c4798ec.png" 
                alt="FamilyCloud Logo" 
                className="h-9 w-9"
              />
          </div>
          <span className="font-bold text-xl text-primary">FamilyCloud</span>
        </Link>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex md:flex-1">
          <NavigationItems items={navigationItems} />
        </div>
        
        {/* Actions group */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Desktop: Language Selector & Theme Toggle */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <LanguageSelector />
            <ThemeToggle />
          </div>
          
          {/* User Menu or Auth Button */}
          {!loading && (
            user ? (
              <UserMenu />
            ) : (
              <Button asChild size="sm" className="ml-2">
                <Link to={`/${locale}/auth`}>{t('auth.sign_in')}</Link>
              </Button>
            )
          )}
          
          {/* Mobile menu button, shown on smaller screens */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 px-0" 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, shown on smaller screens */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </header>
  );
}
