
import { Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const EmptyState = () => {
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <h3 className="text-lg font-medium">{t('messages.your_messages')}</h3>
        <p className="text-gray-500 max-w-xs mx-auto mt-1">
          {t('messages.select_conversation')}
        </p>
      </div>
    </div>
  );
};
