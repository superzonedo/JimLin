import { AllergenType, HealthGoal, DiseaseType } from "./user";

export type RootTabParamList = {
  HomeTab: undefined;
  ScanTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

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

export type HomeStackParamList = {
  Home: undefined;
  Result: undefined;
  HealthAnalysis: undefined;
};

export type ScanStackParamList = {
  Camera: undefined;
  Result: undefined;
  HealthAnalysis: undefined;
  PremiumPaywall: { source?: string };
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  Result: undefined;
  HealthAnalysis: undefined;
  PremiumPaywall: { source?: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  Subscription: undefined;
  Paywall: { source?: string };
  SubscriptionManagement: undefined;
  NotificationSettings: undefined;
  Privacy: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  CookiePolicy: undefined;
  HelpCenter: undefined;
  About: undefined;
  LanguageSettings: undefined;
};
