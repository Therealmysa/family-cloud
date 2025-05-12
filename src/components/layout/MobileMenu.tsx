
import { useAuth } from "@/hooks/useAuth";
import NavigationItems from "./NavigationItems";
import UserMenu from "./UserMenu";

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
    <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900">
      <div className="px-4 py-6 space-y-4 overflow-y-auto max-h-screen">
        <NavigationItems items={navigationItems} isMobile onClick={onClose} />
        <UserMenu isMobile onItemClick={onClose} />
      </div>
    </div>
  );
}
