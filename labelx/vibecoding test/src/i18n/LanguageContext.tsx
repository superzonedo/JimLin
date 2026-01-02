import React, { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
import { useUserStore } from "../state/userStore";
import { translations, SupportedLanguage, Translations } from "./translations";

interface LanguageContextType {
  language: SupportedLanguage;
  t: Translations;
  setLanguage: (lang: SupportedLanguage) => void;
  getLanguageLabel: (lang: SupportedLanguage) => string;
  getLanguageFlag: (lang: SupportedLanguage) => string;
  availableLanguages: Array<{
    id: SupportedLanguage;
    label: string;
    flag: string;
  }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const language = useUserStore((s) => s.preferences.language);
  const updatePreferences = useUserStore((s) => s.updatePreferences);

  const setLanguage = useCallback(
    (lang: SupportedLanguage) => {
      updatePreferences({ language: lang });
    },
    [updatePreferences]
  );

  const t = useMemo(() => translations[language], [language]);

  const getLanguageLabel = useCallback((lang: SupportedLanguage): string => {
    const labels: Record<SupportedLanguage, string> = {
      "zh-TW": "繁體中文",
      "zh-CN": "简体中文",
      en: "English",
    };
    return labels[lang];
  }, []);

  const getLanguageFlag = useCallback((lang: SupportedLanguage): string => {
    const flags: Record<SupportedLanguage, string> = {
      "zh-TW": "🇹🇼",
      "zh-CN": "🇨🇳",
      en: "🇺🇸",
    };
    return flags[lang];
  }, []);

  const availableLanguages = useMemo(
    () => [
      { id: "zh-TW" as SupportedLanguage, label: "繁體中文", flag: "🇹🇼" },
      { id: "zh-CN" as SupportedLanguage, label: "简体中文", flag: "🇨🇳" },
      { id: "en" as SupportedLanguage, label: "English", flag: "🇺🇸" },
    ],
    []
  );

  const value = useMemo(
    () => ({
      language,
      t,
      setLanguage,
      getLanguageLabel,
      getLanguageFlag,
      availableLanguages,
    }),
    [language, t, setLanguage, getLanguageLabel, getLanguageFlag, availableLanguages]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Convenience hook for just translations
export function useTranslation(): Translations {
  const { t } = useLanguage();
  return t;
}

export default LanguageContext;
