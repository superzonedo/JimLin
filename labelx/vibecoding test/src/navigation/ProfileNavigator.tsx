import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../types/navigation";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import PaywallScreen from "../screens/PaywallScreen";
import NotificationSettingsScreen from "../screens/NotificationSettingsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import TermsOfServiceScreen from "../screens/TermsOfServiceScreen";
import CookiePolicyScreen from "../screens/CookiePolicyScreen";
import HelpCenterScreen from "../screens/HelpCenterScreen";
import AboutScreen from "../screens/AboutScreen";
import LanguageSettingsScreen from "../screens/LanguageSettingsScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
          headerShown: false,
        }}
      />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="CookiePolicy" component={CookiePolicyScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
    </Stack.Navigator>
  );
}
