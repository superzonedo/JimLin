import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useUserStore } from "../state/userStore";
import { HealthGoal, DiseaseType } from "../types/user";
import PaywallScreen from "./PaywallScreen";

type OnboardingStackParamList = {
  Welcome: undefined;
  Questions: undefined;
  Complete: {
    showAuthPrompt: boolean;
    answers: {
      careAboutFoodSafety: boolean | null;
      dietAwareness: string | null;
      careAboutAdditives: boolean | null;
      understandLabels: boolean | null;
      worryAboutCancer: boolean | null;
      healthGoals: HealthGoal[];
      diseases: (DiseaseType | "none")[];
      familyMembers: string[];
      gender: string | null;
      ageGroup: string | null;
    };
  };
};

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;
type CompleteScreenRouteProp = RouteProp<OnboardingStackParamList, "Complete">;

export default function OnboardingCompleteScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CompleteScreenRouteProp>();
  const { showAuthPrompt, answers } = route.params;
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    // Save onboarding data when screen mounts
    if (answers) {
      // Filter out "none" values from diseases
      const cleanDiseases = answers.diseases.filter((d): d is DiseaseType => d !== "none");

      const onboardingData = {
        careAboutFoodSafety: answers.careAboutFoodSafety ?? false,
        dietAwareness: answers.dietAwareness ?? "",
        careAboutAdditives: answers.careAboutAdditives ?? false,
        understandLabels: answers.understandLabels ?? false,
        worryAboutCancer: answers.worryAboutCancer ?? false,
        familyMembers: answers.familyMembers,
        gender: answers.gender ?? "",
        ageGroup: answers.ageGroup ?? "",
      };

      const preferences = {
        healthGoals: answers.healthGoals,
        diseases: cleanDiseases,
      };

      completeOnboarding(onboardingData, preferences);
    }
  }, []);

  const handleContinue = () => {
    // Show paywall after onboarding
    setShowPaywall(true);
  };

  const handlePaywallClose = () => {
    // Close paywall and go to main app
    setShowPaywall(false);
    navigateToHome();
  };

  const navigateToHome = () => {
    // Reset navigation to main app (TabNavigator)
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Welcome" as never }], // This will be caught by App.tsx routing
      })
    );
  };

  const navigateToAuth = () => {
    // User wants to login/signup
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Welcome" as never }], // This will be caught by App.tsx routing
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={120} color="#2CB67D" />
        </View>

        {/* Headline */}
        <Text style={styles.headline}>設定完成！</Text>

        {/* Message */}
        <Text style={styles.message}>
          我們已根據您的需求個人化您的掃描體驗
        </Text>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#2CB67D" />
            <Text style={styles.summaryText}>
              食品安全意識: {answers.careAboutFoodSafety === false ? "非常在意" : "不太在意"}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="fitness-outline" size={20} color="#2CB67D" />
            <Text style={styles.summaryText}>
              健康目標: {answers.healthGoals.length} 項
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="medical-outline" size={20} color="#EF4444" />
            <Text style={styles.summaryText}>
              健康狀況: {answers.diseases.filter((d) => d !== "none").length} 項
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="people-outline" size={20} color="#2CB67D" />
            <Text style={styles.summaryText}>
              關注成員: {answers.familyMembers.join("、")}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!isLoggedIn && showAuthPrompt ? (
          <>
            <Pressable style={styles.primaryButton} onPress={navigateToAuth}>
              <Text style={styles.primaryButtonText}>註冊/登入以儲存設定</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={handleContinue}>
              <Text style={styles.secondaryButtonText}>稍後再說，繼續</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>繼續</Text>
          </Pressable>
        )}
      </View>

      {/* Paywall Modal */}
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <PaywallScreen
          onClose={handlePaywallClose}
          source="onboarding"
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  headline: {
    fontSize: 32,
    fontWeight: "700",
    color: "#001858",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  summaryContainer: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryText: {
    fontSize: 15,
    color: "#001858",
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#2CB67D",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#2CB67D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2CB67D",
    fontSize: 16,
    fontWeight: "600",
  },
});
