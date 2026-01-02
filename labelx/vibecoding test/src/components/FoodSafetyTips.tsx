import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Dimensions, StyleSheet, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface FoodTip {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  gradient: string[];
  emoji: string;
}

const FOOD_SAFETY_TIPS: FoodTip[] = [
  {
    id: "1",
    icon: "shield-checkmark",
    title: "認識 E 編碼",
    description: "E100-E199 為色素，E200-E299 為防腐劑，了解編碼讓你更安心選擇",
    gradient: ["#667eea", "#764ba2"],
    emoji: "🔬",
  },
  {
    id: "2",
    icon: "water-outline",
    title: "糖分攝取建議",
    description: "WHO 建議每日糖分不超過 50 克，約等於 10 顆方糖",
    gradient: ["#f093fb", "#f5576c"],
    emoji: "🍬",
  },
  {
    id: "3",
    icon: "flame-outline",
    title: "鈉含量要注意",
    description: "每日鈉攝取不超過 2000mg，高鈉易導致高血壓",
    gradient: ["#4facfe", "#00f2fe"],
    emoji: "🧂",
  },
  {
    id: "4",
    icon: "eye-outline",
    title: "學會看標籤",
    description: "成分表前 3 項是含量最高的，優先關注這些成分",
    gradient: ["#43e97b", "#38f9d7"],
    emoji: "👀",
  },
  {
    id: "5",
    icon: "warning-outline",
    title: "謹慎攝取添加劑",
    description: "E250、E621 等添加劑需適量，過量可能影響健康",
    gradient: ["#fa709a", "#fee140"],
    emoji: "⚠️",
  },
  {
    id: "6",
    icon: "leaf-outline",
    title: "天然更健康",
    description: "選擇天然、有機食品，減少人工添加劑對身體的負擔",
    gradient: ["#30cfd0", "#330867"],
    emoji: "🌿",
  },
  {
    id: "7",
    icon: "time-outline",
    title: "保質期的秘密",
    description: "保質期越長，防腐劑通常越多，新鮮食物更健康",
    gradient: ["#a8edea", "#fed6e3"],
    emoji: "⏰",
  },
  {
    id: "8",
    icon: "heart-outline",
    title: "均衡飲食最重要",
    description: "多樣化飲食搭配新鮮蔬果，是維持健康的黃金法則",
    gradient: ["#ff9a9e", "#fecfef"],
    emoji: "💚",
  },
  {
    id: "9",
    icon: "fitness-outline",
    title: "運動配合飲食",
    description: "健康飲食搭配適量運動，讓身體更有活力",
    gradient: ["#fbc2eb", "#a6c1ee"],
    emoji: "💪",
  },
  {
    id: "10",
    icon: "water",
    title: "多喝水很重要",
    description: "每天 8 杯水，促進新陳代謝，幫助身體排毒",
    gradient: ["#74ebd5", "#acb6e5"],
    emoji: "💧",
  },
];

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 48;

export default function FoodSafetyTips() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const userInteracted = useRef(false);

  const startAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }

    autoScrollTimer.current = setInterval(() => {
      if (!userInteracted.current && scrollViewRef.current) {
        const nextIndex = (activeIndex + 1) % FOOD_SAFETY_TIPS.length;
        scrollViewRef.current.scrollTo({
          x: nextIndex * CARD_WIDTH,
          animated: true,
        });
        setActiveIndex(nextIndex);
      }
    }, 5000);
  };

  useEffect(() => {
    startAutoScroll();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [activeIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / CARD_WIDTH);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const handleScrollBeginDrag = () => {
    userInteracted.current = true;
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
  };

  const handleScrollEndDrag = () => {
    userInteracted.current = false;
    startAutoScroll();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        snapToAlignment="center"
        contentContainerStyle={styles.scrollContent}
      >
        {FOOD_SAFETY_TIPS.map((tip) => (
          <LinearGradient
            key={tip.id}
            colors={tip.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.tipCard, { width: CARD_WIDTH }]}
          >
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{tip.emoji}</Text>
            </View>
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Ionicons name={tip.icon} size={20} color="#FFFFFF" style={styles.titleIcon} />
                <Text style={styles.tipTitle}>{tip.title}</Text>
              </View>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {FOOD_SAFETY_TIPS.map((tip, index) => (
          <View
            key={tip.id}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  tipCard: {
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 120,
  },
  emojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  emoji: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  titleIcon: {
    marginRight: 8,
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tipDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.95)",
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: "#2CB67D",
  },
});
