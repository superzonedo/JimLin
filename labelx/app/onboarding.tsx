import OptionChip from "@/components/OptionChip";
import QuestionCard from "@/components/QuestionCard";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useSafeBack } from "@/utils/navigation";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HealthGoal = "weight-control" | "low-fat" | "low-sugar" | "low-sodium" | "high-fiber" | "high-protein" | "gut-health";
type DiseaseType = "diabetes" | "hypertension" | "high-cholesterol" | "kidney-disease" | "liver-disease" | "stomach-sensitivity" | "metabolic-disease";

interface Answers {
  careAboutFoodSafety: boolean | null;
  dietAwareness: string | null;
  careAboutAdditives: boolean | null;        // 步驟 3：在意人工色素或防腐劑
  understandLabels: boolean | null;          // 步驟 4：便宜才是重點
  worryAboutCancer: boolean | null;          // 步驟 5：擔心添加劑癌症風險
  healthGoals: HealthGoal[];                 // 步驟 6：健康目標
  diseases: (DiseaseType | "none")[];        // 步驟 7：健康狀況
  familyMembers: string[];                   // 步驟 8：家庭成員
  gender: string | null;                     // 步驟 9：性別
  ageGroup: string | null;                   // 步驟 9：年齡
}

export default function OnboardingQuestionsScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
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

  const progress = useSharedValue(1 / 9); // 更新為 9 步驟

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  // Check if current step is valid
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
      // Complete onboarding - save and go back
      console.log("Onboarding completed:", answers);
      safeBack('/(tabs)/home');
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
      question="我不太在意食品安全？"
      icon="shield-checkmark-outline"
      iconColor="#2CB67D"
      subtitle="請選擇最符合您的想法"
    >
      <View style={styles.yesNoContainer}>
        <OptionChip
          label="是的，我不太在意"
          isSelected={answers.careAboutFoodSafety === true}
          onPress={() =>
            setAnswers({ ...answers, careAboutFoodSafety: true })
          }
          icon="checkmark-circle-outline"
          variant="large"
        />
        <OptionChip
          label="否，我非常在意食品安全"
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
    const options = [
      "總是仔細閱讀所有成分",
      "偶爾會看營養標示",
      "只注意過敏原資訊",
      "只看熱量和保存期限",
      "很少注意標籤內容",
      "完全不看食品標籤",
    ];

    return (
      <QuestionCard
        question="您平常對食品標籤的關注程度？"
        icon="document-text-outline"
        subtitle="幫助我們了解您的飲食意識"
      >
        {options.map((option) => (
          <OptionChip
            key={option}
            label={option}
            isSelected={answers.dietAwareness === option}
            onPress={() => setAnswers({ ...answers, dietAwareness: option })}
          />
        ))}
      </QuestionCard>
    );
  };

  // Step 3: Care about additives (人工色素或防腐劑)
  const renderStep3 = () => (
    <QuestionCard
      question="我不太在意人工色素或防腐劑"
      icon="color-palette-outline"
      iconColor="#9333EA"
      subtitle="請選擇最符合您的想法"
    >
      <View style={styles.yesNoContainer}>
        <OptionChip
          label="否，我很在意"
          isSelected={answers.careAboutAdditives === false}
          onPress={() =>
            setAnswers({ ...answers, careAboutAdditives: false })
          }
          icon="close-circle-outline"
          variant="large"
        />
        <OptionChip
          label="是，我不太在意"
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

  // Step 4: Understand labels (便宜才是重點)
  const renderStep4 = () => (
    <QuestionCard
      question="便宜才是重點，食安的事不要想太多"
      icon="cash-outline"
      iconColor="#10B981"
      subtitle="請選擇最符合您的想法"
    >
      <View style={styles.yesNoContainer}>
        <OptionChip
          label="否，食安更重要"
          isSelected={answers.understandLabels === false}
          onPress={() =>
            setAnswers({ ...answers, understandLabels: false })
          }
          icon="close-circle-outline"
          variant="large"
        />
        <OptionChip
          label="是，便宜才是重點"
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

  // Step 5: Worry about cancer (擔心添加劑造成癌症風險)
  const renderStep5 = () => (
    <QuestionCard
      question="我不擔心添加劑造成癌症風險"
      icon="warning-outline"
      iconColor="#EF4444"
      subtitle="請選擇最符合您的想法"
    >
      <View style={styles.yesNoContainer}>
        <OptionChip
          label="否，我很擔心"
          isSelected={answers.worryAboutCancer === false}
          onPress={() =>
            setAnswers({ ...answers, worryAboutCancer: false })
          }
          icon="close-circle-outline"
          variant="large"
        />
        <OptionChip
          label="是，我不擔心"
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

  // Step 6: Health Goals (原步驟 4)
  const renderStep6 = () => {
    const goalOptions = [
      { id: "weight-control" as HealthGoal, label: "維持健康體重" },
      { id: "low-fat" as HealthGoal, label: "改善心血管健康" },
      { id: "low-sugar" as HealthGoal, label: "控制血糖" },
      { id: "low-sodium" as HealthGoal, label: "降低鈉攝取" },
      { id: "high-fiber" as HealthGoal, label: "增加纖維攝取" },
      { id: "high-protein" as HealthGoal, label: "增加蛋白質" },
      { id: "gut-health" as HealthGoal, label: "改善腸胃健康" },
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
        question="您的健康目標是什麼？"
        icon="fitness-outline"
        subtitle="可選擇多個目標"
      >
        {goalOptions.map((option) => (
          <OptionChip
            key={option.id}
            label={option.label}
            isSelected={answers.healthGoals.includes(option.id)}
            onPress={() => handleGoalToggle(option.id)}
            multiSelect
          />
        ))}
      </QuestionCard>
    );
  };

  // Step 7: Health Conditions (原步驟 5)
  const renderStep7 = () => {
    const diseaseOptions = [
      { id: "none", label: "沒有特殊健康狀況" },
      { id: "diabetes" as DiseaseType, label: "糖尿病" },
      { id: "hypertension" as DiseaseType, label: "高血壓" },
      { id: "high-cholesterol" as DiseaseType, label: "高膽固醇" },
      { id: "kidney-disease" as DiseaseType, label: "腎臟疾病" },
      { id: "liver-disease" as DiseaseType, label: "肝臟疾病" },
      { id: "stomach-sensitivity" as DiseaseType, label: "腸胃敏感" },
      { id: "metabolic-disease" as DiseaseType, label: "代謝疾病" },
    ];

    const handleDiseaseToggle = (id: string | DiseaseType) => {
      if (id === "none") {
        setAnswers({ ...answers, diseases: ["none"] });
      } else {
        const disease = id as DiseaseType;
        const filtered = answers.diseases.filter((d) => d !== "none");
        if (filtered.includes(disease)) {
          setAnswers({
            ...answers,
            diseases: filtered.filter((d) => d !== disease),
          });
        } else {
          setAnswers({ ...answers, diseases: [...filtered, disease] });
        }
      }
    };

    const hasNone = answers.diseases.includes("none");

    return (
      <QuestionCard
        question="您是否有以下健康狀況？"
        icon="medical-outline"
        iconColor="#EF4444"
        subtitle="可多選，幫助我們提供更精準的健康建議"
      >
        {diseaseOptions.map((option) => (
          <OptionChip
            key={option.id}
            label={option.label}
            isSelected={
              option.id === "none"
                ? hasNone
                : answers.diseases.includes(option.id as DiseaseType)
            }
            onPress={() => handleDiseaseToggle(option.id)}
            multiSelect
            disabled={option.id !== "none" && hasNone}
          />
        ))}
      </QuestionCard>
    );
  };

  // Step 8: Family Members (原步驟 6)
  const renderStep8 = () => {
    const familyOptions = [
      "只有自己",
      "伴侶",
      "嬰幼兒 (0-3歲)",
      "學齡兒童 (4-12歲)",
      "青少年 (13-18歲)",
      "長輩 (65歲以上)",
      "孕婦",
    ];

    const handleFamilyToggle = (member: string) => {
      if (member === "只有自己") {
        // 如果已經選擇了「只有自己」，點擊可以取消選擇
        if (answers.familyMembers.includes("只有自己")) {
          setAnswers({ ...answers, familyMembers: [] });
        } else {
          // 選擇「只有自己」會清空其他選項
          setAnswers({ ...answers, familyMembers: ["只有自己"] });
        }
      } else {
        // 選擇其他選項時，自動移除「只有自己」並啟用該選項
        const filtered = answers.familyMembers.filter((m) => m !== "只有自己");
        if (filtered.includes(member)) {
          // 如果已選中，則取消選擇
          setAnswers({
            ...answers,
            familyMembers: filtered.filter((m) => m !== member),
          });
        } else {
          // 如果未選中，則添加到選擇列表
          setAnswers({ ...answers, familyMembers: [...filtered, member] });
        }
      }
    };

    return (
      <QuestionCard
        question="您心裡最在意誰的健康？"
        icon="people-outline"
        subtitle="幫助我們考慮不同年齡層的營養需求"
      >
        {familyOptions.map((option) => (
          <OptionChip
            key={option}
            label={option}
            isSelected={answers.familyMembers.includes(option)}
            onPress={() => handleFamilyToggle(option)}
            multiSelect
          />
        ))}
      </QuestionCard>
    );
  };

  // Step 9: Basic Info (Gender + Age) (原步驟 7)
  const renderStep9 = () => {
    const genderOptions = ["男性", "女性", "其他", "不願透露"];
    const ageOptions = ["18-25歲", "26-35歲", "36-45歲", "46-55歲", "56歲以上"];

    return (
      <>
        <QuestionCard
          question="您的性別是？"
          icon="person-outline"
          subtitle=""
        >
          {genderOptions.map((option) => (
            <OptionChip
              key={option}
              label={option}
              isSelected={answers.gender === option}
              onPress={() => setAnswers({ ...answers, gender: option })}
            />
          ))}
        </QuestionCard>

        <View style={{ height: 16 }} />

        <QuestionCard
          question="您的年齡層是？"
          icon="calendar-outline"
          subtitle=""
        >
          {ageOptions.map((option) => (
            <OptionChip
              key={option}
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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text style={styles.progressText}>
          步驟 {currentStep} / 9
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
            <Text style={styles.backButtonText}>上一步</Text>
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
            {currentStep === 9 ? "完成" : "下一步"}
          </Text>
        </Pressable>
      </View>
    </View>
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
