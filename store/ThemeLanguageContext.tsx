import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import i18n from '../utils/i18n';
import { useColorScheme } from 'nativewind';

interface ThemeLanguageContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: 'en' | 'ar';
  toggleLanguage: () => void;
  isReady: boolean;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [language, setLanguageState] = useState<'en' | 'ar'>('ar');
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync('theme');
        const savedLanguage = await SecureStore.getItemAsync('language');

        if (savedTheme === 'dark' || savedTheme === 'light') {
          setThemeState(savedTheme);
          setColorScheme(savedTheme);
        } else {
            setColorScheme('light');
        }

        const finalLanguage = (savedLanguage === 'ar' || savedLanguage === 'en') ? savedLanguage : 'ar';
        
        setLanguageState(finalLanguage);
        i18n.changeLanguage(finalLanguage);
        
        if (!savedLanguage) {
          await SecureStore.setItemAsync('language', 'ar');
        }

        const isRTL = finalLanguage === 'ar';
        if (I18nManager.isRTL !== isRTL) {
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadPreferences();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    setColorScheme(newTheme);
    await SecureStore.setItemAsync('theme', newTheme);
  };

  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguageState(newLang);
    i18n.changeLanguage(newLang);
    await SecureStore.setItemAsync('language', newLang);
    
    const isRTL = newLang === 'ar';
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    setTimeout(() => {
      Updates.reloadAsync();
    }, 100);
  };

  return (
    <ThemeLanguageContext.Provider value={{ theme, toggleTheme, language, toggleLanguage, isReady }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (context === undefined) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};
