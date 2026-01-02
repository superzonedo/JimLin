import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ScanStackParamList } from "../types/navigation";
import CameraScreen from "../screens/CameraScreen";
import ResultScreen from "../screens/ResultScreen";
import HealthAnalysisScreen from "../screens/HealthAnalysisScreen";
import PremiumPaywallScreen from "../screens/PremiumPaywallScreen";

const Stack = createNativeStackNavigator<ScanStackParamList>();

export default function ScanNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Camera"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          animation: "fade",
        }}
      />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen
        name="HealthAnalysis"
        component={HealthAnalysisScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "Health Analysis", // Fallback English, will be translated in component
          headerBackTitle: "Back",
        })}
      />
      <Stack.Screen
        name="PremiumPaywall"
        component={PremiumPaywallScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack.Navigator>
  );
}
