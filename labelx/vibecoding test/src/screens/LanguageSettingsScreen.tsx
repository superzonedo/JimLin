import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useLanguage } from "../i18n";
import { SupportedLanguage } from "../i18n/translations";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LanguageSettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { language, t, setLanguage, availableLanguages } = useLanguage();

  const handleLanguageSelect = async (langId: SupportedLanguage) => {
    if (langId !== language) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLanguage(langId);
    }
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-white border-b border-gray-200"
      >
        <View className="flex-row items-center px-6 py-4">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text className="text-lg font-semibold text-[#001858] ml-4">
            {t.languageSettings.title}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Options */}
        <View className="px-6 mt-6">
          <View className="bg-white rounded-3xl overflow-hidden" style={styles.card}>
            {availableLanguages.map((lang, index) => {
              const isSelected = language === lang.id;
              return (
                <LanguageOption
                  key={lang.id}
                  flag={lang.flag}
                  label={lang.label}
                  isSelected={isSelected}
                  isLast={index === availableLanguages.length - 1}
                  onPress={() => handleLanguageSelect(lang.id)}
                />
              );
            })}
          </View>
        </View>

        {/* Info Note */}
        <View className="px-6 mt-4">
          <Animated.View
            entering={FadeIn.delay(200)}
            className="bg-blue-50 rounded-2xl p-4"
          >
            <View className="flex-row">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text className="text-sm text-gray-700 ml-3 flex-1 leading-5">
                {t.languageSettings.changeLanguageNote}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Current Language Display */}
        <View className="px-6 mt-6">
          <View className="bg-white rounded-2xl p-5" style={styles.card}>
            <Text className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              {t.languageSettings.currentLanguage}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">
                {availableLanguages.find(l => l.id === language)?.flag}
              </Text>
              <Text className="text-xl font-bold text-[#001858]">
                {availableLanguages.find(l => l.id === language)?.label}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

interface LanguageOptionProps {
  flag: string;
  label: string;
  isSelected: boolean;
  isLast: boolean;
  onPress: () => void;
}

function LanguageOption({ flag, label, isSelected, isLast, onPress }: LanguageOptionProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle]}
    >
      <View
        className={`flex-row items-center justify-between p-4 ${
          isSelected ? "bg-green-50" : ""
        }`}
        style={!isLast ? styles.itemBorder : {}}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-3">{flag}</Text>
          <Text
            className={`text-base font-medium ${
              isSelected ? "text-[#2CB67D]" : "text-[#001858]"
            }`}
          >
            {label}
          </Text>
        </View>
        {isSelected && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <View className="bg-[#2CB67D] rounded-full p-1">
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          </Animated.View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
});
