
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  isMobile: boolean;
}

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  onAddClick,
  isMobile
}: SearchBarProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
        <Input
          type="text"
          placeholder={t('gallery.search')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      <Button
        onClick={onAddClick}
        className="flex items-center gap-2"
        size={isMobile ? "default" : "default"}
      >
        <Plus size={18} />
        <span>{t('gallery.add_photo')}</span>
      </Button>
    </div>
  );
};
