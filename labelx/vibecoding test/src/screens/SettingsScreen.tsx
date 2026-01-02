import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../types/navigation";
import { useUserStore } from "../state/userStore";
import CustomAllergenModal from "../components/CustomAllergenModal";
import CustomDiseaseModal from "../components/CustomDiseaseModal";
import CustomHealthGoalModal from "../components/CustomHealthGoalModal";
import ExpandableDiseaseSelector from "../components/ExpandableDiseaseSelector";
import { useLanguage } from "../i18n";

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const {
    preferences,
    updatePreferences,
    toggleDisease,
    addCustomAllergen,
    removeCustomAllergen,
    addCustomDisease,
    removeCustomDisease,
    addCustomHealthGoal,
    removeCustomHealthGoal
  } = useUserStore();
  const [showCustomAllergenModal, setShowCustomAllergenModal] = useState(false);
  const [showCustomDiseaseModal, setShowCustomDiseaseModal] = useState(false);
  const [showCustomHealthGoalModal, setShowCustomHealthGoalModal] = useState(false);
  const [showExpandedDiseases, setShowExpandedDiseases] = useState(false);

  const healthGoals = [
    { id: "low-sodium", label: t.healthGoals.lowSodium, icon: "water-outline" },
    { id: "low-sugar", label: t.healthGoals.lowSugar, icon: "snow-outline" },
    { id: "high-fiber", label: t.healthGoals.highFiber, icon: "leaf-outline" },
    { id: "low-fat", label: t.healthGoals.lowFat, icon: "flame-outline" },
    { id: "high-protein", label: t.healthGoals.highProtein, icon: "barbell-outline" },
    { id: "weight-control", label: t.healthGoals.weightControl, icon: "scale-outline" },
    { id: "gut-health", label: t.healthGoals.gutHealth, icon: "restaurant-outline" },
  ];

  const diseases = [
    { id: "kidney-disease", label: t.diseases.kidneyDisease, icon: "medkit-outline" },
    { id: "liver-disease", label: t.diseases.liverDisease, icon: "pulse-outline" },
    { id: "skin-disease", label: t.diseases.skinDisease, icon: "hand-left-outline" },
    { id: "diabetes", label: t.diseases.diabetes, icon: "water-outline" },
    { id: "hypertension", label: t.diseases.hypertension, icon: "pulse-outline" },
    { id: "high-cholesterol", label: t.diseases.highCholesterol, icon: "heart-outline" },
    { id: "stomach-sensitivity", label: t.diseases.stomachSensitivity, icon: "restaurant-outline" },
    { id: "metabolic-disease", label: t.diseases.metabolicDisease, icon: "fitness-outline" },
  ];

  const allergens = [
    { id: "peanuts", label: t.allergens.peanuts },
    { id: "nuts", label: t.allergens.nuts },
    { id: "dairy", label: t.allergens.dairy },
    { id: "eggs", label: t.allergens.eggs },
    { id: "seafood", label: t.allergens.seafood },
    { id: "soy", label: t.allergens.soy },
    { id: "wheat", label: t.allergens.wheat },
    { id: "sesame", label: t.allergens.sesame },
    { id: "sulfites", label: t.allergens.sulfites },
    { id: "preservatives", label: t.allergens.preservatives },
    { id: "artificial-colors", label: t.allergens.artificialColors },
    { id: "artificial-flavors", label: t.allergens.artificialFlavors },
    { id: "msg", label: t.allergens.msg },
    { id: "gluten", label: t.allergens.gluten },
  ];

  const toggleHealthGoal = (goalId: string) => {
    const currentGoals = preferences.healthGoals;
    const newGoals = currentGoals.includes(goalId as any)
      ? currentGoals.filter((g) => g !== goalId)
      : [...currentGoals, goalId as any];
    updatePreferences({ healthGoals: newGoals });
  };

  const toggleAllergen = (allergenId: string) => {
    const currentAllergens = preferences.allergens;
    const newAllergens = currentAllergens.includes(allergenId as any)
      ? currentAllergens.filter((a) => a !== allergenId)
      : [...currentAllergens, allergenId as any];
    updatePreferences({ allergens: newAllergens });
  };

  const handleAddCustomAllergen = (allergen: string) => {
    addCustomAllergen(allergen);
  };

  const handleAddCustomDisease = (disease: string) => {
    addCustomDisease(disease);
  };

  const handleAddCustomHealthGoal = (goal: string) => {
    addCustomHealthGoal(goal);
  };

  return (
    <View className="flex-1 bg-[#FFFFFF]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{ paddingTop: insets.top }}
          className="bg-[#FFFFFF] border-b border-gray-200"
        >
          <View className="flex-row items-center justify-between px-6 py-4">
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </Pressable>
            <Text className="text-lg font-semibold text-[#001858]">{t.settings.personalHealth}</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Disease Categories Section */}
        <View className="px-6 mt-6">
          <View className="bg-[#FFFFFF] rounded-3xl p-6" style={styles.card}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="medical" size={24} color="#EF4444" />
              <Text className="text-lg font-bold text-[#001858] ml-2">{t.healthSettings.diseaseCategories}</Text>
            </View>
            <Text className="text-sm text-gray-600 mb-4">
              {t.healthSettings.diseaseDesc}
            </Text>

            {/* Prominent Toggle Button */}
            <Pressable
              onPress={() => setShowExpandedDiseases(!showExpandedDiseases)}
              className={`flex-row items-center justify-center py-3 px-5 rounded-2xl mb-4 ${
                showExpandedDiseases ? "bg-red-500" : "bg-red-100 border-2 border-red-300"
              }`}
              style={showExpandedDiseases ? styles.activeButton : {}}
            >
              <Ionicons
                name={showExpandedDiseases ? "list-outline" : "apps-outline"}
                size={22}
                color={showExpandedDiseases ? "white" : "#EF4444"}
              />
              <Text className={`font-bold text-base ml-2 ${
                showExpandedDiseases ? "text-white" : "text-red-500"
              }`}>
                {showExpandedDiseases ? t.healthSettings.switchToSimpleMode : t.healthSettings.viewFullDiseaseList}
              </Text>
              <Ionicons
                name={showExpandedDiseases ? "chevron-up" : "chevron-down"}
                size={20}
                color={showExpandedDiseases ? "white" : "#EF4444"}
                style={{ marginLeft: 8 }}
              />
            </Pressable>

            {/* Show selected diseases count */}
            {(preferences.diseases?.length || 0) > 0 && (
              <View className="bg-red-50 rounded-xl p-3 mb-4">
                <Text className="text-red-600 font-medium text-sm">
                  {t.healthSettings.selectedDiseasesCount.replace("{count}", String(preferences.diseases?.length || 0))}
                </Text>
              </View>
            )}

            {/* Expandable Disease Selector or Simple List */}
            {showExpandedDiseases ? (
              <ExpandableDiseaseSelector
                selectedDiseases={preferences.diseases || []}
                onToggleDisease={(diseaseId) => toggleDisease(diseaseId as any)}
              />
            ) : (
              <View className="flex-row flex-wrap -mx-2">
                {diseases.map((disease) => {
                  const isSelected = preferences.diseases?.includes(disease.id as any) || false;
                  return (
                    <Pressable
                      key={disease.id}
                      onPress={() => toggleDisease(disease.id as any)}
                      className={`m-2 px-4 py-3 rounded-full flex-row items-center ${
                        isSelected ? "bg-red-500" : "bg-gray-100"
                      }`}
                    >
                      <Ionicons
                        name={disease.icon as any}
                        size={18}
                        color={isSelected ? "white" : "#6B7280"}
                      />
                      <Text
                        className={`ml-2 font-semibold ${
                          isSelected ? "text-white" : "text-[#001858]"
                        }`}
                      >
                        {disease.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Custom Diseases Section */}
            <View className="mt-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-[#001858]">{t.healthSettings.customDisease}</Text>
                <Pressable
                  onPress={() => setShowCustomDiseaseModal(true)}
                  className="px-3 py-1.5 rounded-full bg-red-500 flex-row items-center"
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text className="text-white font-semibold text-xs ml-1">{t.healthSettings.addNew}</Text>
                </Pressable>
              </View>

              {(preferences.customDiseases?.length || 0) > 0 ? (
                <View className="flex-row flex-wrap -mx-1 mt-2">
                  {preferences.customDiseases?.map((disease, index) => (
                    <View
                      key={index}
                      className="m-1 px-3 py-2 rounded-full bg-red-50 flex-row items-center"
                    >
                      <Text className="text-red-700 font-medium text-sm">{disease}</Text>
                      <Pressable
                        onPress={() => removeCustomDisease(disease)}
                        className="ml-2"
                      >
                        <Ionicons name="close-circle" size={18} color="#DC2626" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-xs text-gray-500 mt-2">{t.healthSettings.noCustomItems}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Health Goals */}
        <View className="px-6 mt-6">
          <View className="bg-[#FFFFFF] rounded-3xl p-6" style={styles.card}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="fitness" size={24} color="#2CB67D" />
              <Text className="text-lg font-bold text-[#001858] ml-2">{t.healthSettings.healthGoals}</Text>
            </View>
            <Text className="text-sm text-gray-600 mb-4">{t.healthSettings.healthGoalsDesc}</Text>
            <View className="flex-row flex-wrap -mx-2">
              {healthGoals.map((goal) => {
                const isSelected = preferences.healthGoals.includes(goal.id as any);
                return (
                  <Pressable
                    key={goal.id}
                    onPress={() => toggleHealthGoal(goal.id)}
                    className={`m-2 px-4 py-3 rounded-full flex-row items-center ${
                      isSelected ? "bg-[#2CB67D]" : "bg-gray-100"
                    }`}
                  >
                    <Ionicons
                      name={goal.icon as any}
                      size={18}
                      color={isSelected ? "white" : "#6B7280"}
                    />
                    <Text
                      className={`ml-2 font-semibold ${
                        isSelected ? "text-white" : "text-[#001858]"
                      }`}
                    >
                      {goal.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom Health Goals Section */}
            <View className="mt-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-[#001858]">{t.healthSettings.customHealthGoal}</Text>
                <Pressable
                  onPress={() => setShowCustomHealthGoalModal(true)}
                  className="px-3 py-1.5 rounded-full bg-[#2CB67D] flex-row items-center"
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text className="text-white font-semibold text-xs ml-1">{t.healthSettings.addNew}</Text>
                </Pressable>
              </View>

              {(preferences.customHealthGoals?.length || 0) > 0 ? (
                <View className="flex-row flex-wrap -mx-1 mt-2">
                  {preferences.customHealthGoals?.map((goal, index) => (
                    <View
                      key={index}
                      className="m-1 px-3 py-2 rounded-full bg-green-50 flex-row items-center"
                    >
                      <Text className="text-green-700 font-medium text-sm">{goal}</Text>
                      <Pressable
                        onPress={() => removeCustomHealthGoal(goal)}
                        className="ml-2"
                      >
                        <Ionicons name="close-circle" size={18} color="#059669" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-xs text-gray-500 mt-2">{t.healthSettings.noCustomItems}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Allergen Settings */}
        <View className="px-6 mt-6">
          <View className="bg-[#FFFFFF] rounded-3xl p-6" style={styles.card}>
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="alert-circle" size={24} color="#F59E0B" />
                <Text className="text-lg font-bold text-[#001858] ml-2">{t.healthSettings.allergenSettings}</Text>
              </View>
            </View>
            <Text className="text-sm text-gray-600 mb-4">
              {t.healthSettings.allergenDesc}
            </Text>
            <View className="flex-row flex-wrap -mx-2">
              {allergens.map((allergen) => {
                const isSelected = preferences.allergens.includes(allergen.id as any);
                return (
                  <Pressable
                    key={allergen.id}
                    onPress={() => toggleAllergen(allergen.id)}
                    className={`m-2 px-4 py-2 rounded-full ${
                      isSelected
                        ? "bg-red-500"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        isSelected ? "text-white" : "text-[#001858]"
                      }`}
                    >
                      {allergen.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom Allergens */}
            <View className="mt-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-[#001858]">{t.healthSettings.customAllergen}</Text>
                <Pressable
                  onPress={() => setShowCustomAllergenModal(true)}
                  className="flex-row items-center bg-orange-500 px-3 py-2 rounded-full"
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text className="text-white font-semibold text-xs ml-1">{t.healthSettings.addNew}</Text>
                </Pressable>
              </View>

              {(preferences.customAllergens?.length || 0) > 0 ? (
                <View className="flex-row flex-wrap -mx-1 mt-2">
                  {preferences.customAllergens?.map((allergen, index) => (
                    <View
                      key={index}
                      className="m-1 px-3 py-2 rounded-full bg-orange-100 flex-row items-center"
                    >
                      <Text className="text-orange-700 font-medium text-sm">{allergen}</Text>
                      <Pressable
                        onPress={() => removeCustomAllergen(allergen)}
                        className="ml-2"
                      >
                        <Ionicons name="close-circle" size={18} color="#C2410C" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-xs text-gray-500 mt-2">{t.healthSettings.noCustomItems}</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Custom Allergen Modal */}
      <CustomAllergenModal
        visible={showCustomAllergenModal}
        onClose={() => setShowCustomAllergenModal(false)}
        onAdd={handleAddCustomAllergen}
        existingAllergens={preferences.customAllergens || []}
      />

      {/* Custom Disease Modal */}
      <CustomDiseaseModal
        visible={showCustomDiseaseModal}
        onClose={() => setShowCustomDiseaseModal(false)}
        onAdd={handleAddCustomDisease}
        existingDiseases={preferences.customDiseases || []}
      />

      {/* Custom Health Goal Modal */}
      <CustomHealthGoalModal
        visible={showCustomHealthGoalModal}
        onClose={() => setShowCustomHealthGoalModal(false)}
        onAdd={handleAddCustomHealthGoal}
        existingGoals={preferences.customHealthGoals || []}
      />
    </View>
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
  activeButton: {
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
