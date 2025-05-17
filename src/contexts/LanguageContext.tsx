
import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations, defaultLocale, Locale } from '@/translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  
  // Function to get translation for a key
  const t = (key: string): string => {
    return translations[locale][key] || translations[defaultLocale][key] || key;
  };
  
  // Try to detect user's language based on browser settings or IP location
  useEffect(() => {
    const detectUserLanguage = async () => {
      try {
        // Try to use navigator.language first (browser setting)
        const browserLang = navigator.language.split('-')[0];
        
        if (browserLang === 'fr') {
          setLocale('fr');
          return;
        }
        
        // If browser language is not French, try to use IP-based geolocation
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_code === 'FR') {
          setLocale('fr');
          console.log('Setting language to French based on IP location');
        } else {
          setLocale('en');
          console.log('Setting language to English based on IP location');
        }
      } catch (error) {
        console.error('Error detecting user language:', error);
        // Default to French if detection fails
        setLocale('fr');
      }
    };
    
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('language') as Locale | null;
    
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLocale(savedLanguage);
      console.log(`Using saved language preference: ${savedLanguage}`);
    } else {
      detectUserLanguage();
    }
  }, []);
  
  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem('language', locale);
  }, [locale]);
  
  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
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
