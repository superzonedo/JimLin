import { Colors } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { checkIngredientDiseaseMatch, generateIngredientAlertReason } from "@/utils/ingredientAlertGenerator";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface PersonalizedHealthAlertProps {
  backendData: any;
  userPreferences?: any;
}

export default function PersonalizedHealthAlert({ backendData, userPreferences }: PersonalizedHealthAlertProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(true); // 預設展開
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  // 從後端獲取個人化風險評估數據（新結構）
  const personalizedRiskAssessment = backendData?.personalizedRiskAssessment;
  const diseaseSpecificWarnings = backendData?.diseaseSpecificWarnings || [];
  const personalizedRecommendation = backendData?.personalizedRecommendation;

  // 對疾病特定警告按風險等級排序（high > moderate > low）
  const sortedWarnings = useMemo(() => {
    if (!diseaseSpecificWarnings.length) return [];
    const riskOrder: Record<string, number> = { high: 0, moderate: 1, low: 2 };
    return [...diseaseSpecificWarnings].sort((a: any, b: any) => {
      return (riskOrder[a.riskLevel] || 2) - (riskOrder[b.riskLevel] || 2);
    });
  }, [diseaseSpecificWarnings]);

  // 檢查疾病相關風險成分（舊的前端邏輯，作為備用）
  const diseaseAlerts = useMemo(() => {
    // 如果後端已經提供了 diseaseSpecificWarnings，優先使用後端數據
    if (diseaseSpecificWarnings.length > 0) return [];
    
    if (!backendData) return [];
    
    // 如果沒有用戶設定，不顯示任何警示
    if (!userPreferences) return [];
    
    // 檢查用戶設定的疾病
    const diseases = [
      ...(userPreferences.diseases || []),
      ...(userPreferences.customDiseases || []),
    ];
    
    // 如果用戶沒有設定任何疾病，不顯示警示
    if (diseases.length === 0) return [];

    const alerts: Array<{ ingredientName: string; disease: string; reason: string }> = [];
    
    // 檢查所有成分
    const allIngredients = [
      ...(backendData.additives || []),
      ...(backendData.concerningIngredients || []),
      ...(backendData.allIngredients || []),
    ];

    // 檢查所有成分與疾病的關聯
    diseases.forEach((disease: string) => {
      allIngredients.forEach((ingredient: any) => {
        const ingredientName = ingredient.name || '';
        
        // 使用通用檢查函數判斷成分是否與疾病相關
        if (checkIngredientDiseaseMatch(ingredientName, disease, ingredient)) {
          // 查找後端數據中的詳細資訊
          let ingredientData = ingredient;
          
          // 如果是添加劑，查找 additives 中的詳細資訊
          if (ingredient.category === 'additive') {
            const additive = backendData?.additives?.find((a: any) => a.name === ingredientName);
            if (additive) {
              ingredientData = { ...ingredient, ...additive };
            }
          }
          
          // 如果是需關注成分，查找 concerningIngredients 中的詳細資訊
          if (ingredient.category === 'concerning') {
            const concerning = backendData?.concerningIngredients?.find((c: any) => c.name === ingredientName);
            if (concerning) {
              ingredientData = { ...ingredient, ...concerning };
            }
          }
          
          // 生成疾病名稱 - 處理所有可能的疾病格式
          const normalizeDisease = (diseaseStr: string): string => {
            const lowerDisease = diseaseStr.toLowerCase().replace(/[-_\s]/g, '');
            
            // 高血壓
            if (lowerDisease.includes('hypertension') || lowerDisease.includes('高血壓') || lowerDisease.includes('血壓')) {
              return t('personalizedAlert.hypertension');
            }
            // 糖尿病
            if (lowerDisease.includes('diabetes') || lowerDisease.includes('糖尿病') || lowerDisease.includes('血糖')) {
              return t('personalizedAlert.diabetes');
            }
            // 腎臟病
            if (lowerDisease.includes('kidney') || lowerDisease.includes('腎臟') || lowerDisease.includes('腎')) {
              return t('personalizedAlert.kidneyDisease');
            }
            // 肝臟病
            if (lowerDisease.includes('liver') || lowerDisease.includes('肝臟') || lowerDisease.includes('肝') || lowerDisease.includes('脂肪肝')) {
              return t('personalizedAlert.liverDisease');
            }
            // 皮膚疾病
            if (lowerDisease.includes('skin') || lowerDisease.includes('皮膚') || lowerDisease.includes('痘痘') || lowerDisease.includes('acne')) {
              return t('personalizedAlert.skinDisease');
            }
            // 高膽固醇
            if (lowerDisease.includes('cholesterol') || lowerDisease.includes('膽固醇') || lowerDisease.includes('highcholesterol')) {
              return t('personalizedAlert.highCholesterol');
            }
            // 腸胃敏感
            if (lowerDisease.includes('stomach') || lowerDisease.includes('腸胃') || lowerDisease.includes('stomachsensitivity')) {
              return t('personalizedAlert.stomachSensitivity');
            }
            // 代謝疾病
            if (lowerDisease.includes('metabolic') || lowerDisease.includes('代謝') || lowerDisease.includes('metabolicdisease')) {
              return t('personalizedAlert.metabolicDisease');
            }
            
            // 如果無法匹配，嘗試直接使用翻譯鍵值（如果疾病名稱本身就是翻譯鍵）
            const translationKey = `personalizedAlert.${diseaseStr}`;
            try {
              const translated = t(translationKey);
              // 如果翻譯結果不等於鍵值本身，說明找到了翻譯
              if (translated !== translationKey) {
                return translated;
          }
            } catch (e) {
              // 翻譯鍵不存在，繼續
            }
            
            // 如果都無法匹配，返回原始疾病名稱（可能是自訂疾病）
            return diseaseStr;
          };
          
          const diseaseName = normalizeDisease(disease);
          
          // 使用通用生成器生成說明
          const reason = generateIngredientAlertReason(ingredientName, disease, ingredientData);
          
          alerts.push({
            ingredientName: ingredientName,
            disease: diseaseName,
            reason: reason,
          });
        }
      });
    });

    // 去重
    const uniqueAlerts = alerts.filter((alert, index, self) =>
      index === self.findIndex((a) => a.ingredientName === alert.ingredientName && a.disease === alert.disease)
    );

    return uniqueAlerts;
  }, [backendData, userPreferences, diseaseSpecificWarnings]);

  // 檢查健康目標
  const healthGoalChecks = useMemo(() => {
    if (!backendData) return [];
    
    // 如果沒有用戶設定，不顯示任何檢查
    if (!userPreferences) return [];
    
    // 檢查用戶設定的健康目標
    const goals = [
      ...(userPreferences.healthGoals || []),
      ...(userPreferences.customHealthGoals || []),
    ];
    
    // 如果用戶沒有設定任何健康目標，不顯示檢查
    if (goals.length === 0) return [];

    const nutrition = backendData.nutritionPer100 || {};
    const checks: Array<{
      name: string;
      nameEn: string;
      compliant: boolean;
      actualValue: string;
      recommendedValue: string;
      message: string;
    }> = [];

    // 高纖飲食
    if (goals.some((g: string) => g.includes('fiber') || g.includes('纖維') || g.includes('高纖') || g === 'high-fiber')) {
      const fiber = nutrition.fiberG || 0;
      const compliant = fiber >= 5;
      checks.push({
        name: t('personalizedAlert.highFiberDiet'),
        nameEn: t('personalizedAlert.highFiberDiet'),
        compliant,
        actualValue: `${fiber}g`,
        recommendedValue: '≥ 5g',
        message: compliant 
          ? t('personalizedAlert.fiberMeets', { value: fiber.toString() })
          : t('personalizedAlert.fiberLow', { value: fiber.toString() }),
      });
    }

    // 低鈉飲食
    if (goals.some((g: string) => g.includes('sodium') || g.includes('鈉') || g.includes('低鈉') || g === 'low-sodium')) {
      const sodium = nutrition.sodiumMg || 0;
      const compliant = sodium <= 600;
      const sodiumText = sodium > 0 ? `${sodium}mg` : '估計約600-800mg (推測)';
      checks.push({
        name: t('personalizedAlert.lowSodiumDiet'),
        nameEn: t('personalizedAlert.lowSodiumDiet'),
        compliant,
        actualValue: sodiumText,
        recommendedValue: '≤ 600mg',
        message: compliant 
          ? t('personalizedAlert.sodiumMeets', { value: sodiumText })
          : t('personalizedAlert.sodiumHigh', { value: sodiumText }),
      });
    }

    // 低脂飲食
    if (goals.some((g: string) => g.includes('fat') || g.includes('脂') || g.includes('低脂') || g === 'low-fat')) {
      const fat = nutrition.satFatG || 0;
      const compliant = fat <= 10;
      const fatText = fat > 0 ? `${fat}g` : '1-2g';
      checks.push({
        name: t('personalizedAlert.lowFatDiet'),
        nameEn: t('personalizedAlert.lowFatDiet'),
        compliant,
        actualValue: fatText,
        recommendedValue: '≤ 10g',
        message: compliant 
          ? t('personalizedAlert.fatMeets', { value: fatText })
          : t('personalizedAlert.fatHigh', { value: fatText }),
      });
    }

    // 低糖飲食
    if (goals.some((g: string) => g.includes('sugar') || g.includes('糖') || g.includes('低糖') || g === 'low-sugar')) {
      const sugar = nutrition.sugarG || 0;
      const compliant = sugar <= 10;
      const sugarText = sugar > 0 ? `${sugar}g` : '低於3g';
      checks.push({
        name: t('personalizedAlert.lowSugarDiet'),
        nameEn: t('personalizedAlert.lowSugarDiet'),
        compliant,
        actualValue: sugarText,
        recommendedValue: '≤ 10g',
        message: compliant 
          ? t('personalizedAlert.sugarMeets', { value: sugarText })
          : t('personalizedAlert.sugarHigh', { value: sugarText }),
      });
    }

    return checks;
  }, [backendData, userPreferences]);

  // 判斷是否有任何警示需要顯示
  const hasBackendWarnings = personalizedRiskAssessment || sortedWarnings.length > 0;
  const hasAlerts = hasBackendWarnings || diseaseAlerts.length > 0 || healthGoalChecks.some(c => !c.compliant);

  if (!hasAlerts) return null;

  // 取得整體風險等級的顏色和文字
  const getRiskLevelStyle = (level: string) => {
    switch (level) {
      case 'warning':
      case 'high':
        return {
          bg: colorScheme === 'dark' ? '#7F1D1D' : '#FEE2E2',
          border: '#EF4444',
          text: '#EF4444',
          icon: 'warning' as const,
          label: t('personalizedAlert.riskWarning') || '⚠️ 建議避免',
        };
      case 'caution':
      case 'moderate':
        return {
          bg: colorScheme === 'dark' ? '#78350F' : '#FEF3C7',
          border: '#F59E0B',
          text: '#F59E0B',
          icon: 'alert-circle' as const,
          label: t('personalizedAlert.riskCaution') || '⚡ 謹慎食用',
        };
      default:
        return {
          bg: colorScheme === 'dark' ? '#064E3B' : '#D1FAE5',
          border: '#10B981',
          text: '#10B981',
          icon: 'checkmark-circle' as const,
          label: t('personalizedAlert.riskSafe') || '✓ 相對安全',
        };
    }
  };

  const overallRiskStyle = personalizedRiskAssessment
    ? getRiskLevelStyle(personalizedRiskAssessment.overall)
    : getRiskLevelStyle('warning');

  return (
    <Animated.View entering={FadeInDown.delay(300).duration(400)} className="mx-6 mt-4">
      <View style={{
        backgroundColor: colorScheme === 'dark' ? '#1F1F1F' : '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.cardBorder,
      }}>
        {/* 標題區域 */}
        <Pressable onPress={() => setExpanded(!expanded)}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="heart" size={20} color="#EF4444" />
              <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
                {t('personalizedAlert.title')}
              </Text>
            </View>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.gray400}
            />
          </View>
        </Pressable>

        {expanded && (
          <View style={{ marginTop: 16 }}>
            {/* 整體風險評估卡片（新結構 - 來自後端） */}
            {personalizedRiskAssessment && (
              <View style={[styles.riskCard, {
                backgroundColor: overallRiskStyle.bg,
                borderColor: overallRiskStyle.border,
              }]}>
                <View style={styles.riskCardHeader}>
                  <Ionicons
                    name={overallRiskStyle.icon}
                    size={24}
                    color={overallRiskStyle.text}
                  />
                  <Text style={[styles.riskCardTitle, { color: overallRiskStyle.text }]}>
                    {overallRiskStyle.label}
                  </Text>
                </View>
                {personalizedRiskAssessment.reasoning && (
                  <Text style={[styles.riskCardReasoning, { color: theme.secondaryText }]}>
                    {personalizedRiskAssessment.reasoning}
                  </Text>
                )}
              </View>
            )}

            {/* 疾病特定警告（新結構 - 來自後端，按風險排序） */}
            {sortedWarnings.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
                  {t('personalizedAlert.specificWarnings') || '特定健康警告'} ({sortedWarnings.length})
                </Text>
                {sortedWarnings.map((warning: any, index: number) => {
                  const warningStyle = getRiskLevelStyle(warning.riskLevel);
                  return (
                    <View key={index} style={[styles.warningCard, {
                      backgroundColor: warningStyle.bg,
                      borderColor: warningStyle.border,
                    }]}>
                      <View style={styles.warningCardHeader}>
                        <Text style={[styles.warningDisease, { color: theme.primaryText }]}>
                          {warning.disease}
                        </Text>
                        <View style={[styles.riskBadge, { backgroundColor: warningStyle.border }]}>
                          <Text style={styles.riskBadgeText}>
                            {warning.riskLevel === 'high' ? '高風險' :
                             warning.riskLevel === 'moderate' ? '中風險' : '低風險'}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.warningText, { color: theme.secondaryText }]}>
                        {warning.warning}
                      </Text>
                      {warning.ingredientsOfConcern && warning.ingredientsOfConcern.length > 0 && (
                        <View style={styles.concernIngredients}>
                          <Text style={[styles.concernLabel, { color: theme.gray500 }]}>
                            {t('personalizedAlert.concernIngredients') || '需注意成分：'}
                          </Text>
                          <Text style={[styles.concernList, { color: warningStyle.text }]}>
                            {warning.ingredientsOfConcern.join('、')}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* 個人化綜合建議（新結構 - 來自後端） */}
            {personalizedRecommendation && (
              <View style={[styles.recommendationCard, { 
                backgroundColor: colorScheme === 'dark' ? '#1E3A5F' : '#EFF6FF',
                borderColor: '#3B82F6',
              }]}>
                <View style={styles.recommendationHeader}>
                  <Ionicons name="bulb" size={20} color="#3B82F6" />
                  <Text style={[styles.recommendationTitle, { color: '#3B82F6' }]}>
                    {t('personalizedAlert.recommendation') || '個人化建議'}
                  </Text>
                </View>
                <Text style={[styles.recommendationText, { color: theme.secondaryText }]}>
                  {personalizedRecommendation}
                </Text>
              </View>
            )}

            {/* 舊版：疾病相關風險成分（備用，當後端沒有提供新結構時使用） */}
            {diseaseAlerts.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
                  {t('personalizedAlert.diseaseRiskIngredients')} ({diseaseAlerts.length})
                </Text>
                {diseaseAlerts.map((alert, index) => (
                  <View key={index} style={[styles.alertCard, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.alertCardHeader}>
                      <Text style={[styles.alertIngredient, { color: theme.primaryText }]}>
                        {alert.ingredientName}
                      </Text>
                      <View style={[styles.riskBadge, { backgroundColor: theme.error }]}>
                        <Text style={styles.riskBadgeText}>{alert.disease}</Text>
                      </View>
                    </View>
                    <Text style={[styles.alertReason, { color: theme.secondaryText }]}>
                      {alert.reason}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* 健康目標檢查 */}
            {healthGoalChecks.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
                  {t('personalizedAlert.healthGoalCheck')} ({healthGoalChecks.length})
                </Text>
                {healthGoalChecks.map((check, index) => (
                  <View key={index} style={[styles.goalCard, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.goalCardHeader}>
                      <Text style={[styles.goalName, { color: theme.primaryText }]}>
                        {check.name}
                      </Text>
                      <View style={[styles.riskBadge, { 
                        backgroundColor: check.compliant ? theme.success : theme.error 
                      }]}>
                        <Text style={styles.riskBadgeText}>
                          {check.compliant ? t('personalizedAlert.compliant') : t('personalizedAlert.nonCompliant')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.goalMessage}>
                      <Text style={[styles.goalMessageText, { color: theme.secondaryText }]}>
                        {check.message}
                      </Text>
                      <Ionicons 
                        name={check.compliant ? "checkmark-circle" : "warning"} 
                        size={16} 
                        color={check.compliant ? theme.success : theme.warning} 
                      />
                    </View>
                    <View style={styles.goalValues}>
                      <Text style={[styles.goalActual, { color: theme.gray500 }]}>
                        {t('personalizedAlert.actual')}: {check.actualValue}
                      </Text>
                      <Text style={[styles.goalRecommended, { 
                        color: check.compliant 
                          ? (colorScheme === 'dark' ? '#6EE7B7' : '#059669')
                          : (colorScheme === 'dark' ? '#FCA5A5' : '#DC2626'),
                      }]}>
                        {t('personalizedAlert.recommended')}: {check.recommendedValue}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  // 整體風險評估卡片
  riskCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  riskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  riskCardReasoning: {
    fontSize: 14,
    lineHeight: 20,
  },
  // 疾病特定警告卡片
  warningCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  warningCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  warningDisease: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  concernIngredients: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  concernLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  concernList: {
    fontSize: 13,
    fontWeight: '500',
  },
  // 風險等級標籤
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  riskBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // 個人化建議卡片
  recommendationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // 舊版警示卡片
  alertCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alertIngredient: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  alertReason: {
    fontSize: 14,
    lineHeight: 20,
  },
  // 健康目標卡片
  goalCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  goalMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalMessageText: {
    fontSize: 14,
    flex: 1,
  },
  goalValues: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  goalActual: {
    fontSize: 14,
  },
  goalRecommended: {
    fontSize: 14,
    fontWeight: '500',
  },
});

