import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import i18n from '../utils/i18n';

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
  const [language, setLanguageState] = useState<'en' | 'ar'>('en');
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [followSystemTheme, setFollowSystemTheme] = useState(true);

  // ── Listen to system theme changes ────────────────────────────────────────
  useEffect(() => {
    if (followSystemTheme && colorScheme && isReady) {
      console.log('🎨 System theme changed to:', colorScheme);
      setThemeState(colorScheme);
    }
  }, [colorScheme, followSystemTheme, isReady]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync('theme');
        const savedLanguage = await SecureStore.getItemAsync('language');
        const savedFollowSystemTheme = await SecureStore.getItemAsync('followSystemTheme');

        // ── Follow System Theme ────────────────────────────────────────────
        const shouldFollowSystem = savedFollowSystemTheme !== 'false';
        setFollowSystemTheme(shouldFollowSystem);

        // ── Theme ──────────────────────────────────────────────────────────
        let finalTheme: 'light' | 'dark';

        if (!shouldFollowSystem && (savedTheme === 'dark' || savedTheme === 'light')) {
          // Use saved theme if user manually changed it
          finalTheme = savedTheme;
          console.log('🎨 Using saved theme:', finalTheme);
        } else {
          // Follow system theme
          const systemTheme = colorScheme || 'light';
          finalTheme = systemTheme;
          
          console.log('🎨 Following system theme:', systemTheme);
        }

        setThemeState(finalTheme);
        setColorScheme(finalTheme);

        // ── Language ───────────────────────────────────────────────────────
        let finalLanguage: 'en' | 'ar';

        if (savedLanguage === 'ar' || savedLanguage === 'en') {
          // Use saved language if exists
          finalLanguage = savedLanguage;
        } else {
          // Get device language
          const deviceLocale = Localization.getLocales()[0];
          const deviceLanguage = deviceLocale?.languageCode || 'en';
          
          // Check if device language is Arabic
          finalLanguage = deviceLanguage === 'ar' ? 'ar' : 'en';
          
          // Save the detected language
          await SecureStore.setItemAsync('language', finalLanguage);
          
          console.log('📱 Device language detected:', deviceLanguage);
          console.log('🌍 App language set to:', finalLanguage);
        }
        
        setLanguageState(finalLanguage);
        i18n.changeLanguage(finalLanguage);

        // ── RTL Support ────────────────────────────────────────────────────
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
  }, [colorScheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    setColorScheme(newTheme);
    await SecureStore.setItemAsync('theme', newTheme);
    
    // Stop following system theme when user manually changes it
    setFollowSystemTheme(false);
    await SecureStore.setItemAsync('followSystemTheme', 'false');
    
    console.log('🎨 Theme manually changed to:', newTheme);
  };

  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguageState(newLang);
    i18n.changeLanguage(newLang);
    await SecureStore.setItemAsync('language', newLang);
    
    const isRTL = newLang === 'ar';
    
    // Only force RTL if it's different from current state
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      
      // Show alert to user that app needs restart for RTL to take full effect
      // But don't force reload - let them continue using the app
      console.log('⚠️ RTL changed. Some UI elements may need app restart to update fully.');
    }
    
    // Don't reload the app - just change the language
    // The UI will update automatically through state change
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
