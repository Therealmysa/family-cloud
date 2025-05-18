
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmptyFeedProps {
  onCreatePost: () => void;
  hasPostedToday: boolean;
}

export const EmptyFeed = ({ onCreatePost, hasPostedToday }: EmptyFeedProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{t('feed.empty_title')}</h3>
        <p className="text-gray-500 dark:text-gray-400">{t('feed.empty_description')}</p>
        {!hasPostedToday && (
          <Button onClick={onCreatePost} className="mt-4">
            {t('feed.create_first_post')}
          </Button>
        )}
      </div>
    </div>
  );
};
