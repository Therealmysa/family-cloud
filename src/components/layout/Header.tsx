
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import NavigationItems from "./NavigationItems";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Header() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const navigationItems = user ? [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Feed", path: "/feed" },
    { name: "Gallery", path: "/gallery" },
    { name: "Messages", path: "/messages" },
  ] : [];

  return (
    <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/bee75be3-3697-49b4-8ca0-80505c4798ec.png" 
                alt="FamilyCloud Logo" 
                className="h-10 w-10 mr-2"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FamilyCloud
              </h1>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <NavigationItems items={navigationItems} />
            <ThemeToggle />
            <UserMenu />
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <span className="sr-only">{mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
              <Menu className="block h-6 w-6" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={toggleMobileMenu} />
    </header>
  );
}
