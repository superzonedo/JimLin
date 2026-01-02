import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function TermsOfServiceScreen() {
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
          <Text className="text-lg font-semibold text-[#001858] ml-4">服務條款</Text>
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
            歡迎使用 LabelX！這些服務條款（以下簡稱「條款」）規範您對我們應用程式和服務（以下簡稱「服務」）的使用。使用我們的服務即表示您同意接受這些條款的約束。
          </Text>
        </View>

        {/* Section 1 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-yellow-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">1. 服務描述</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-3">
            LabelX 是一款食品標籤掃描和營養分析應用程式，提供以下服務：
          </Text>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 掃描食品標籤並識別成分
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 提供營養分析和健康評分
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 個性化健康建議和過敏原警示
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • 掃描歷史記錄和趨勢分析
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-yellow-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">2. 帳戶註冊</Text>
          </View>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 您必須年滿13歲才能使用我們的服務
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 您有責任維護帳戶安全並保管密碼
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 您必須提供準確、完整的註冊資訊
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • 您不得與他人共享您的帳戶
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-yellow-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">3. 訂閱和付款</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-3">
            <Text className="font-semibold">3.1 免費和 PRO 版本</Text>
          </Text>
          <View className="ml-4 mb-3">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 免費版本提供基本掃描功能和有限的歷史記錄（最多5筆）
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • PRO 訂閱解鎖無限掃描歷史、自訂項目和進階分析
            </Text>
          </View>
          
          <Text className="text-base text-gray-700 leading-6 mb-3">
            <Text className="font-semibold">3.2 訂閱條款</Text>
          </Text>
          <View className="ml-4 mb-3">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 訂閱透過 Apple App Store 或 Google Play Store 處理
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 提供月度（¥12/月）和年度（¥99/年）訂閱選項
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 訂閱將自動續訂，除非在當前訂閱期結束前至少24小時取消
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • 價格可能因地區而異，並可能隨時調整
            </Text>
          </View>

          <Text className="text-base text-gray-700 leading-6 mb-3">
            <Text className="font-semibold">3.3 取消和退款</Text>
          </Text>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 您可以隨時在設備設定中取消訂閱
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 取消將在當前計費週期結束時生效
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • 退款政策遵循 Apple 和 Google 的標準條款
            </Text>
          </View>
        </View>

        {/* Section 4 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-yellow-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">4. 使用限制</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-3">
            您同意不會：
          </Text>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 違反任何適用的法律或法規使用服務
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 侵犯他人的知識產權或隱私權
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 上傳惡意軟體或病毒
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 試圖繞過安全措施或訪問限制
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 使用自動化工具或機器人
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • 干擾或中斷服務的正常運作
            </Text>
          </View>
        </View>

        {/* Section 5 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-yellow-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">5. 免責聲明</Text>
          </View>
          <View className="bg-orange-50 rounded-2xl p-4 mb-3">
            <View className="flex-row">
              <Ionicons name="warning" size={24} color="#F59E0B" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-orange-800 mb-2">重要提醒</Text>
                <Text className="text-sm text-orange-700 leading-5">
                  LabelX 提供的資訊僅供參考，不應作為醫療建議。請諮詢專業醫療人員以獲取個人化的健康指導。
                </Text>
              </View>
            </View>
          </View>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 我們努力提供準確的資訊，但不保證完全準確或最新
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 服務按「現狀」提供，不提供任何明示或暗示的擔保
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • 我們不對因使用或無法使用服務而產生的損失負責
            </Text>
          </View>
        </View>

        {/* Section 6 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-yellow-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">6. 知識產權</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-3">
            服務中的所有內容，包括文字、圖形、標誌、圖片、軟體和數據，均為我們或我們的授權人所有，並受知識產權法保護。
          </Text>
          <Text className="text-base text-gray-700 leading-6">
            您獲得有限的、非獨占的、不可轉讓的使用許可，僅供個人非商業用途。
          </Text>
        </View>

        {/* Section 7 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-yellow-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">7. 服務終止</Text>
          </View>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 我們保留隨時暫停或終止您訪問服務的權利
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • 如果您違反這些條款，我們可能會立即終止您的帳戶
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • 終止後，您使用服務的權利將立即停止
            </Text>
          </View>
        </View>

        {/* Section 8 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-yellow-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">8. 條款變更</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6">
            我們可能會不時修改這些條款。重大變更將通過應用內通知或電子郵件通知您。繼續使用服務即表示您接受修改後的條款。
          </Text>
        </View>

        {/* Section 9 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-yellow-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">9. 適用法律</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6">
            這些條款受中華民國法律管轄，任何爭議應提交至台灣台北地方法院管轄。
          </Text>
        </View>

        {/* Section 10 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-yellow-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">10. 聯繫我們</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-4">
            如果您對這些服務條款有任何問題，請聯繫我們：
          </Text>
          <View className="bg-gray-50 rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="mail-outline" size={20} color="#F59E0B" />
              <Text className="text-base text-gray-800 ml-3">support@labelx.com</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="globe-outline" size={20} color="#F59E0B" />
              <Text className="text-base text-gray-800 ml-3">www.labelx.com/terms</Text>
            </View>
          </View>
        </View>

        {/* Footer Note */}
        <View className="mx-6 mb-6 bg-yellow-50 rounded-2xl p-4">
          <View className="flex-row">
            <Ionicons name="document-text" size={24} color="#F59E0B" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-gray-800 mb-1">
                接受條款
              </Text>
              <Text className="text-sm text-gray-700 leading-5">
                使用 LabelX 即表示您已閱讀、理解並同意遵守這些服務條款。如果您不同意這些條款，請不要使用我們的服務。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
