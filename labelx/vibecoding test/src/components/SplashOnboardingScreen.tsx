import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

interface SplashOnboardingScreenProps {
  onComplete: () => void;
}

export default function SplashOnboardingScreen({ onComplete }: SplashOnboardingScreenProps) {
  useEffect(() => {
    // Auto-advance to next slide after 2 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <LinearGradient
      colors={["#2CB67D", "#249C6A", "#1E8A5A"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.logoText}>LabelX</Text>
          <Text style={styles.tagline}>Label Inspection</Text>
        </View>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 56,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  loaderContainer: {
    paddingBottom: 60,
    alignItems: "center",
  },
});
