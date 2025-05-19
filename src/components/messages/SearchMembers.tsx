
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type SearchMembersProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export const SearchMembers = ({ searchQuery, setSearchQuery }: SearchMembersProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search family members..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-8"
      />
    </div>
  );
};
