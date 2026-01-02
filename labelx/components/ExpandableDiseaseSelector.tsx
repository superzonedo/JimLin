import React, { useState, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";

type DiseaseCategory = {
  id: string;
  name: string;
  icon: string;
  diseases: Disease[];
};

type Disease = {
  id: string;
  label: string;
};

// Disease categories structure (without labels, labels will be translated)
const diseaseCategoriesStructure: Array<{
  id: string;
  categoryKey: string;
  icon: string;
  diseaseIds: string[];
}> = [
  {
    id: "cardiovascular",
    categoryKey: "cardiovascular",
    icon: "heart-outline",
    diseaseIds: ["hypertension", "high-cholesterol", "coronary-heart-disease", "heart-failure", "arrhythmia", "atherosclerosis", "stroke"],
  },
  {
    id: "metabolic",
    categoryKey: "metabolic",
    icon: "fitness-outline",
    diseaseIds: ["diabetes", "prediabetes", "metabolic-syndrome", "obesity", "hyperthyroidism", "hypothyroidism", "gout", "hyperuricemia"],
  },
  {
    id: "digestive",
    categoryKey: "digestive",
    icon: "restaurant-outline",
    diseaseIds: ["gastritis", "gastric-ulcer", "gerd", "ibs", "ibd", "fatty-liver", "liver-disease", "gallstones", "pancreatitis", "constipation"],
  },
  {
    id: "kidney",
    categoryKey: "kidney",
    icon: "water-outline",
    diseaseIds: ["kidney-disease", "kidney-stones", "nephritis", "kidney-failure", "dialysis"],
  },
  {
    id: "respiratory",
    categoryKey: "respiratory",
    icon: "cloud-outline",
    diseaseIds: ["asthma", "copd", "bronchitis", "sleep-apnea"],
  },
  {
    id: "neurological",
    categoryKey: "neurological",
    icon: "pulse-outline",
    diseaseIds: ["migraine", "epilepsy", "parkinsons", "alzheimers", "neuropathy", "multiple-sclerosis"],
  },
  {
    id: "musculoskeletal",
    categoryKey: "musculoskeletal",
    icon: "body-outline",
    diseaseIds: ["osteoporosis", "arthritis", "rheumatoid-arthritis", "osteoarthritis", "fibromyalgia"],
  },
  {
    id: "skin",
    categoryKey: "skin",
    icon: "hand-left-outline",
    diseaseIds: ["eczema", "psoriasis", "acne", "rosacea", "dermatitis", "urticaria"],
  },
  {
    id: "immune",
    categoryKey: "immune",
    icon: "shield-outline",
    diseaseIds: ["lupus", "sjogrens", "hashimotos", "celiac", "immunodeficiency"],
  },
  {
    id: "mental",
    categoryKey: "mental",
    icon: "happy-outline",
    diseaseIds: ["anxiety", "depression", "insomnia", "eating-disorder", "bipolar"],
  },
  {
    id: "cancer",
    categoryKey: "cancer",
    icon: "ribbon-outline",
    diseaseIds: ["cancer-treatment", "cancer-survivor", "chemotherapy"],
  },
  {
    id: "other",
    categoryKey: "other",
    icon: "medkit-outline",
    diseaseIds: ["anemia", "hemochromatosis", "pcos", "endometriosis", "prostate"],
  },
];

type Props = {
  selectedDiseases: string[];
  onToggleDisease: (diseaseId: string) => void;
};

export default function ExpandableDiseaseSelector({
  selectedDiseases,
  onToggleDisease,
}: Props) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const { t } = useLanguage();

  // Generate disease categories with translated labels
  const diseaseCategories: DiseaseCategory[] = useMemo(() => {
    return diseaseCategoriesStructure.map((category) => ({
      id: category.id,
      name: t(`diseases.categories.${category.categoryKey}`),
      icon: category.icon,
      diseases: category.diseaseIds.map((diseaseId) => ({
        id: diseaseId,
        label: t(`diseases.labels.${diseaseId}`),
      })),
    }));
  }, [t]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getSelectedCountInCategory = (category: DiseaseCategory) => {
    return category.diseases.filter((d) => selectedDiseases.includes(d.id)).length;
  };

  return (
    <View>
      {diseaseCategories.map((category) => {
        const isExpanded = expandedCategories.includes(category.id);
        const selectedCount = getSelectedCountInCategory(category);

        return (
          <View key={category.id} style={{ marginBottom: 12 }}>
            {/* Category Header */}
            <Pressable
              onPress={() => toggleCategory(category.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderRadius: 16,
                backgroundColor: isExpanded 
                  ? (colorScheme === 'dark' ? '#7F1D1D' : '#FEE2E2')
                  : theme.gray50,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 9999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selectedCount > 0 ? theme.error : theme.gray200,
                  }}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={selectedCount > 0 ? "white" : theme.gray500}
                  />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: theme.primaryText,
                  }}>
                    {category.name}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: theme.secondaryText,
                  }}>
                    {t('diseases.diseaseCount', { count: category.diseases.length })}
                    {selectedCount > 0 && (
                      <Text style={{ color: theme.error }}> · {t('diseases.selected', { count: selectedCount })}</Text>
                    )}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.gray500}
              />
            </Pressable>

            {/* Expanded Disease List */}
            {isExpanded && (
              <View style={{
                marginTop: 8,
                marginLeft: 8,
                paddingLeft: 16,
                borderLeftWidth: 2,
                borderLeftColor: colorScheme === 'dark' ? '#991B1B' : '#FCA5A5',
              }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {category.diseases.map((disease) => {
                    const isSelected = selectedDiseases.includes(disease.id);
                    return (
                      <Pressable
                        key={disease.id}
                        onPress={() => onToggleDisease(disease.id)}
                        style={{
                          margin: 4,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 9999,
                          backgroundColor: isSelected 
                            ? theme.error 
                            : theme.cardBackground,
                          borderWidth: isSelected ? 0 : 1,
                          borderColor: theme.cardBorder,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: isSelected ? "#FFFFFF" : theme.primaryText,
                          }}
                        >
                          {disease.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// Export the disease categories structure for use in other components
export { diseaseCategoriesStructure };
export type { DiseaseCategory, Disease };

// Helper function to get disease categories with translations
export function getDiseaseCategories(t: (key: string, params?: Record<string, string | number>) => string): DiseaseCategory[] {
  return diseaseCategoriesStructure.map((category) => ({
    id: category.id,
    name: t(`diseases.categories.${category.categoryKey}`),
    icon: category.icon,
    diseases: category.diseaseIds.map((diseaseId) => ({
      id: diseaseId,
      label: t(`diseases.labels.${diseaseId}`),
    })),
  }));
}



