
import { useState } from "react";
import { Profile } from "@/types/profile";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { MemberProfile } from "@/components/profile/MemberProfile";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { useLanguage } from "@/contexts/LanguageContext";

type MemberListProps = {
  filteredMembers: Profile[];
  selectedMembers: string[];
  isLoading: boolean;
  toggleMemberSelection: (memberId: string) => void;
  searchQuery: string;
  showCheckboxes?: boolean;
};

export const MemberList = ({
  filteredMembers,
  selectedMembers,
  isLoading,
  toggleMemberSelection,
  searchQuery,
  showCheckboxes = true,
}: MemberListProps) => {
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { t } = useLanguage();

  const openMemberProfile = (member: Profile) => {
    setSelectedMember(member);
    setIsProfileOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (filteredMembers.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        {searchQuery ? t('messages.no_members_found') : t('messages.no_family_members')}
      </p>
    );
  }

  return (
    <>
      <div className="max-h-64 overflow-y-auto space-y-1">
        {filteredMembers.map((member) => (
          <div 
            key={member.id}
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {showCheckboxes && (
              <Checkbox
                checked={selectedMembers.includes(member.id)}
                onCheckedChange={() => toggleMemberSelection(member.id)}
                id={`member-${member.id}`}
              />
            )}
            
            <div 
              onClick={() => openMemberProfile(member)}
              className="flex items-center space-x-3 flex-1 cursor-pointer"
            >
              <ProfileAvatar profile={member} />
              <span>{member.name}</span>
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                openMemberProfile(member);
              }}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="sr-only">{t('messages.message')}</span>
            </Button>
          </div>
        ))}
      </div>

      <MemberProfile 
        member={selectedMember} 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </>
  );
};
