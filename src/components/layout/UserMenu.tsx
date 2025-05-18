
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Users } from "lucide-react";

interface UserMenuProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export default function UserMenu({ isMobile = false, onItemClick }: UserMenuProps) {
  const { user, profile, signOut } = useAuth();
  const { t, locale } = useLanguage();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) {
    if (isMobile) {
      return (
        <>
          <Link
            to={`/${locale}/auth`}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
            onClick={onItemClick}
          >
            {t('auth.sign_in')}
          </Link>
          <Link
            to={`/${locale}/auth?signup=true`}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
            onClick={onItemClick}
          >
            {t('auth.sign_up')}
          </Link>
        </>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link to={`/${locale}/auth`}>{t('auth.sign_in')}</Link>
        </Button>
        <Button asChild>
          <Link to={`/${locale}/auth?signup=true`}>{t('auth.sign_up')}</Link>
        </Button>
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
        <Link
          to={`/${locale}/profile`}
          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
          onClick={onItemClick}
        >
          {t('nav.profile')}
        </Link>
        {profile?.is_admin && (
          <Link
            to={`/${locale}/family-admin`}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
            onClick={onItemClick}
          >
            {t('nav.family_admin')}
          </Link>
        )}
        <button
          onClick={() => {
            signOut();
            if (onItemClick) onItemClick();
          }}
          className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
        >
          {t('auth.sign_out')}
        </button>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage 
              src={profile?.avatar_url || ""} 
              alt={profile?.name || "User"} 
            />
            <AvatarFallback>
              {profile?.name ? getInitials(profile.name) : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/${locale}/profile`} className="cursor-pointer flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>{t('nav.profile')}</span>
          </Link>
        </DropdownMenuItem>
        {profile?.is_admin && (
          <DropdownMenuItem asChild>
            <Link to={`/${locale}/family-admin`} className="cursor-pointer flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>{t('nav.family_admin')}</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('auth.sign_out')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
