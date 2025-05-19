
import { Search, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Family Gallery</h1>
      
      <div className="flex gap-4 w-full md:w-auto">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search memories..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={onAddClick}
          className={`flex items-center gap-2 shrink-0 ${isMobile ? 'py-5' : ''}`}
          variant="primary"
          size={isMobile ? "default" : "default"}
        >
          <PlusCircle className="h-4 w-4" />
          <span className={isMobile ? "hidden" : "inline"}>Add Media</span>
        </Button>
      </div>
    </div>
  );
};
