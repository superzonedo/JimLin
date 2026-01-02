import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeBack } from "@/utils/navigation";
import CustomAllergenModal from "@/components/CustomAllergenModal";
import CustomDiseaseModal from "@/components/CustomDiseaseModal";
import CustomHealthGoalModal from "@/components/CustomHealthGoalModal";
import ExpandableDiseaseSelector from "@/components/ExpandableDiseaseSelector";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserStore } from "@/state/userStore";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const { t, language } = useLanguage();
  
  // 從 userStore 讀取 preferences
  const preferences = useUserStore((s) => s.preferences);
  const updatePreferences = useUserStore((s) => s.updatePreferences);
  const [showCustomAllergenModal, setShowCustomAllergenModal] = useState(false);
  const [showCustomDiseaseModal, setShowCustomDiseaseModal] = useState(false);
  const [showCustomHealthGoalModal, setShowCustomHealthGoalModal] = useState(false);
  const [showExpandedDiseases, setShowExpandedDiseases] = useState(false);

  const healthGoals = [
    { id: "low-sodium", label: t('settings.lowSodiumDiet'), icon: "water-outline" },
    { id: "low-sugar", label: t('settings.lowSugarDiet'), icon: "snow-outline" },
    { id: "high-fiber", label: t('settings.highFiberDiet'), icon: "leaf-outline" },
    { id: "low-fat", label: t('settings.lowFatDiet'), icon: "flame-outline" },
    { id: "high-protein", label: t('settings.highProteinDiet'), icon: "barbell-outline" },
    { id: "weight-control", label: t('settings.weightControl'), icon: "scale-outline" },
    { id: "gut-health", label: t('settings.gutHealth'), icon: "restaurant-outline" },
  ];

  const diseases = [
    { id: "kidney-disease", label: t('settings.kidneyDisease'), icon: "medkit-outline" },
    { id: "liver-disease", label: t('settings.liverDisease'), icon: "pulse-outline" },
    { id: "skin-disease", label: t('settings.skinDisease'), icon: "hand-left-outline" },
    { id: "diabetes", label: t('settings.diabetes'), icon: "water-outline" },
    { id: "hypertension", label: t('settings.hypertension'), icon: "pulse-outline" },
    { id: "high-cholesterol", label: t('settings.highCholesterol'), icon: "heart-outline" },
    { id: "stomach-sensitivity", label: t('settings.stomachSensitivity'), icon: "restaurant-outline" },
    { id: "metabolic-disease", label: t('settings.metabolicDisease'), icon: "fitness-outline" },
  ];

  const allergens = [
    { id: "peanuts", label: t('settings.peanuts') },
    { id: "nuts", label: t('settings.nuts') },
    { id: "dairy", label: t('settings.dairy') },
    { id: "eggs", label: t('settings.eggs') },
    { id: "seafood", label: t('settings.seafood') },
    { id: "soy", label: t('settings.soy') },
    { id: "wheat", label: t('settings.wheat') },
    { id: "sesame", label: t('settings.sesame') },
    { id: "sulfites", label: t('settings.sulfites') },
    { id: "preservatives", label: t('settings.preservatives') },
    { id: "artificial-colors", label: t('settings.artificialColors') },
    { id: "artificial-flavors", label: t('settings.artificialFlavors') },
    { id: "msg", label: t('settings.msg') },
    { id: "gluten", label: t('settings.gluten') },
  ];

  const toggleHealthGoal = (goalId: string) => {
    const currentGoals = preferences.healthGoals || [];
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter((g) => g !== goalId)
      : [...currentGoals, goalId];
    updatePreferences({ healthGoals: newGoals });
  };

  const toggleAllergen = (allergenId: string) => {
    const currentAllergens = preferences.allergens || [];
    const newAllergens = currentAllergens.includes(allergenId)
      ? currentAllergens.filter((a) => a !== allergenId)
      : [...currentAllergens, allergenId];
    updatePreferences({ allergens: newAllergens });
  };

  const toggleDisease = (diseaseId: string) => {
    const currentDiseases = preferences.diseases || [];
    const newDiseases = currentDiseases.includes(diseaseId)
      ? currentDiseases.filter((d) => d !== diseaseId)
      : [...currentDiseases, diseaseId];
    updatePreferences({ diseases: newDiseases });
  };

  const handleAddCustomAllergen = (allergen: string) => {
    const newAllergens = [...(preferences.customAllergens || []), allergen];
    updatePreferences({ customAllergens: newAllergens });
  };

  const handleAddCustomDisease = (disease: string) => {
    const newDiseases = [...(preferences.customDiseases || []), disease];
    updatePreferences({ customDiseases: newDiseases });
  };

  const handleAddCustomHealthGoal = (goal: string) => {
    const newGoals = [...(preferences.customHealthGoals || []), goal];
    updatePreferences({ customHealthGoals: newGoals });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{ 
            paddingTop: insets.top,
            backgroundColor: theme.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: theme.headerBorder,
          }}
        >
          <View className="flex-row items-center justify-between px-6 py-4">
            <Pressable onPress={() => safeBack('/(tabs)/profile')}>
              <Ionicons name="arrow-back" size={24} color={theme.iconColor} />
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText }}>{t('settings.title')}</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Disease Categories Section */}
        <View className="px-6 mt-6">
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, padding: 24 }]}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="medical" size={24} color={theme.error} />
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.primaryText, marginLeft: 8 }}>{t('settings.diseaseCategorySettings')}</Text>
            </View>
            <Text style={{ fontSize: 14, color: theme.secondaryText, marginBottom: 16 }}>
              {t('settings.diseaseCategoryDesc')}
            </Text>

            {/* Prominent Toggle Button */}
            <Pressable
              onPress={() => setShowExpandedDiseases(!showExpandedDiseases)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 16,
                marginBottom: 16,
                backgroundColor: showExpandedDiseases 
                  ? theme.error 
                  : (colorScheme === 'dark' ? '#7F1D1D' : '#FEE2E2'),
                borderWidth: showExpandedDiseases ? 0 : 2,
                borderColor: showExpandedDiseases ? 'transparent' : theme.error,
                ...(showExpandedDiseases ? styles.activeButton : {}),
              }}
            >
              <Ionicons
                name={showExpandedDiseases ? "list-outline" : "apps-outline"}
                size={22}
                color={showExpandedDiseases ? "white" : theme.error}
              />
              <Text style={{
                fontWeight: '700',
                fontSize: 16,
                marginLeft: 8,
                color: showExpandedDiseases ? "white" : theme.error,
              }}>
                {showExpandedDiseases ? t('settings.switchToSimpleMode') : t('settings.viewFullDiseaseList')}
              </Text>
              <Ionicons
                name={showExpandedDiseases ? "chevron-up" : "chevron-down"}
                size={20}
                color={showExpandedDiseases ? "white" : theme.error}
                style={{ marginLeft: 8 }}
              />
            </Pressable>

            {/* Show selected diseases count */}
            {(preferences.diseases?.length || 0) > 0 && (
              <View style={{
                backgroundColor: colorScheme === 'dark' ? '#7F1D1D' : '#FEE2E2',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}>
                <Text style={{
                  color: colorScheme === 'dark' ? '#FCA5A5' : '#B91C1C',
                  fontWeight: '500',
                  fontSize: 14,
                }}>
                  {t('settings.selectedDiseases', { count: preferences.diseases?.length || 0 })}
                </Text>
              </View>
            )}

            {/* Simple Disease List */}
            {!showExpandedDiseases && (
              <View className="flex-row flex-wrap -mx-2">
                {diseases.map((disease) => {
                  const isSelected = (preferences.diseases?.includes(disease.id) || false);
                  return (
                    <Pressable
                      key={disease.id}
                      onPress={() => toggleDisease(disease.id)}
                      style={{
                        margin: 8,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 9999,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: isSelected ? theme.error : theme.gray100,
                      }}
                    >
                      <Ionicons
                        name={disease.icon as any}
                        size={18}
                        color={isSelected ? "#FFFFFF" : theme.gray500}
                      />
                      <Text
                        style={{
                          marginLeft: 8,
                          fontWeight: '600',
                          color: isSelected ? "#FFFFFF" : theme.primaryText,
                        }}
                      >
                        {disease.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Expanded Disease List */}
            {showExpandedDiseases && (
              <ExpandableDiseaseSelector
                selectedDiseases={preferences.diseases || []}
                onToggleDisease={(diseaseId) => toggleDisease(diseaseId)}
              />
            )}

            {/* Custom Diseases Section */}
            <View className="mt-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.primaryText }}>{t('settings.customDisease')}</Text>
                <Pressable
                  onPress={() => setShowCustomDiseaseModal(true)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 9999,
                    backgroundColor: theme.error,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text style={{ color: "#FFFFFF", fontWeight: '600', fontSize: 12, marginLeft: 4 }}>{t('settings.add')}</Text>
                </Pressable>
              </View>

              {(preferences.customDiseases?.length || 0) > 0 ? (
                <View className="flex-row flex-wrap -mx-1 mt-2">
                  {preferences.customDiseases?.map((disease, index) => (
                    <View
                      key={index}
                      style={{
                        margin: 4,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 9999,
                        backgroundColor: colorScheme === 'dark' ? '#7F1D1D' : '#FEE2E2',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ 
                        color: colorScheme === 'dark' ? '#FCA5A5' : '#B91C1C',
                        fontWeight: '500',
                        fontSize: 14,
                      }}>{disease}</Text>
                      <Pressable
                        onPress={() => {
                          const newDiseases = (preferences.customDiseases || []).filter((d) => d !== disease);
                          setPreferences({ ...preferences, customDiseases: newDiseases });
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        <Ionicons name="close-circle" size={18} color={theme.error} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: 12, color: theme.gray500, marginTop: 8 }}>{t('settings.noCustomDisease')}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Health Goals */}
        <View className="px-6 mt-6">
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, padding: 24 }]}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="fitness" size={24} color={theme.primary} />
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.primaryText, marginLeft: 8 }}>{t('settings.healthGoals')}</Text>
            </View>
            <Text style={{ fontSize: 14, color: theme.secondaryText, marginBottom: 16 }}>
              {t('settings.healthGoalsDesc')}
            </Text>
            <View className="flex-row flex-wrap -mx-2">
              {healthGoals.map((goal) => {
                const isSelected = (preferences.healthGoals || []).includes(goal.id);
                return (
                  <Pressable
                    key={goal.id}
                    onPress={() => toggleHealthGoal(goal.id)}
                    style={{
                      margin: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 9999,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isSelected ? theme.primary : theme.gray100,
                    }}
                  >
                    <Ionicons
                      name={goal.icon as any}
                      size={18}
                      color={isSelected ? "#FFFFFF" : theme.gray500}
                    />
                    <Text
                      style={{
                        marginLeft: 8,
                        fontWeight: '600',
                        color: isSelected ? "#FFFFFF" : theme.primaryText,
                      }}
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
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.primaryText }}>{t('settings.customHealthGoal')}</Text>
                <Pressable
                  onPress={() => setShowCustomHealthGoalModal(true)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 9999,
                    backgroundColor: theme.primary,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text style={{ color: "#FFFFFF", fontWeight: '600', fontSize: 12, marginLeft: 4 }}>{t('settings.add')}</Text>
                </Pressable>
              </View>

              {preferences.customHealthGoals.length > 0 ? (
                <View className="flex-row flex-wrap -mx-1 mt-2">
                  {preferences.customHealthGoals.map((goal, index) => (
                    <View
                      key={index}
                      style={{
                        margin: 4,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 9999,
                        backgroundColor: colorScheme === 'dark' ? '#064E3B' : '#D1FAE5',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ 
                        color: colorScheme === 'dark' ? '#6EE7B7' : '#047857',
                        fontWeight: '500',
                        fontSize: 14,
                      }}>{goal}</Text>
                      <Pressable
                        onPress={() => {
                          const newGoals = (preferences.customHealthGoals || []).filter((g) => g !== goal);
                          updatePreferences({ customHealthGoals: newGoals });
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        <Ionicons name="close-circle" size={18} color={theme.success} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: 12, color: theme.gray500, marginTop: 8 }}>{t('settings.noCustomHealthGoal')}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Allergen Settings */}
        <View className="px-6 mt-6">
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, padding: 24 }]}>
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="alert-circle" size={24} color={theme.warning} />
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.primaryText, marginLeft: 8 }}>{t('settings.allergenSettings')}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: theme.secondaryText, marginBottom: 16 }}>
              {t('settings.allergenDesc')}
            </Text>
            <View className="flex-row flex-wrap -mx-2">
              {allergens.map((allergen) => {
                const isSelected = (preferences.allergens || []).includes(allergen.id);
                return (
                  <Pressable
                    key={allergen.id}
                    onPress={() => toggleAllergen(allergen.id)}
                    style={{
                      margin: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 9999,
                      backgroundColor: isSelected
                        ? theme.error
                        : theme.gray100,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: '500',
                        color: isSelected ? "#FFFFFF" : theme.primaryText,
                      }}
                    >
                      {allergen.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom Allergens - Premium Only */}
            <View className="mt-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.primaryText }}>{t('settings.customAllergen')}</Text>
                <Pressable
                  onPress={() => setShowCustomAllergenModal(true)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: "#F97316",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 9999,
                  }}
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text style={{ color: "#FFFFFF", fontWeight: '600', fontSize: 12, marginLeft: 4 }}>{t('settings.add')}</Text>
                </Pressable>
              </View>

              {(preferences.customAllergens?.length || 0) > 0 ? (
                <View className="flex-row flex-wrap -mx-1 mt-2">
                  {preferences.customAllergens?.map((allergen, index) => (
                    <View
                      key={index}
                      style={{
                        margin: 4,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 9999,
                        backgroundColor: colorScheme === 'dark' ? '#7C2D12' : '#FFEDD5',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ 
                        color: colorScheme === 'dark' ? '#FED7AA' : '#C2410C',
                        fontWeight: '500',
                        fontSize: 14,
                      }}>{allergen}</Text>
                      <Pressable
                        onPress={() => {
                          const newAllergens = (preferences.customAllergens || []).filter((a) => a !== allergen);
                          setPreferences({ ...preferences, customAllergens: newAllergens });
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        <Ionicons name="close-circle" size={18} color="#C2410C" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: 12, color: theme.gray500, marginTop: 8 }}>{t('settings.noCustomAllergen')}</Text>
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

