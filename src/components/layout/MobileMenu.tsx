
import { useAuth } from "@/hooks/useAuth";
import NavigationItems from "./NavigationItems";
import UserMenu from "./UserMenu";
import { X, Moon, Sun, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useLanguage();

  const navigationItems = user
    ? [
        { name: t('nav.dashboard'), path: `/${locale}/dashboard` },
        { name: t('nav.feed'), path: `/${locale}/feed` },
        { name: t('nav.gallery'), path: `/${locale}/gallery` },
        { name: t('nav.messages'), path: `/${locale}/messages` },
        { name: t('nav.family_admin'), path: `/${locale}/family-admin` },
      ]
    : [
        { name: t('nav.home'), path: `/${locale}/` },
      ];

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[85vh] max-h-[85vh]">
        <DrawerHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center">
              <img 
                src="/lovable-uploads/bee75be3-3697-49b4-8ca0-80505c4798ec.png" 
                alt="FamilyCloud Logo" 
                className="h-8 w-8 mr-2"
              />
              <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FamilyCloud
              </DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-6 w-6" />
                <span className="sr-only">Fermer</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="flex flex-col p-6 space-y-6 overflow-y-auto">
          {/* Language Switcher */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('language.title')}</h3>
            <div className="flex space-x-2">
              <Button 
                variant={locale === 'fr' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLocale('fr')}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                🇫🇷 Français
              </Button>
              <Button 
                variant={locale === 'en' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLocale('en')}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                🇬🇧 English
              </Button>
            </div>
          </div>
          
          {/* Theme Switcher */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('profile.theme')}</h3>
            <div className="flex space-x-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                {t('light')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                {t('dark')}
              </Button>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="space-y-1">
            <NavigationItems items={navigationItems} isMobile onClick={onClose} />
          </div>
          
          {/* User Section */}
          <div className="pt-4 border-t border-border">
            <UserMenu isMobile onItemClick={onClose} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
