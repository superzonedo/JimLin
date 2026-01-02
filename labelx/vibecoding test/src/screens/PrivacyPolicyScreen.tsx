import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#FFFFFF]">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-[#FFFFFF] border-b border-gray-200"
      >
        <View className="flex-row items-center px-6 py-4">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text className="text-lg font-semibold text-[#001858] ml-4">隱私政策</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated */}
        <View className="px-6 mt-6">
          <View className="bg-blue-50 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={20} color="#3B82F6" />
              <Text className="text-sm text-blue-700 ml-2 font-medium">
                最後更新：2025年1月
              </Text>
            </View>
          </View>
        </View>

        {/* Introduction */}
        <View className="px-6 mb-6">
          <Text className="text-base text-gray-800 leading-6">
            歡迎使用 LabelX！我們非常重視您的隱私權。本隱私政策說明了我們如何收集、使用、披露和保護您的個人資料。
          </Text>
        </View>

        {/* Section 1 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">1. 我們收集的資訊</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-3">
            為了提供服務，我們可能收集以下類型的資訊：
          </Text>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">帳戶資訊</Text>：您註冊時提供的用戶名稱和電子郵件
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">掃描數據</Text>：您掃描的食品標籤圖片和分析結果
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">健康偏好</Text>：您設定的健康目標、過敏原和疾病資訊
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">使用數據</Text>：應用使用情況、功能互動和錯誤日誌
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • <Text className="font-semibold">設備資訊</Text>：設備型號、作業系統版本、唯一設備識別碼
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">2. 資訊使用方式</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-3">
            我們使用收集的資訊用於以下目的：
          </Text>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 提供和改進我們的服務功能
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 個性化您的使用體驗和健康建議
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 處理訂閱和付款交易
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 發送重要通知和更新
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • 分析應用性能和用戶行為以改善服務
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">3. 資訊分享與披露</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-3">
            我們承諾不會出售您的個人資訊。我們僅在以下情況下分享資訊：
          </Text>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">服務提供商</Text>：與協助我們運營的第三方服務商（如雲端儲存、分析工具）
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">法律要求</Text>：遵守法律義務或回應法律程序
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • <Text className="font-semibold">業務轉讓</Text>：如發生合併、收購或資產出售
            </Text>
          </View>
        </View>

        {/* Section 4 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">4. 數據安全</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6">
            我們採用業界標準的安全措施保護您的資料，包括加密傳輸和儲存、訪問控制和定期安全審計。然而，請注意沒有任何傳輸方式或電子儲存方法是100%安全的。
          </Text>
        </View>

        {/* Section 5 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">5. 您的權利</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-3">
            您對個人資料擁有以下權利：
          </Text>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">訪問權</Text>：查看我們持有的您的個人資料
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">更正權</Text>：要求更正不準確的資料
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">刪除權</Text>：要求刪除您的個人資料
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">限制處理權</Text>：限制我們處理您的資料
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • <Text className="font-semibold">數據可攜權</Text>：以結構化格式接收您的資料
            </Text>
          </View>
        </View>

        {/* Section 6 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">6. 兒童隱私</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6">
            我們的服務不面向13歲以下的兒童。我們不會故意收集13歲以下兒童的個人資訊。如果您認為我們可能持有來自或關於兒童的資訊，請聯繫我們。
          </Text>
        </View>

        {/* Section 7 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">7. Cookie 使用</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6">
            我們使用 Cookie 和類似技術來改善用戶體驗、分析使用情況和個性化內容。您可以在設備設置中管理 Cookie 偏好。詳情請參閱我們的 Cookie 政策。
          </Text>
        </View>

        {/* Section 8 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">8. 政策變更</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6">
            我們可能會不時更新本隱私政策。重大變更將通過應用內通知或電子郵件通知您。繼續使用服務即表示您接受更新後的政策。
          </Text>
        </View>

        {/* Section 9 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">9. 聯繫我們</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-4">
            如果您對本隱私政策有任何問題或疑慮，請通過以下方式聯繫我們：
          </Text>
          <View className="bg-gray-50 rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="mail-outline" size={20} color="#2CB67D" />
              <Text className="text-base text-gray-800 ml-3">support@labelx.com</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="globe-outline" size={20} color="#2CB67D" />
              <Text className="text-base text-gray-800 ml-3">www.labelx.com/privacy</Text>
            </View>
          </View>
        </View>

        {/* Footer Note */}
        <View className="mx-6 mb-6 bg-green-50 rounded-2xl p-4">
          <View className="flex-row">
            <Ionicons name="shield-checkmark" size={24} color="#2CB67D" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-gray-800 mb-1">
                您的隱私是我們的首要任務
              </Text>
              <Text className="text-sm text-gray-700 leading-5">
                我們承諾保護您的個人資料，並遵守所有適用的隱私法規，包括 GDPR 和 CCPA。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
