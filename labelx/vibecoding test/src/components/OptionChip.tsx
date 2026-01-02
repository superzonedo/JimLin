import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface OptionChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  multiSelect?: boolean;
  disabled?: boolean;
  variant?: "default" | "large";
}

export default function OptionChip({
  label,
  isSelected,
  onPress,
  icon,
  multiSelect = false,
  disabled = false,
  variant = "default",
}: OptionChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const isLarge = variant === "large";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        animatedStyle,
        isLarge ? styles.largeContainer : styles.container,
        isSelected
          ? styles.selectedBackground
          : styles.unselectedBackground,
        disabled && styles.disabled,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={isLarge ? 32 : 20}
          color={isSelected ? "#FFFFFF" : "#001858"}
          style={isLarge ? styles.largeIcon : styles.icon}
        />
      )}
      {multiSelect && !icon && (
        <Ionicons
          name={isSelected ? "checkmark-circle" : "ellipse-outline"}
          size={20}
          color={isSelected ? "#FFFFFF" : "#6B7280"}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          isLarge ? styles.largeText : styles.text,
          isSelected ? styles.selectedText : styles.unselectedText,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 9999,
    gap: 8,
  },
  largeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 16,
    gap: 12,
    minHeight: 80,
    width: "100%",
  },
  selectedBackground: {
    backgroundColor: "#2CB67D",
  },
  unselectedBackground: {
    backgroundColor: "#F3F4F6",
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 0,
  },
  largeIcon: {
    marginRight: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  largeText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    flexShrink: 1,
  },
  selectedText: {
    color: "#FFFFFF",
  },
  unselectedText: {
    color: "#001858",
  },
});
