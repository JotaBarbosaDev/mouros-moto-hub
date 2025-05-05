
import { ReactNode, useEffect } from 'react';
import { useSystemSettings } from '@/hooks/use-system-settings';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { settings, isLoading } = useSystemSettings();

  useEffect(() => {
    if (!isLoading && settings?.themeColor) {
      // Apply theme color to CSS variables
      document.documentElement.style.setProperty('--mouro-red', settings.themeColor);
    }
  }, [settings, isLoading]);

  return <>{children}</>;
}
