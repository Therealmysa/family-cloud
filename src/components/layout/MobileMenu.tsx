
import { useAuth } from "@/hooks/useAuth";
import NavigationItems from "./NavigationItems";
import UserMenu from "./UserMenu";
import { Cloud } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useAuth();

  if (!isOpen) return null;

  const navigationItems = user ? [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Feed", path: "/feed" },
    { name: "Gallery", path: "/gallery" },
    { name: "Messages", path: "/messages" },
    { name: "Family Admin", path: "/family-admin" },
  ] : [];

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
      <div className="flex flex-col px-6 py-8 space-y-6 overflow-y-auto max-h-screen">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center">
            <div className="bg-primary/10 rounded-full p-2 mr-2">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FamilyCloud
            </h1>
          </div>
        </div>
        <div className="space-y-1">
          <NavigationItems items={navigationItems} isMobile onClick={onClose} />
        </div>
        <div className="pt-4 border-t border-border">
          <UserMenu isMobile onItemClick={onClose} />
        </div>
      </div>
    </div>
  );
}
