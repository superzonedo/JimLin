import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../types/navigation";
import HomeScreen from "../screens/HomeScreen";
import ResultScreen from "../screens/ResultScreen";
import HealthAnalysisScreen from "../screens/HealthAnalysisScreen";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
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
    </Stack.Navigator>
  );
}
