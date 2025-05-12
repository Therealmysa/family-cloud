
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
  ] : [];

  return (
    <div className="md:hidden bg-white dark:bg-gray-900">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <NavigationItems items={navigationItems} isMobile onClick={onClose} />
        <UserMenu isMobile onItemClick={onClose} />
      </div>
    </div>
  );
}
