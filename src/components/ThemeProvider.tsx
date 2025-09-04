import { createContext, useContext, useEffect, useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface ThemeContextType {
  theme: any;
  updateTheme: (theme: any) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const ThemeProvider = ({ children, userId }: ThemeProviderProps) => {
  const { getTheme, updateTheme: updateSiteTheme } = useSiteSettings(userId);
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    const currentTheme = getTheme();
    setTheme(currentTheme);
    applyThemeToCSS(currentTheme);
  }, [getTheme]);

  const updateTheme = (newTheme: any) => {
    setTheme(newTheme);
    applyThemeToCSS(newTheme);
    if (userId) {
      updateSiteTheme(newTheme);
    }
  };

  const applyThemeToCSS = (themeData: any) => {
    const root = document.documentElement;
    
    if (themeData.colors) {
      Object.entries(themeData.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value as string);
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};