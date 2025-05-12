
import { Profile } from "@/types/profile";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

type MemberListProps = {
  filteredMembers: Profile[];
  selectedMembers: string[];
  isLoading: boolean;
  toggleMemberSelection: (memberId: string) => void;
  searchQuery: string;
};

export const MemberList = ({
  filteredMembers,
  selectedMembers,
  isLoading,
  toggleMemberSelection,
  searchQuery,
}: MemberListProps) => {
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
        {searchQuery ? "No members found" : "No family members available"}
      </p>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto space-y-1">
      {filteredMembers.map((member) => (
        <div 
          key={member.id}
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Checkbox
            checked={selectedMembers.includes(member.id)}
            onCheckedChange={() => toggleMemberSelection(member.id)}
            id={`member-${member.id}`}
          />
          <label 
            htmlFor={`member-${member.id}`}
            className="flex items-center space-x-3 flex-1 cursor-pointer"
          >
            <Avatar>
              <AvatarImage src={member.avatar_url || ""} />
              <AvatarFallback>
                {member.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{member.name}</span>
          </label>
        </div>
      ))}
    </div>
  );
};
