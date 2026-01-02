import { useRouter } from 'expo-router';

/**
 * 安全的返回導航函數
 * 如果可以返回則返回，否則導航到默認頁面
 */
export function useSafeBack() {
  const router = useRouter();

  const safeBack = (fallbackRoute: string = '/(tabs)/home') => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute as any);
    }
  };

  return safeBack;
}

