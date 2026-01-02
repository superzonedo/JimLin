import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function HelpCenterScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqCategories = [
    {
      title: "基本功能",
      icon: "help-circle" as const,
      color: "#3B82F6",
      items: [
        {
          id: 1,
          question: "如何掃描食品標籤？",
          answer: "點擊底部的相機按鈕，將鏡頭對準食品標籤上的成分表，確保光線充足且文字清晰。拍照後，AI 會自動分析成分並給出健康評分。"
        },
        {
          id: 2,
          question: "健康評分是如何計算的？",
          answer: "健康評分基於多個因素：成分的安全性、添加物的風險等級、營養成分比例等。71-100分為健康（綠色），31-70分為中等（黃色），0-30分為需注意（紅色）。"
        },
        {
          id: 3,
          question: "可以上傳相簿中的照片嗎？",
          answer: "可以！在相機介面點擊左下角的相簿圖標，選擇您之前拍攝的食品標籤照片進行分析。"
        }
      ]
    },
    {
      title: "進階功能",
      icon: "star" as const,
      color: "#F59E0B",
      items: [
        {
          id: 4,
          question: "什麼是過敏原警報？",
          answer: "過敏原警報是 PRO 會員專屬功能。您可以在偏好設定中設定您的過敏原，掃描時如果檢測到這些成分，會立即發出警告提示。"
        },
        {
          id: 5,
          question: "如何查看歷史記錄？",
          answer: "點擊底部導航欄的「記錄」標籤，即可查看所有掃描歷史。您可以使用搜尋功能或日期篩選來快速找到特定記錄。"
        },
        {
          id: 6,
          question: "可以收藏產品嗎？",
          answer: "可以！在分析結果頁面點擊右上角的星星圖標，即可將該產品加入收藏。稍後可以在個人頁面快速查看收藏清單。"
        }
      ]
    },
    {
      title: "帳戶與訂閱",
      icon: "card" as const,
      color: "#2CB67D",
      items: [
        {
          id: 7,
          question: "PRO 會員有什麼好處？",
          answer: "PRO 會員享有：無廣告體驗、無限掃描次數、過敏原自動警報、進階營養圖表分析、個人健康目標設定、優先客服支援等功能。"
        },
        {
          id: 8,
          question: "如何升級為 PRO 會員？",
          answer: "前往「我的」→「訂閱管理」，選擇月付或年付方案即可升級。年付方案更優惠，相當於每月只需 8.25 元。"
        },
        {
          id: 9,
          question: "可以取消訂閱嗎？",
          answer: "可以隨時取消。前往「我的」→「訂閱管理」，點擊「管理訂閱」即可取消。取消後，您仍可使用至當前訂閱期結束。"
        }
      ]
    },
    {
      title: "疑難排解",
      icon: "warning" as const,
      color: "#EF4444",
      items: [
        {
          id: 10,
          question: "掃描結果不準確怎麼辦？",
          answer: "請確保：1) 照片清晰、光線充足；2) 成分表完整可見；3) 避免反光和模糊；4) 靠近標籤拍攝。如果仍不準確，請嘗試重新拍攝或使用相簿上傳更清晰的照片。"
        },
        {
          id: 11,
          question: "為什麼有些成分辨識不出來？",
          answer: "可能原因：成分文字過小或模糊、使用了罕見的化學名稱、照片質量不佳。建議重新拍攝更清晰的照片，或手動搜尋該成分。"
        },
        {
          id: 12,
          question: "應用程式閃退或卡頓？",
          answer: "請嘗試：1) 關閉應用後重新開啟；2) 前往「隱私與安全」清除緩存；3) 確保已更新至最新版本；4) 重新啟動手機。如問題持續，請聯絡客服。"
        }
      ]
    }
  ];

  const toggleFAQ = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-white border-b border-gray-200"
      >
        <View className="flex-row items-center px-6 py-4">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text className="text-lg font-semibold text-[#001858] ml-4">幫助中心</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQ Categories */}
        {faqCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} className="mt-6 px-6">
            <View className="flex-row items-center mb-3 ml-2">
              <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: category.color + "20" }}
              >
                <Ionicons name={category.icon} size={18} color={category.color} />
              </View>
              <Text className="text-base font-semibold text-gray-800">{category.title}</Text>
            </View>
            <View className="bg-white rounded-3xl overflow-hidden" style={styles.card}>
              {category.items.map((item, index) => (
                <View key={item.id}>
                  <Pressable
                    onPress={() => toggleFAQ(item.id)}
                    className="px-5 py-4"
                    style={index < category.items.length - 1 && expandedId !== item.id ? styles.itemBorder : {}}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="flex-1 text-base font-medium text-[#001858] mr-3">
                        {item.question}
                      </Text>
                      <Ionicons
                        name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#9CA3AF"
                      />
                    </View>
                    {expandedId === item.id && (
                      <Text className="text-sm text-gray-600 mt-3 leading-6">
                        {item.answer}
                      </Text>
                    )}
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
});
