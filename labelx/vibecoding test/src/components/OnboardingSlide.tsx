import React from "react";
import { View, Text, StyleSheet, ImageBackground, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface OnboardingSlideProps {
  title: string;
  subtitle?: string;
  image?: any;
  backgroundColor?: string;
  showButton?: boolean;
  buttonText?: string;
  onButtonPress?: () => void;
  showLoginLink?: boolean;
  onLoginPress?: () => void;
}

export default function OnboardingSlide({
  title,
  subtitle,
  image,
  backgroundColor = "#FFFFFF",
  showButton = false,
  buttonText = "開始設定",
  onButtonPress,
  showLoginLink = false,
  onLoginPress,
}: OnboardingSlideProps) {
  const insets = useSafeAreaInsets();

  if (image) {
    // Image-based slide
    return (
      <View style={styles.container}>
        <ImageBackground
          source={image}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          {/* Top Logo */}
          <View style={[styles.topSection, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.logoText}>LabelX</Text>
          </View>

          {/* Bottom Content */}
          <LinearGradient
            colors={["transparent", "rgba(0, 0, 0, 0.7)", "rgba(0, 0, 0, 0.85)"]}
            style={styles.bottomGradient}
          >
            <View style={[styles.bottomContent, { paddingBottom: insets.bottom + 24 }]}>
              <Text style={styles.titleText}>{title}</Text>
              {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}

              {showButton && (
                <>
                  <Pressable
                    style={styles.button}
                    onPress={onButtonPress}
                    android_ripple={{ color: "#249C6A" }}
                  >
                    <Text style={styles.buttonText}>{buttonText}</Text>
                  </Pressable>

                  {showLoginLink && (
                    <Pressable onPress={onLoginPress} style={styles.loginLink}>
                      <Text style={styles.loginLinkText}>
                        已經有帳號了？ <Text style={styles.loginLinkBold}>登入</Text>
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  }

  // Plain background slide (for splash)
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.plainContent}>
        <Text style={styles.titleText}>{title}</Text>
        {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
  },
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  topSection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    justifyContent: "flex-end",
  },
  bottomContent: {
    paddingHorizontal: 32,
    alignItems: "center",
  },
  titleText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 48,
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    width: "100%",
    backgroundColor: "#2CB67D",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  loginLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  loginLinkBold: {
    fontWeight: "700",
    color: "#2CB67D",
  },
  plainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
});
