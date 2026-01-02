import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HistoryStackParamList } from "../types/navigation";
import HistoryScreen from "../screens/HistoryScreen";
import ResultScreen from "../screens/ResultScreen";
import HealthAnalysisScreen from "../screens/HealthAnalysisScreen";
import PremiumPaywallScreen from "../screens/PremiumPaywallScreen";

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export default function HistoryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="HistoryList" component={HistoryScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen
        name="HealthAnalysis"
        component={HealthAnalysisScreen}
        options={{
          headerShown: true,
          headerTitle: "健康分析",
          headerBackTitle: "返回",
        }}
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
