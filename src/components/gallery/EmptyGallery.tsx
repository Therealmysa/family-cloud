
import { Search, Image } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmptyGalleryProps {
  isSearching: boolean;
}

export function EmptyGallery({ isSearching }: EmptyGalleryProps) {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {isSearching ? (
        <>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
            <Search className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('gallery.empty_search')}</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {t('gallery.try_different')}
          </p>
        </>
      ) : (
        <>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
            <Image className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('gallery.empty')}</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {t('gallery.empty')}
          </p>
        </>
      )}
    </div>
  );
}
