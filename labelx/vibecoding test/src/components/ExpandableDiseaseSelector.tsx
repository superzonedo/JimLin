import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../i18n";

type DiseaseCategory = {
  id: string;
  nameKey: keyof typeof import("../i18n/translations").translations["zh-TW"]["diseaseCategories"];
  icon: string;
  diseases: Disease[];
};

type Disease = {
  id: string;
  labelKey: keyof typeof import("../i18n/translations").translations["zh-TW"]["expandedDiseases"];
};

// Disease categories with translation keys
const diseaseCategories: DiseaseCategory[] = [
  {
    id: "cardiovascular",
    nameKey: "cardiovascular",
    icon: "heart-outline",
    diseases: [
      { id: "hypertension", labelKey: "hypertension" },
      { id: "high-cholesterol", labelKey: "highCholesterol" },
      { id: "coronary-heart-disease", labelKey: "coronaryHeartDisease" },
      { id: "heart-failure", labelKey: "heartFailure" },
      { id: "arrhythmia", labelKey: "arrhythmia" },
      { id: "atherosclerosis", labelKey: "atherosclerosis" },
      { id: "stroke", labelKey: "stroke" },
    ],
  },
  {
    id: "metabolic",
    nameKey: "metabolic",
    icon: "fitness-outline",
    diseases: [
      { id: "diabetes", labelKey: "diabetes" },
      { id: "prediabetes", labelKey: "prediabetes" },
      { id: "metabolic-syndrome", labelKey: "metabolicSyndrome" },
      { id: "obesity", labelKey: "obesity" },
      { id: "hyperthyroidism", labelKey: "hyperthyroidism" },
      { id: "hypothyroidism", labelKey: "hypothyroidism" },
      { id: "gout", labelKey: "gout" },
      { id: "hyperuricemia", labelKey: "hyperuricemia" },
    ],
  },
  {
    id: "digestive",
    nameKey: "digestive",
    icon: "restaurant-outline",
    diseases: [
      { id: "gastritis", labelKey: "gastritis" },
      { id: "gastric-ulcer", labelKey: "gastricUlcer" },
      { id: "gerd", labelKey: "gerd" },
      { id: "ibs", labelKey: "ibs" },
      { id: "ibd", labelKey: "ibd" },
      { id: "fatty-liver", labelKey: "fattyLiver" },
      { id: "liver-disease", labelKey: "liverDisease" },
      { id: "gallstones", labelKey: "gallstones" },
      { id: "pancreatitis", labelKey: "pancreatitis" },
      { id: "constipation", labelKey: "constipation" },
    ],
  },
  {
    id: "kidney",
    nameKey: "kidney",
    icon: "water-outline",
    diseases: [
      { id: "kidney-disease", labelKey: "kidneyDisease" },
      { id: "kidney-stones", labelKey: "kidneyStones" },
      { id: "nephritis", labelKey: "nephritis" },
      { id: "kidney-failure", labelKey: "kidneyFailure" },
      { id: "dialysis", labelKey: "dialysis" },
    ],
  },
  {
    id: "respiratory",
    nameKey: "respiratory",
    icon: "cloud-outline",
    diseases: [
      { id: "asthma", labelKey: "asthma" },
      { id: "copd", labelKey: "copd" },
      { id: "bronchitis", labelKey: "bronchitis" },
      { id: "sleep-apnea", labelKey: "sleepApnea" },
    ],
  },
  {
    id: "neurological",
    nameKey: "neurological",
    icon: "pulse-outline",
    diseases: [
      { id: "migraine", labelKey: "migraine" },
      { id: "epilepsy", labelKey: "epilepsy" },
      { id: "parkinsons", labelKey: "parkinsons" },
      { id: "alzheimers", labelKey: "alzheimers" },
      { id: "neuropathy", labelKey: "neuropathy" },
      { id: "multiple-sclerosis", labelKey: "multipleSclerosis" },
    ],
  },
  {
    id: "musculoskeletal",
    nameKey: "musculoskeletal",
    icon: "body-outline",
    diseases: [
      { id: "osteoporosis", labelKey: "osteoporosis" },
      { id: "arthritis", labelKey: "arthritis" },
      { id: "rheumatoid-arthritis", labelKey: "rheumatoidArthritis" },
      { id: "osteoarthritis", labelKey: "osteoarthritis" },
      { id: "fibromyalgia", labelKey: "fibromyalgia" },
    ],
  },
  {
    id: "skin",
    nameKey: "skin",
    icon: "hand-left-outline",
    diseases: [
      { id: "eczema", labelKey: "eczema" },
      { id: "psoriasis", labelKey: "psoriasis" },
      { id: "acne", labelKey: "acne" },
      { id: "rosacea", labelKey: "rosacea" },
      { id: "dermatitis", labelKey: "dermatitis" },
      { id: "urticaria", labelKey: "urticaria" },
    ],
  },
  {
    id: "immune",
    nameKey: "immune",
    icon: "shield-outline",
    diseases: [
      { id: "lupus", labelKey: "lupus" },
      { id: "sjogrens", labelKey: "sjogrens" },
      { id: "hashimotos", labelKey: "hashimotos" },
      { id: "celiac", labelKey: "celiac" },
      { id: "immunodeficiency", labelKey: "immunodeficiency" },
    ],
  },
  {
    id: "mental",
    nameKey: "mental",
    icon: "happy-outline",
    diseases: [
      { id: "anxiety", labelKey: "anxiety" },
      { id: "depression", labelKey: "depression" },
      { id: "insomnia", labelKey: "insomnia" },
      { id: "eating-disorder", labelKey: "eatingDisorder" },
      { id: "bipolar", labelKey: "bipolar" },
    ],
  },
  {
    id: "cancer",
    nameKey: "cancer",
    icon: "ribbon-outline",
    diseases: [
      { id: "cancer-treatment", labelKey: "cancerTreatment" },
      { id: "cancer-survivor", labelKey: "cancerSurvivor" },
      { id: "chemotherapy", labelKey: "chemotherapy" },
    ],
  },
  {
    id: "other",
    nameKey: "other",
    icon: "medkit-outline",
    diseases: [
      { id: "anemia", labelKey: "anemia" },
      { id: "hemochromatosis", labelKey: "hemochromatosis" },
      { id: "pcos", labelKey: "pcos" },
      { id: "endometriosis", labelKey: "endometriosis" },
      { id: "prostate", labelKey: "prostate" },
    ],
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
  const { t } = useLanguage();

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
          <View key={category.id} className="mb-3">
            {/* Category Header */}
            <Pressable
              onPress={() => toggleCategory(category.id)}
              className={`flex-row items-center justify-between p-4 rounded-2xl ${
                isExpanded ? "bg-red-50" : "bg-gray-50"
              }`}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    selectedCount > 0 ? "bg-red-500" : "bg-gray-200"
                  }`}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={selectedCount > 0 ? "white" : "#6B7280"}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-gray-800">
                    {t.diseaseCategories[category.nameKey]}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {t.healthSettings.diseasesCount.replace("{count}", String(category.diseases.length))}
                    {selectedCount > 0 && (
                      <Text className="text-red-500"> · {t.healthSettings.selected.replace("{count}", String(selectedCount))}</Text>
                    )}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#6B7280"
              />
            </Pressable>

            {/* Expanded Disease List */}
            {isExpanded && (
              <View className="mt-2 ml-2 pl-4 border-l-2 border-red-200">
                <View className="flex-row flex-wrap">
                  {category.diseases.map((disease) => {
                    const isSelected = selectedDiseases.includes(disease.id);
                    return (
                      <Pressable
                        key={disease.id}
                        onPress={() => onToggleDisease(disease.id)}
                        className={`m-1 px-3 py-2 rounded-full ${
                          isSelected ? "bg-red-500" : "bg-white border border-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isSelected ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {t.expandedDiseases[disease.labelKey]}
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

// Export the disease categories for use in other components
export { diseaseCategories };
export type { DiseaseCategory, Disease };
