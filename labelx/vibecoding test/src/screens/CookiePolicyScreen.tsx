import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function CookiePolicyScreen() {
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
          <Text className="text-lg font-semibold text-[#001858] ml-4">Cookie 政策</Text>
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
            本 Cookie 政策說明了 LabelX 如何使用 Cookie 和類似技術來識別您訪問我們的應用程式時的身份。它解釋了這些技術是什麼，以及我們為何使用它們，以及您控制我們使用它們的權利。
          </Text>
        </View>

        {/* Section 1 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-purple-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">1. 什麼是 Cookie？</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-3">
            Cookie 是當您訪問網站或使用應用程式時，儲存在您設備上的小型數據文件。它們被廣泛用於使應用程式正常工作，或更有效地工作，以及向開發者提供資訊。
          </Text>
          <Text className="text-base text-gray-700 leading-6">
            我們的應用程式使用第一方和第三方 Cookie 來實現不同的功能，包括分析、個性化和廣告（如果適用）。
          </Text>
        </View>

        {/* Section 2 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-purple-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">2. 我們使用的 Cookie 類型</Text>
          </View>
          
          {/* Essential Cookies */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">
              ⚡ 必要 Cookie
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              這些 Cookie 對於應用程式的基本功能至關重要，無法禁用。
            </Text>
            <View className="bg-gray-50 rounded-xl p-3 ml-4">
              <Text className="text-sm text-gray-700 mb-1">• 用戶身份驗證和會話管理</Text>
              <Text className="text-sm text-gray-700 mb-1">• 安全和防欺詐功能</Text>
              <Text className="text-sm text-gray-700">• 記住您的偏好設定</Text>
            </View>
          </View>

          {/* Analytics Cookies */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">
              📊 分析 Cookie
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              這些 Cookie 幫助我們了解用戶如何使用應用程式，以便我們改善服務。
            </Text>
            <View className="bg-gray-50 rounded-xl p-3 ml-4">
              <Text className="text-sm text-gray-700 mb-1">• 訪問次數和流量來源</Text>
              <Text className="text-sm text-gray-700 mb-1">• 最常用的功能</Text>
              <Text className="text-sm text-gray-700 mb-1">• 用戶行為模式</Text>
              <Text className="text-sm text-gray-700">• 應用性能和錯誤追蹤</Text>
            </View>
          </View>

          {/* Functional Cookies */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">
              🎯 功能性 Cookie
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              這些 Cookie 使應用程式能夠提供增強的功能和個性化。
            </Text>
            <View className="bg-gray-50 rounded-xl p-3 ml-4">
              <Text className="text-sm text-gray-700 mb-1">• 記住您的語言偏好</Text>
              <Text className="text-sm text-gray-700 mb-1">• 保存您的健康目標和過敏原設定</Text>
              <Text className="text-sm text-gray-700 mb-1">• 個性化內容推薦</Text>
              <Text className="text-sm text-gray-700">• 聊天功能（如果適用）</Text>
            </View>
          </View>

          {/* Advertising Cookies */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">
              📢 廣告 Cookie（未使用）
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              我們目前不使用廣告 Cookie。如果未來使用，我們會更新本政策並通知您。
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-purple-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">3. 第三方 Cookie</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-3">
            我們可能使用以下第三方服務，這些服務可能會設置自己的 Cookie：
          </Text>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">分析服務</Text>：Google Analytics、Firebase Analytics
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">雲端服務</Text>：AWS、Azure（用於數據儲存）
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              • <Text className="font-semibold">支付服務</Text>：Apple Pay、Google Pay
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              • <Text className="font-semibold">客服工具</Text>：Zendesk、Intercom
            </Text>
          </View>
        </View>

        {/* Section 4 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-purple-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">4. Cookie 的使用期限</Text>
          </View>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-6 mb-3">
              <Text className="font-semibold">會話 Cookie（Session Cookies）</Text>
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-4 ml-4">
              這些 Cookie 是臨時的，當您關閉應用程式時會被刪除。主要用於身份驗證和會話管理。
            </Text>
            
            <Text className="text-base text-gray-700 leading-6 mb-3">
              <Text className="font-semibold">持久性 Cookie（Persistent Cookies）</Text>
            </Text>
            <Text className="text-base text-gray-700 leading-6 ml-4">
              這些 Cookie 會保留更長時間（通常為幾天到幾年），用於記住您的偏好和登入狀態。
            </Text>
          </View>
        </View>

        {/* Section 5 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-purple-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">5. 如何控制 Cookie</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-3">
            您有權決定是否接受或拒絕 Cookie。您可以通過以下方式控制 Cookie：
          </Text>
          
          <View className="bg-purple-50 rounded-2xl p-4 mb-4">
            <Text className="text-sm font-semibold text-purple-900 mb-2">
              📱 應用內設定
            </Text>
            <Text className="text-sm text-purple-800 leading-5">
              前往「設定」→「隱私與安全」→「使用數據分析」來控制分析 Cookie 的使用。
            </Text>
          </View>

          <View className="bg-purple-50 rounded-2xl p-4 mb-4">
            <Text className="text-sm font-semibold text-purple-900 mb-2">
              ⚙️ 設備設定
            </Text>
            <Text className="text-sm text-purple-800 leading-5 mb-2">
              iOS：設定 → 隱私 → 追蹤 → 停用「允許 App 要求追蹤」
            </Text>
            <Text className="text-sm text-purple-800 leading-5">
              Android：設定 → Google → 廣告 → 重設廣告 ID
            </Text>
          </View>

          <View className="bg-orange-50 rounded-2xl p-4">
            <View className="flex-row">
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-orange-900 mb-1">
                  注意事項
                </Text>
                <Text className="text-sm text-orange-800 leading-5">
                  禁用某些 Cookie 可能會影響應用程式的功能。必要 Cookie 無法被禁用，因為它們是提供服務所必需的。
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 6 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-purple-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">6. 不追蹤信號（Do Not Track）</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6">
            我們目前不會響應瀏覽器的「不追蹤」信號。然而，您可以通過上述方法控制 Cookie 的使用。
          </Text>
        </View>

        {/* Section 7 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-purple-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">7. Cookie 政策更新</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6">
            我們可能會不時更新本 Cookie 政策，以反映我們實踐的變化或其他運營、法律或監管原因。我們建議您定期查看本政策。
          </Text>
        </View>

        {/* Section 8 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-purple-500 w-1 h-6 rounded-full mr-3" />
            <Text className="text-lg font-bold text-[#001858]">8. 更多資訊</Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-4">
            如果您對我們使用 Cookie 有任何疑問，請聯繫我們：
          </Text>
          <View className="bg-gray-50 rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="mail-outline" size={20} color="#8B5CF6" />
              <Text className="text-base text-gray-800 ml-3">support@labelx.com</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="globe-outline" size={20} color="#8B5CF6" />
              <Text className="text-base text-gray-800 ml-3">www.labelx.com/cookies</Text>
            </View>
          </View>
        </View>

        {/* Footer Note */}
        <View className="mx-6 mb-6 bg-purple-50 rounded-2xl p-4">
          <View className="flex-row">
            <Ionicons name="browsers" size={24} color="#8B5CF6" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-gray-800 mb-1">
                Cookie 使用同意
              </Text>
              <Text className="text-sm text-gray-700 leading-5">
                繼續使用 LabelX 即表示您同意我們根據本政策使用 Cookie。您可以隨時更改您的 Cookie 設定。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
