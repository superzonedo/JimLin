import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import TabNavigator from "./src/navigation/TabNavigator";
import OnboardingNavigator from "./src/navigation/OnboardingNavigator";
import { useUserStore } from "./src/state/userStore";
import { useSubscriptionStore } from "./src/state/subscriptionStore";
import { LanguageProvider } from "./src/i18n";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project.
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    // Initialize app and sync subscription status
    const initApp = async () => {
      try {
        // RevenueCat is automatically initialized by revenuecatClient
        // Just sync subscription status (works for anonymous users too)
        await useSubscriptionStore.getState().syncFromRevenueCat();
        console.log('App initialized and subscription synced');
      } catch (error) {
        console.error('Failed to sync subscription:', error);
        // Continue app initialization even if sync fails
      }

      // Done loading
      setAuthLoading(false);
    };

    initApp();
  }, []);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#2CB67D" />
      </View>
    );
  }

  // Show onboarding first if not completed
  if (!hasCompletedOnboarding) {
    return (
      <LanguageProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <NavigationContainer>
              <OnboardingNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <TabNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </LanguageProvider>
  );
}
