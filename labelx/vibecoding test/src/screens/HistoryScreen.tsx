import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, FlatList, Image, StyleSheet, TextInput, Modal, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { useFoodScanStore } from "../state/foodScanStore";
import { FoodAnalysisResult } from "../types/food";
import { HistoryStackParamList, RootTabParamList } from "../types/navigation";
import { format } from "date-fns";

type HistoryScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HistoryStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

type NavigationProp = HistoryScreenNavigationProp;

// Component to load images - simplified without Supabase
function ScanImage({ imageUri, style }: { imageUri: string; style: any }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadImage() {
      try {
        // If imageUri is empty, show placeholder
        if (!imageUri) {
          console.warn('Empty imageUri provided');
          setError(true);
          setIsLoading(false);
          return;
        }

        // Use the image URI directly (should be local file or http URL)
        setImageUrl(imageUri);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading image:", err);
        setError(true);
        setImageUrl(null);
        setIsLoading(false);
      }
    }
    loadImage();
  }, [imageUri]);

  if (isLoading) {
    return (
      <View style={[style, { justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5" }]}>
        <ActivityIndicator color="#2CB67D" size="small" />
      </View>
    );
  }

  if (error || !imageUrl) {
    return (
      <View style={[style, { justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5" }]}>
        <Ionicons name="image-outline" size={32} color="#9CA3AF" />
        <Text style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4 }}>圖片載入失敗</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={style}
      resizeMode="cover"
      onError={(e) => {
        console.warn('Image failed to load, showing placeholder. URI:', imageUrl?.substring(0, 50));
        setError(true);
      }}
    />
  );
}

export default function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const scanHistory = useFoodScanStore((s) => s.scanHistory);
  const setCurrentResult = useFoodScanStore((s) => s.setCurrentResult);
  const clearAllHistory = useFoodScanStore((s) => s.clearAllHistory);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "today" | "week">("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filtered history based on search and date filter
  const filteredHistory = useMemo(() => {
    let filtered = [...scanHistory];
    
    // Date filter
    if (filterType === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(item => 
        new Date(item.timestamp).toDateString() === today
      );
    } else if (filterType === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(item => 
        new Date(item.timestamp) >= weekAgo
      );
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.summary.toLowerCase().includes(query) ||
        item.recommendation.toLowerCase().includes(query) ||
        item.ingredients.safe.some(ing => ing.name.toLowerCase().includes(query)) ||
        item.ingredients.warning.some(ing => ing.name.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [scanHistory, searchQuery, filterType]);

  const handleItemPress = (item: FoodAnalysisResult) => {
    setCurrentResult(item);
    navigation.navigate("Result");
  };

  const getScoreColor = (score: number) => {
    if (score >= 71) return "#10B981";
    if (score >= 31) return "#F59E0B";
    return "#EF4444";
  };

  const renderItem = ({ item }: { item: FoodAnalysisResult }) => {
    const dateStr = format(new Date(item.timestamp), "MM/dd HH:mm");

    return (
      <Pressable
        onPress={() => handleItemPress(item)}
        className="bg-[#FFFFFF] mx-6 mb-4 rounded-3xl overflow-hidden"
        style={styles.card}
      >
        <View className="flex-row">
          <ScanImage 
            imageUri={item.imageUri} 
            style={{ width: 112, height: 112 }}
          />
          <View className="flex-1 p-4 justify-between">
            <View>
              <Text className="text-base font-semibold text-[#001858] mb-1" numberOfLines={1}>
                {item.productName || "未知產品"}
              </Text>
              <Text className="text-sm text-gray-600 mb-2">{dateStr}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View
                style={[
                  styles.scoreBadge,
                  { backgroundColor: getScoreColor(item.healthScore) + "20" },
                ]}
                className="px-4 py-2 rounded-full"
              >
                <Text
                  style={{ color: getScoreColor(item.healthScore) }}
                  className="text-xl font-bold"
                >
                  {item.healthScore}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-[#FFFFFF] border-b border-gray-200"
      >
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text className="text-lg font-semibold text-[#001858]">掃描歷史</Text>
          {scanHistory.length > 0 ? (
            <Pressable onPress={() => setShowDeleteConfirm(true)}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </Pressable>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        {/* Search Bar */}
        {scanHistory.length > 0 && (
          <View className="px-6 pb-4">
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="搜尋成分或關鍵字..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-base text-gray-900"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </Pressable>
              )}
            </View>

            {/* Filter Buttons */}
            <View className="flex-row mt-3 gap-2">
              <Pressable
                onPress={() => setFilterType("all")}
                className={`px-4 py-2 rounded-full ${
                  filterType === "all" ? "bg-[#2CB67D]" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filterType === "all" ? "text-white" : "text-gray-700"
                  }`}
                >
                  全部
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFilterType("today")}
                className={`px-4 py-2 rounded-full ${
                  filterType === "today" ? "bg-[#2CB67D]" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filterType === "today" ? "text-white" : "text-gray-700"
                  }`}
                >
                  今天
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFilterType("week")}
                className={`px-4 py-2 rounded-full ${
                  filterType === "week" ? "bg-[#2CB67D]" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filterType === "week" ? "text-white" : "text-gray-700"
                  }`}
                >
                  本週
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {scanHistory.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="document-text-outline" size={80} color="#D1D5DB" />
          <Text className="text-xl font-semibold text-gray-800 mt-6 text-center">
            尚無掃描記錄
          </Text>
          <Text className="text-base text-gray-600 mt-2 text-center">
            開始掃描食品標籤以查看健康評分
          </Text>
          <Pressable
            onPress={() => {
              // Navigate to ScanTab which will open Camera screen
              navigation.navigate("ScanTab");
            }}
            className="mt-8 bg-[#2CB67D] px-8 py-4 rounded-full"
          >
            <Text className="text-white font-semibold text-base">開始掃描</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center px-6 py-12">
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text className="text-lg font-semibold text-gray-800 mt-4 text-center">
                沒有符合的記錄
              </Text>
              <Text className="text-base text-gray-600 mt-2 text-center">
                試試其他搜尋關鍵字或篩選條件
              </Text>
            </View>
          }
        />
      )}

      {/* Clear All Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-3">
                <Ionicons name="warning" size={32} color="#EF4444" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                清空所有記錄？
              </Text>
              <Text className="text-base text-gray-600 text-center">
                此操作將永久刪除所有掃描歷史記錄，無法復原。
              </Text>
            </View>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 py-3 rounded-2xl"
              >
                <Text className="text-gray-700 font-semibold text-center text-base">
                  取消
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  clearAllHistory();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 bg-red-500 py-3 rounded-2xl"
              >
                <Text className="text-white font-semibold text-center text-base">
                  確認刪除
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  scoreBadge: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
});
