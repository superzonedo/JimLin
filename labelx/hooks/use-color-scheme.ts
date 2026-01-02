import { useEffect, useState } from 'react';
import { Appearance, useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() => {
    // 獲取當前主題，優先使用 Appearance 設置的主題
    return Appearance.getColorScheme() || systemColorScheme || 'light';
  });

  useEffect(() => {
    // 監聽主題變化
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      if (newColorScheme) {
        setColorScheme(newColorScheme);
      }
    });

    // 初始設置當前主題
    const currentScheme = Appearance.getColorScheme();
    if (currentScheme) {
      setColorScheme(currentScheme);
    }

    return () => subscription.remove();
  }, []);

  return colorScheme;
}
