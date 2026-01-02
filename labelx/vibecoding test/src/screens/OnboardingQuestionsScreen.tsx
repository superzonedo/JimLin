import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { HealthGoal, DiseaseType } from "../types/user";
import QuestionCard from "../components/QuestionCard";
import OptionChip from "../components/OptionChip";
import { useLanguage } from "../i18n";

type OnboardingStackParamList = {
  Welcome: undefined;
  Questions: undefined;
  Complete: {
    showAuthPrompt: boolean;
    answers: Answers;
  };
};

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

interface Answers {
  careAboutFoodSafety: boolean | null;
  dietAwareness: string | null;
  careAboutAdditives: boolean | null;
  understandLabels: boolean | null;
  worryAboutCancer: boolean | null;
  healthGoals: HealthGoal[];
  diseases: (DiseaseType | "none")[];
  familyMembers: string[];
  gender: string | null;
  ageGroup: string | null;
}

export default function OnboardingQuestionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    careAboutFoodSafety: null,
    dietAwareness: null,
    careAboutAdditives: null,
    understandLabels: null,
    worryAboutCancer: null,
    healthGoals: [],
    diseases: [],
    familyMembers: [],
    gender: null,
    ageGroup: null,
  });

  const progress = useSharedValue(1 / 9);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return answers.careAboutFoodSafety !== null;
      case 2:
        return answers.dietAwareness !== null;
      case 3:
        return answers.careAboutAdditives !== null;
      case 4:
        return answers.understandLabels !== null;
      case 5:
        return answers.worryAboutCancer !== null;
      case 6:
        return answers.healthGoals.length > 0;
      case 7:
        return answers.diseases.length > 0;
      case 8:
        return answers.familyMembers.length > 0;
      case 9:
        return answers.gender !== null && answers.ageGroup !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1);
      progress.value = withTiming((currentStep + 1) / 9, { duration: 300 });
    } else {
      navigation.navigate("Complete", {
        showAuthPrompt: true,
        answers: answers,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      progress.value = withTiming((currentStep - 1) / 9, { duration: 300 });
    }
  };

  // Step 1: Food Safety Awareness
  const renderStep1 = () => (
    <QuestionCard
      question={t.onboarding.q1Title}
      icon="shield-checkmark-outline"
      iconColor="#2CB67D"
      subtitle=""
    >
      <View style={styles.yesNoContainer}>
        <OptionChip
          label={t.onboarding.q1Option1}
          isSelected={answers.careAboutFoodSafety === true}
          onPress={() =>
            setAnswers({ ...answers, careAboutFoodSafety: true })
          }
          icon="checkmark-circle-outline"
          variant="large"
        />
        <OptionChip
          label={t.onboarding.q1Option2}
          isSelected={answers.careAboutFoodSafety === false}
          onPress={() =>
            setAnswers({ ...answers, careAboutFoodSafety: false })
          }
          icon="close-circle-outline"
          variant="large"
        />
      </View>
    </QuestionCard>
  );

  // Step 2: Diet Awareness
  const renderStep2 = () => {
    return (
      <QuestionCard
        question={t.onboarding.q2Title}
        icon="document-text-outline"
        subtitle=""
      >
        {t.onboarding.q2Options.map((option, index) => (
          <OptionChip
            key={index}
            label={option}
            isSelected={answers.dietAwareness === option}
            onPress={() => setAnswers({ ...answers, dietAwareness: option })}
          />
        ))}
      </QuestionCard>
    );
  };

  // Step 3: Care about additives
  const renderStep3 = () => (
    <QuestionCard
      question={t.onboarding.q3Title}
      icon="color-palette-outline"
      iconColor="#9333EA"
      subtitle=""
    >
      <View style={styles.yesNoContainer}>
        <OptionChip
          label={t.onboarding.q3Option1}
          isSelected={answers.careAboutAdditives === false}
          onPress={() =>
            setAnswers({ ...answers, careAboutAdditives: false })
          }
          icon="close-circle-outline"
          variant="large"
        />
        <OptionChip
          label={t.onboarding.q3Option2}
          isSelected={answers.careAboutAdditives === true}
          onPress={() =>
            setAnswers({ ...answers, careAboutAdditives: true })
          }
          icon="checkmark-circle-outline"
          variant="large"
        />
      </View>
    </QuestionCard>
  );

  // Step 4: Understand labels
  const renderStep4 = () => (
    <QuestionCard
      question={t.onboarding.q4Title}
      icon="cash-outline"
      iconColor="#10B981"
      subtitle=""
    >
      <View style={styles.yesNoContainer}>
        <OptionChip
          label={t.onboarding.q4Option1}
          isSelected={answers.understandLabels === false}
          onPress={() =>
            setAnswers({ ...answers, understandLabels: false })
          }
          icon="close-circle-outline"
          variant="large"
        />
        <OptionChip
          label={t.onboarding.q4Option2}
          isSelected={answers.understandLabels === true}
          onPress={() =>
            setAnswers({ ...answers, understandLabels: true })
          }
          icon="checkmark-circle-outline"
          variant="large"
        />
      </View>
    </QuestionCard>
  );

  // Step 5: Worry about cancer
  const renderStep5 = () => (
    <QuestionCard
      question={t.onboarding.q5Title}
      icon="warning-outline"
      iconColor="#EF4444"
      subtitle=""
    >
      <View style={styles.yesNoContainer}>
        <OptionChip
          label={t.onboarding.q5Option1}
          isSelected={answers.worryAboutCancer === false}
          onPress={() =>
            setAnswers({ ...answers, worryAboutCancer: false })
          }
          icon="close-circle-outline"
          variant="large"
        />
        <OptionChip
          label={t.onboarding.q5Option2}
          isSelected={answers.worryAboutCancer === true}
          onPress={() =>
            setAnswers({ ...answers, worryAboutCancer: true })
          }
          icon="checkmark-circle-outline"
          variant="large"
        />
      </View>
    </QuestionCard>
  );

  // Step 6: Health Goals
  const renderStep6 = () => {
    const goalIds: HealthGoal[] = [
      "weight-control",
      "low-fat",
      "low-sugar",
      "low-sodium",
      "high-fiber",
      "high-protein",
      "gut-health",
    ];

    const handleGoalToggle = (goal: HealthGoal) => {
      if (answers.healthGoals.includes(goal)) {
        setAnswers({
          ...answers,
          healthGoals: answers.healthGoals.filter((g) => g !== goal),
        });
      } else {
        setAnswers({ ...answers, healthGoals: [...answers.healthGoals, goal] });
      }
    };

    return (
      <QuestionCard
        question={t.onboarding.q6Title}
        icon="fitness-outline"
        subtitle={t.onboarding.q6Subtitle}
      >
        {goalIds.map((id, index) => (
          <OptionChip
            key={id}
            label={t.onboarding.q6Options[index]}
            isSelected={answers.healthGoals.includes(id)}
            onPress={() => handleGoalToggle(id)}
            multiSelect
          />
        ))}
      </QuestionCard>
    );
  };

  // Step 7: Health Conditions
  const renderStep7 = () => {
    const diseaseIds: (DiseaseType | "none")[] = [
      "none",
      "diabetes",
      "hypertension",
      "high-cholesterol",
      "kidney-disease",
      "liver-disease",
      "stomach-sensitivity",
      "metabolic-disease",
    ];

    const handleDiseaseToggle = (id: DiseaseType | "none") => {
      if (id === "none") {
        setAnswers({ ...answers, diseases: ["none"] });
      } else {
        const filtered = answers.diseases.filter((d) => d !== "none");
        if (filtered.includes(id)) {
          setAnswers({
            ...answers,
            diseases: filtered.filter((d) => d !== id),
          });
        } else {
          setAnswers({ ...answers, diseases: [...filtered, id] });
        }
      }
    };

    const hasNone = answers.diseases.includes("none");

    return (
      <QuestionCard
        question={t.onboarding.q7Title}
        icon="medical-outline"
        iconColor="#EF4444"
        subtitle={t.onboarding.q7Subtitle}
      >
        {diseaseIds.map((id, index) => (
          <OptionChip
            key={id}
            label={t.onboarding.q7Options[index]}
            isSelected={
              id === "none"
                ? hasNone
                : answers.diseases.includes(id)
            }
            onPress={() => handleDiseaseToggle(id)}
            multiSelect
            disabled={id !== "none" && hasNone}
          />
        ))}
      </QuestionCard>
    );
  };

  // Step 8: Family Members
  const renderStep8 = () => {
    const handleFamilyToggle = (index: number) => {
      const member = t.onboarding.q8Options[index];
      const selfOption = t.onboarding.q8Options[0];

      if (index === 0) {
        if (answers.familyMembers.includes(selfOption)) {
          setAnswers({ ...answers, familyMembers: [] });
        } else {
          setAnswers({ ...answers, familyMembers: [selfOption] });
        }
      } else {
        const filtered = answers.familyMembers.filter((m) => m !== selfOption);
        if (filtered.includes(member)) {
          setAnswers({
            ...answers,
            familyMembers: filtered.filter((m) => m !== member),
          });
        } else {
          setAnswers({ ...answers, familyMembers: [...filtered, member] });
        }
      }
    };

    return (
      <QuestionCard
        question={t.onboarding.q8Title}
        icon="people-outline"
        subtitle={t.onboarding.q8Subtitle}
      >
        {t.onboarding.q8Options.map((option, index) => (
          <OptionChip
            key={index}
            label={option}
            isSelected={answers.familyMembers.includes(option)}
            onPress={() => handleFamilyToggle(index)}
            multiSelect
          />
        ))}
      </QuestionCard>
    );
  };

  // Step 9: Basic Info (Gender + Age)
  const renderStep9 = () => {
    return (
      <>
        <QuestionCard
          question={t.onboarding.q9GenderTitle}
          icon="person-outline"
          subtitle=""
        >
          {t.onboarding.q9GenderOptions.map((option, index) => (
            <OptionChip
              key={index}
              label={option}
              isSelected={answers.gender === option}
              onPress={() => setAnswers({ ...answers, gender: option })}
            />
          ))}
        </QuestionCard>

        <View style={{ height: 16 }} />

        <QuestionCard
          question={t.onboarding.q9AgeTitle}
          icon="calendar-outline"
          subtitle=""
        >
          {t.onboarding.q9AgeOptions.map((option, index) => (
            <OptionChip
              key={index}
              label={option}
              isSelected={answers.ageGroup === option}
              onPress={() => setAnswers({ ...answers, ageGroup: option })}
            />
          ))}
        </QuestionCard>
      </>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      case 8:
        return renderStep8();
      case 9:
        return renderStep9();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text style={styles.progressText}>
          {t.onboarding.step} {currentStep} / 9
        </Text>
      </View>

      {/* Question Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>{t.onboarding.previous}</Text>
          </Pressable>
        )}
        <Pressable
          style={[
            styles.nextButton,
            currentStep === 1 && styles.nextButtonFull,
            !isStepValid() && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!isStepValid()}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 9 ? t.onboarding.finish : t.onboarding.next}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2CB67D",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  yesNoContainer: {
    flexDirection: "column",
    gap: 16,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#001858",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#2CB67D",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
