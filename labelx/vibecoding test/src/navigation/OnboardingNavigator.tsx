import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import OnboardingQuestionsScreen from "../screens/OnboardingQuestionsScreen";
import OnboardingCompleteScreen from "../screens/OnboardingCompleteScreen";
import { AllergenType, HealthGoal, DiseaseType } from "../types/user";

export type OnboardingStackParamList = {
  Welcome: undefined;
  Questions: undefined;
  Complete: { 
    showAuthPrompt: boolean;
    answers: {
      careAboutFoodSafety: boolean | null;
      dietAwareness: string | null;
      allergens: (AllergenType | "none")[];
      healthGoals: HealthGoal[];
      diseases: (DiseaseType | "none")[];
      familyMembers: string[];
      gender: string | null;
      ageGroup: string | null;
    };
  };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Questions" component={OnboardingQuestionsScreen} />
      <Stack.Screen name="Complete" component={OnboardingCompleteScreen} />
    </Stack.Navigator>
  );
}
