import React, { useState } from "react";
import { View, Text, StyleSheet, ImageBackground, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import SplashOnboardingScreen from "../components/SplashOnboardingScreen";
import { useLanguage } from "../i18n";
import { useUserStore } from "../state/userStore";

type OnboardingStackParamList = {
  Welcome: undefined;
  Questions: undefined;
  Complete: { showAuthPrompt: boolean };
};

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [showSplash, setShowSplash] = useState(true);
  const { t } = useLanguage();
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleGetStarted = () => {
    navigation.navigate("Questions");
  };

  const handleSkipOnboarding = () => {
    // Skip onboarding with default values
    completeOnboarding(
      {
        careAboutFoodSafety: true,
        dietAwareness: "",
        careAboutAdditives: true,
        understandLabels: true,
        worryAboutCancer: true,
        familyMembers: [],
        gender: "",
        ageGroup: "",
      },
      {}
    );
  };

  if (showSplash) {
    return <SplashOnboardingScreen onComplete={handleSplashComplete} />;
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/onboarding/hero-scanning.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Very light gradient overlay - only at bottom for text readability */}
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0.4)"]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Top Logo */}
            <View style={styles.header}>
              <Text style={styles.logoText}>Labelx</Text>
            </View>

            {/* Bottom Content */}
            <View style={styles.content}>
              <Text style={styles.title}>{t.welcome.smartScan}{"\n"}{t.welcome.healthyChoice}</Text>

              <Pressable
                style={({ pressed }) => [
                  styles.getStartedButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleGetStarted}
              >
                <Text style={styles.getStartedText}>{t.onboarding.getStarted}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.skipButton,
                  pressed && styles.skipButtonPressed,
                ]}
                onPress={handleSkipOnboarding}
              >
                <Text style={styles.skipButtonText}>{t.welcome.skipOnboarding}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  content: {
    paddingHorizontal: 32,
    paddingBottom: 50,
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 40,
    lineHeight: 50,
    textAlign: "center",
  },
  getStartedButton: {
    backgroundColor: "#2CB67D",
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonPressed: {
    opacity: 0.6,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
});
