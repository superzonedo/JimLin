import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";

interface CircularProgressIndicatorProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
}

const getScoreColor = (score: number) => {
  // Apple System Red / Green / Orange - lower saturation
  if (score >= 71) return "#34C759"; // Apple Green (System Green)
  if (score >= 31) return "#FF9500"; // Apple Orange
  return "#FF3B30"; // Apple System Red
};

export const CircularProgressIndicator: React.FC<CircularProgressIndicatorProps> = ({
  score,
  size = 150,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animation progress (0 to 1)
  const animationProgress = useSharedValue(0);
  const [displayScore, setDisplayScore] = useState(score);
  const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);

  useEffect(() => {
    // Animate progress
    animationProgress.value = withTiming(score / 100, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });

    // 立即顯示最終分數
    setDisplayScore(score);

    // Animate stroke offset
    let currentScore = 0;
    const interval = setInterval(() => {
      currentScore += score / 50; // 50 frames over 1000ms
      if (currentScore >= score) {
        setStrokeDashoffset(0);
        clearInterval(interval);
      } else {
        const progress = currentScore / 100;
        setStrokeDashoffset(circumference * (1 - progress));
      }
    }, 20);

    return () => clearInterval(interval);
  }, [score, circumference]);

  const scoreColor = getScoreColor(score);

  // Create animated number style for fade in
  const numberStyle = useAnimatedStyle(() => ({
    opacity: animationProgress.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <G>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#D1D1D6"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />

          {/* Progress circle with dash animation */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Center content */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.centerContent, numberStyle]}>
        <Text style={[styles.scoreNumber, { color: scoreColor }]}>
          {displayScore}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: "600", // SF Pro Rounded Medium weight
    letterSpacing: -0.5,
  },
});
