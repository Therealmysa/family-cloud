
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@/types/profile";
import { MemberProfile } from "./MemberProfile";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  profile: Partial<Profile> | null | undefined;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showStatus?: boolean;
  clickable?: boolean;
}

export function ProfileAvatar({ 
  profile, 
  size = "md", 
  className,
  showStatus = false,
  clickable = true 
}: ProfileAvatarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Define size classes for different avatar sizes
  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  // Get initials from profile name
  const getInitials = (name: string) => {
    if (!name) return "";
    return name.substring(0, 2).toUpperCase();
  };

  const handleAvatarClick = () => {
    if (clickable && profile && profile.id) {
      setIsProfileOpen(true);
    }
  };

  return (
    <>
      <Avatar 
        className={cn(
          sizeClasses[size], 
          clickable && profile?.id && "cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all",
          className
        )}
        onClick={handleAvatarClick}
      >
        <AvatarImage src={profile?.avatar_url || ""} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {profile && profile.name ? getInitials(profile.name) : "?"}
        </AvatarFallback>
        {showStatus && profile?.id && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
        )}
      </Avatar>

      {profile && profile.id && (
        <MemberProfile 
          member={profile as Profile}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
}
