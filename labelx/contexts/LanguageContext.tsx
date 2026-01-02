import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { loadLanguage, setLanguage, saveLanguage, addLanguageListener, type Language, translations } from '@/utils/i18n';

interface LanguageContextType {
  language: Language;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh-TW');
  const [languageVersion, setLanguageVersion] = useState(0); // 用於強制更新
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 載入保存的語言設定
    loadLanguage().then((lang) => {
      setLanguageState(lang);
      setIsLoading(false);
    });

    // 監聽語言變化
    const removeListener = addLanguageListener((lang) => {
      setLanguageState(lang);
    });

    return () => removeListener();
  }, []);

  const handleSetLanguage = useCallback(async (lang: Language) => {
    await saveLanguage(lang);
    // 無論是否相同，都更新 state 和版本號，確保觸發重新渲染
    setLanguageState(lang);
    // 增加版本號，強制所有組件重新渲染
    setLanguageVersion(prev => prev + 1);
    // 確保全局語言也更新
    setLanguage(lang);
  }, []);

  // 使用 useMemo 確保當 language 變化時，t 函數會使用新的語言
  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      const keys = key.split('.');
      let value: any = translations[language];
      
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) {
          // 如果找不到，回退到繁體中文
          value = translations['zh-TW'];
          for (const k2 of keys) {
            value = value?.[k2];
          }
          break;
        }
      }
      
      if (typeof value !== 'string') {
        // 如果還是找不到，嘗試返回 key 的最後一部分
        const lastKey = keys[keys.length - 1];
        return lastKey || key;
      }
      
      // 替換參數
      if (params) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey]?.toString() || match;
        });
      }
      
      return value;
    };
  }, [language]);

  if (isLoading) {
    return null; // 或者返回一個載入指示器
  }

  // 使用 useMemo 確保當 language、t 或 languageVersion 變化時，value 對象會創建新引用
  const contextValue = useMemo(() => ({
    language,
    t,
    setLanguage: handleSetLanguage,
    languageVersion, // 包含版本號，確保即使語言相同也能觸發更新
  }), [language, t, handleSetLanguage, languageVersion]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

