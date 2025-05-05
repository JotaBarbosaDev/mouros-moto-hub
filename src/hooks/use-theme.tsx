
import { useState, useEffect } from 'react';
import { useSystemSettings } from './use-system-settings';

export const useTheme = () => {
  const { settings, isLoading } = useSystemSettings();
  const [themeColor, setThemeColor] = useState<string>('#ea384c'); // Default color

  useEffect(() => {
    if (!isLoading && settings?.themeColor) {
      setThemeColor(settings.themeColor);
      
      // Apply theme color to CSS variables
      document.documentElement.style.setProperty('--mouro-red', settings.themeColor);
    }
  }, [settings, isLoading]);

  return {
    themeColor,
    isLoading
  };
};
