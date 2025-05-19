
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type SearchMembersProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export const SearchMembers = ({ searchQuery, setSearchQuery }: SearchMembersProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder={t('messages.search_family_members')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-8"
      />
    </div>
  );
};
