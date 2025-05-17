
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
import { Menu, Heart } from "lucide-react";

export default function Header() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Navigation items based on auth status
  const navigationItems = user
    ? [
        { name: t('nav.dashboard'), path: "/dashboard" },
        { name: t('nav.feed'), path: "/feed" },
        { name: t('nav.gallery'), path: "/gallery" },
        { name: t('nav.messages'), path: "/messages" },
      ]
    : [
        { name: t('nav.home'), path: "/" },
      ];
  
  // Don't show the header on the auth page
  if (location.pathname === "/auth") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center gap-2 mr-4">
          <div className="inline-flex items-center justify-center rounded-full bg-white dark:bg-gray-800 p-2 shadow-sm">
            <Heart size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-bold text-xl text-primary hidden sm:inline-block">FamilyCloud</span>
          <span className="font-bold text-xl text-primary sm:hidden">FC</span>
        </Link>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex md:flex-1">
          <NavigationItems items={navigationItems} />
        </div>
        
        {/* Actions group */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* User Menu or Auth Button */}
          {!loading && (
            user ? (
              <UserMenu />
            ) : (
              <Button asChild size="sm" className="ml-2">
                <Link to="/auth">{t('auth.sign_in')}</Link>
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
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
          
          {/* Mobile menu, shown on smaller screens */}
          <MobileMenu 
            isOpen={mobileMenuOpen} 
            onClose={() => setMobileMenuOpen(false)} 
          />
        </div>
      </div>
    </header>
  );
}
