
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { translations, defaultLocale, Locale } from '@/translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Function to get translation for a key
  const t = (key: string): string => {
    return translations[locale][key] || translations[defaultLocale][key] || key;
  };
  
  // Handle language routing
  useEffect(() => {
    // Check if the URL starts with a language prefix
    const path = location.pathname;
    
    if (path.startsWith('/fr')) {
      setLocale('fr');
    } else if (path.startsWith('/en')) {
      setLocale('en');
    } else {
      // No language prefix, try to detect user's language
      try {
        const browserLang = navigator.language.split('-')[0];
        
        if (browserLang === 'fr') {
          navigate(`/fr${path === '/' ? '' : path}`, { replace: true });
        } else {
          navigate(`/en${path === '/' ? '' : path}`, { replace: true });
        }
      } catch (error) {
        console.error('Error detecting user language:', error);
        navigate(`/fr${path === '/' ? '' : path}`, { replace: true });
      }
    }
  }, [location.pathname]);
  
  // Handle language change
  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    
    // Update URL to reflect language change
    const currentPath = location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(fr|en)/, '') || '/';
    
    navigate(`/${newLocale}${pathWithoutLang}`, { replace: true });
  };
  
  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};
