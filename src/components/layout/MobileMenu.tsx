
import { useAuth } from "@/hooks/useAuth";
import NavigationItems from "./NavigationItems";
import UserMenu from "./UserMenu";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const navigationItems = user
    ? [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Feed", path: "/feed" },
        { name: "Gallery", path: "/gallery" },
        { name: "Messages", path: "/messages" },
        { name: "Family Admin", path: "/family-admin" },
      ]
    : [];

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[85vh] max-h-[85vh]">
        <DrawerHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center">
              <img 
                src="/lovable-uploads/bee75be3-3697-49b4-8ca0-80505c4798ec.png" 
                alt="FamilyCloud Logo" 
                className="h-10 w-10 mr-2"
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
          <div className="space-y-1">
            <NavigationItems items={navigationItems} isMobile onClick={onClose} />
          </div>
          <div className="pt-4 border-t border-border">
            <UserMenu isMobile onItemClick={onClose} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
