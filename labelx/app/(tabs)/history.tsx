import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import { Dimensions, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View, ScrollView } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFoodScanStore } from "../../state/foodScanStore";
import { FoodAnalysisResult } from "../../types/food";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DELETE_BUTTON_WIDTH = 80;

// Simple date formatter to replace date-fns
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// Simplified ScanImage component for mock data
function ScanImage({ imageUri, style }: { imageUri: string; style: any }) {
  return (
    <Image 
      source={{ uri: imageUri }} 
      style={style} 
      resizeMode="cover"
    />
  );
}

// Swipeable Item Component
function SwipeableItem({
  item,
  onPress,
  onLongPress,
  onDelete,
  getScoreColor,
  isSelected,
  isSelectionMode,
  t,
  theme,
  colorScheme,
}: {
  item: FoodAnalysisResult;
  onPress: (item: FoodAnalysisResult) => void;
  onLongPress: (item: FoodAnalysisResult) => void;
  onDelete: (id: string) => void;
  getScoreColor: (score: number) => string;
  isSelected: boolean;
  isSelectionMode: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  theme: any;
  colorScheme: 'light' | 'dark';
}) {
  const translateX = useSharedValue(0);
  const dateStr = formatDate(item.timestamp);

  // Close when another item opens or when entering selection mode
  React.useEffect(() => {
    if (isSelectionMode && translateX.value < 0) {
      translateX.value = withSpring(0);
    }
  }, [isSelectionMode]);

  const panGesture = Gesture.Pan()
    .enabled(!isSelectionMode) // Disable swipe when in selection mode
    .onUpdate((e) => {
      // Only allow swiping left (negative translation)
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -DELETE_BUTTON_WIDTH);
      } else if (translateX.value < 0) {
        // Allow swiping back to the right to close
        translateX.value = Math.min(e.translationX + translateX.value, 0);
      }
    })
    .onEnd((e) => {
      const shouldOpen = e.translationX < -DELETE_BUTTON_WIDTH / 2;
      if (shouldOpen) {
        translateX.value = withSpring(-DELETE_BUTTON_WIDTH);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const animatedDeleteStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value < 0 ? 1 : 0,
    };
  });

  const handleDelete = () => {
    translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
      runOnJS(onDelete)(item.id);
    });
  };

  return (
    <View style={styles.swipeableContainer}>
      {/* Delete Button Background */}
      <Animated.View style={[styles.deleteButton, animatedDeleteStyle]}>
        <Pressable onPress={handleDelete} style={styles.deleteButtonPressable}>
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
        </Pressable>
      </Animated.View>

      {/* Main Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedCardStyle}>
          <Pressable
            onPress={() => onPress(item)}
            onLongPress={() => onLongPress(item)}
            style={[
              styles.card,
              { backgroundColor: theme.cardBackground, marginHorizontal: 24, marginBottom: 16, borderRadius: 24, overflow: 'hidden' },
              isSelected && { borderWidth: 2, borderColor: theme.primary },
            ]}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={{ position: "relative" }}>
                <ScanImage 
                  imageUri={item.imageUri} 
                  style={{ width: 112, height: 112 }}
                />
            {isSelectionMode && (
              <View style={styles.selectionIndicatorOverlay}>
                <View style={styles.selectionCircle}>
                  <Ionicons 
                    name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={isSelected ? theme.primary : theme.secondaryText} 
                  />
                </View>
              </View>
            )}
              </View>
              <View style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>
                <View>
                  <Text 
                    style={{ fontSize: 16, fontWeight: '600', color: theme.primaryText, marginBottom: 4 }}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.productName || item.summary || t('history.noSummary')}
                  </Text>
                  <Text style={{ fontSize: 14, color: theme.secondaryText, marginBottom: 8 }}>{dateStr}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View
                    style={[
                      styles.scoreBadge,
                      { backgroundColor: getScoreColor(item.healthScore) + "20", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999 },
                    ]}
                  >
                    <Text
                      style={{ color: getScoreColor(item.healthScore), fontSize: 20, fontWeight: '700' }}
                    >
                      {item.healthScore}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function HistoryScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { filter: initialFilter } = useLocalSearchParams<{ filter?: string }>();
  const { t, language } = useLanguage();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const scanHistory = useFoodScanStore((s) => s.scanHistory);
  const setCurrentResult = useFoodScanStore((s) => s.setCurrentResult);
  const clearAllHistory = useFoodScanStore((s) => s.clearAllHistory);
  const deleteScan = useFoodScanStore((s) => s.deleteScan);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDateType, setCustomDateType] = useState<"month" | "year">("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date());

  // 根據 URL 參數設置篩選類型
  useEffect(() => {
    if (initialFilter === "week") {
      setFilterType("week");
    }
  }, [initialFilter]);

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
    } else if (filterType === "month") {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= monthStart && itemDate <= monthEnd;
      });
    } else if (filterType === "custom") {
      if (customDateType === "month") {
        const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.timestamp);
          return itemDate >= monthStart && itemDate <= monthEnd;
        });
      } else {
        const yearStart = new Date(selectedYear.getFullYear(), 0, 1);
        const yearEnd = new Date(selectedYear.getFullYear(), 11, 31, 23, 59, 59);
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.timestamp);
          return itemDate >= yearStart && itemDate <= yearEnd;
        });
      }
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.productName || item.summary || '').toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.recommendation.toLowerCase().includes(query) ||
        item.ingredients.safe.some(ing => ing.name.toLowerCase().includes(query)) ||
        item.ingredients.warning.some(ing => ing.name.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [scanHistory, searchQuery, filterType, selectedMonth, selectedYear, customDateType]);

  const handleItemPress = (item: FoodAnalysisResult) => {
    if (isSelectionMode) {
      // Toggle selection
      const newSelected = new Set(selectedItems);
      if (newSelected.has(item.id)) {
        newSelected.delete(item.id);
      } else {
        newSelected.add(item.id);
      }
      setSelectedItems(newSelected);
      if (newSelected.size === 0) {
        setIsSelectionMode(false);
      }
    } else {
      // 設置當前結果並導航到結果頁面
      setCurrentResult(item);
      router.push("/result");
    }
  };

  const handleDelete = (id: string) => {
    deleteScan(id);
  };

  const handleItemLongPress = (item: FoodAnalysisResult) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedItems(new Set([item.id]));
    }
  };

  const handleDeleteSelected = () => {
    // UI only - no actual deletion for now
    console.log("Delete selected items:", Array.from(selectedItems));
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  };

  const getScoreColor = (score: number) => {
    if (score >= 71) return "#10B981";
    if (score >= 31) return "#F59E0B";
    return "#EF4444";
  };

  const renderItem = ({ item }: { item: FoodAnalysisResult }) => {
    return (
      <SwipeableItem
        item={item}
        onPress={handleItemPress}
        onLongPress={handleItemLongPress}
        onDelete={handleDelete}
        getScoreColor={getScoreColor}
        isSelected={selectedItems.has(item.id)}
        isSelectionMode={isSelectionMode}
        t={t}
        theme={theme}
        colorScheme={colorScheme}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        style={{ 
          paddingTop: insets.top,
          backgroundColor: theme.headerBackground,
          borderBottomWidth: 1,
          borderBottomColor: theme.headerBorder,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 }}>
          {isSelectionMode ? (
            <>
              <Pressable onPress={handleCancelSelection}>
                <Text style={{ fontSize: 16, color: theme.primary, fontWeight: '600' }}>{t('profile.cancel')}</Text>
              </Pressable>
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText }}>
                {t('history.selectedItems', { count: selectedItems.size })}
              </Text>
              {selectedItems.size > 0 && (
                <Pressable onPress={handleDeleteSelected}>
                  <Ionicons name="trash-outline" size={22} color={theme.error} />
                </Pressable>
              )}
            </>
          ) : (
            <>
              <View style={{ width: 40 }} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText }}>{t('history.title')}</Text>
              <View style={{ width: 40 }} />
            </>
          )}
        </View>

        {/* Search Bar */}
        {scanHistory.length > 0 && (
          <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.gray100, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Ionicons name="search" size={20} color={theme.secondaryText} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('history.searchPlaceholder')}
                placeholderTextColor={theme.secondaryText}
                style={{ flex: 1, marginLeft: 8, fontSize: 16, color: theme.primaryText }}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color={theme.secondaryText} />
                </Pressable>
              )}
            </View>

            {/* Filter Buttons */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['all', 'today', 'week', 'month', 'custom'] as const).map((filter) => (
                  <Pressable
                    key={filter}
                    onPress={() => {
                      if (filter === 'custom') {
                        setFilterType("custom");
                        setShowCustomDatePicker(true);
                      } else {
                        setFilterType(filter);
                      }
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 9999,
                      backgroundColor: filterType === filter ? theme.primary : theme.gray100,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: filterType === filter ? '#FFFFFF' : theme.primaryText,
                      }}
                    >
                      {filter === 'all' && t('history.filterAll')}
                      {filter === 'today' && t('history.filterToday')}
                      {filter === 'week' && t('history.filterWeek')}
                      {filter === 'month' && t('history.filterMonth')}
                      {filter === 'custom' && t('history.filterCustom')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {scanHistory.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="document-text-outline" size={80} color={theme.secondaryText} />
          <Text style={{ fontSize: 20, fontWeight: '600', color: theme.primaryText, marginTop: 24, textAlign: 'center' }}>
            {t('history.noHistory')}
          </Text>
          <Text style={{ fontSize: 16, color: theme.secondaryText, marginTop: 8, textAlign: 'center' }}>
            {t('history.startScanning')}
          </Text>
          <Pressable
            onPress={() => navigation.navigate("Camera" as never)}
            style={{ marginTop: 32, backgroundColor: theme.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 9999 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>{t('history.startScan')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => {
            // Close selection mode when scrolling
            if (isSelectionMode) {
              setIsSelectionMode(false);
              setSelectedItems(new Set());
            }
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}>
              <Ionicons name="search-outline" size={64} color={theme.secondaryText} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText, marginTop: 16, textAlign: 'center' }}>
                {t('history.noMatchingRecords')}
              </Text>
              <Text style={{ fontSize: 16, color: theme.secondaryText, marginTop: 8, textAlign: 'center' }}>
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
                  {t('profile.cancel')}
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
                  {t('history.confirmDelete')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Date Picker Modal */}
      <Modal
        visible={showCustomDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomDatePicker(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-gray-900">
                選擇日期範圍
              </Text>
              <Pressable onPress={() => setShowCustomDatePicker(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Date Type Selector */}
            <View className="flex-row gap-2 mb-6">
              <Pressable
                onPress={() => setCustomDateType("month")}
                className={`flex-1 py-3 rounded-2xl ${
                  customDateType === "month" ? "bg-[#2CB67D]" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    customDateType === "month" ? "text-white" : "text-gray-700"
                  }`}
                >
                  選擇月份
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setCustomDateType("year")}
                className={`flex-1 py-3 rounded-2xl ${
                  customDateType === "year" ? "bg-[#2CB67D]" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    customDateType === "year" ? "text-white" : "text-gray-700"
                  }`}
                >
                  選擇年份
                </Text>
              </Pressable>
            </View>

            {/* Custom Date Picker */}
            <View className="mb-6" style={{ height: 200 }}>
              {customDateType === "month" ? (
                <View className="flex-row">
                  {/* Year Selector */}
                  <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      const isSelected = selectedMonth.getFullYear() === year;
                      return (
                        <Pressable
                          key={year}
                          onPress={() => {
                            const newDate = new Date(selectedMonth);
                            newDate.setFullYear(year);
                            setSelectedMonth(newDate);
                          }}
                          className={`py-3 px-4 rounded-xl mb-1 ${
                            isSelected ? "bg-[#2CB67D]" : "bg-gray-50"
                          }`}
                        >
                          <Text
                            className={`text-center font-semibold ${
                              isSelected ? "text-white" : "text-gray-700"
                            }`}
                          >
                            {year}年
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  {/* Month Selector */}
                  <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      const isSelected = selectedMonth.getMonth() === i;
                      return (
                        <Pressable
                          key={month}
                          onPress={() => {
                            const newDate = new Date(selectedMonth);
                            newDate.setMonth(i);
                            setSelectedMonth(newDate);
                          }}
                          className={`py-3 px-4 rounded-xl mb-1 ${
                            isSelected ? "bg-[#2CB67D]" : "bg-gray-50"
                          }`}
                        >
                          <Text
                            className={`text-center font-semibold ${
                              isSelected ? "text-white" : "text-gray-700"
                            }`}
                          >
                            {month}月
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 20 }, (_, i) => {
                    const year = new Date().getFullYear() - 10 + i;
                    const isSelected = selectedYear.getFullYear() === year;
                    return (
                      <Pressable
                        key={year}
                        onPress={() => {
                          const newDate = new Date(selectedYear);
                          newDate.setFullYear(year);
                          setSelectedYear(newDate);
                        }}
                        className={`py-4 px-4 rounded-xl mb-2 ${
                          isSelected ? "bg-[#2CB67D]" : "bg-gray-50"
                        }`}
                      >
                        <Text
                          className={`text-center font-semibold text-lg ${
                            isSelected ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {year}年
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Selected Date Display */}
            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <Text className="text-sm text-gray-600 mb-1">
                {customDateType === "month" ? "選擇的月份" : "選擇的年份"}
              </Text>
              <Text className="text-lg font-semibold text-gray-900">
                {customDateType === "month"
                  ? `${selectedMonth.getFullYear()}年${(selectedMonth.getMonth() + 1).toString().padStart(2, '0')}月`
                  : `${selectedYear.getFullYear()}年`}
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowCustomDatePicker(false);
                  setFilterType("all");
                }}
                className="flex-1 bg-gray-100 py-3 rounded-2xl"
              >
                <Text className="text-gray-700 font-semibold text-center text-base">
                  取消
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowCustomDatePicker(false);
                }}
                className="flex-1 bg-[#2CB67D] py-3 rounded-2xl"
              >
                <Text className="text-white font-semibold text-center text-base">
                  確認
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
  swipeableContainer: {
    position: "relative",
    overflow: "visible",
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    backgroundColor: "#FFFFFF",
  },
  scoreBadge: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#2CB67D",
  },
  selectionIndicatorOverlay: {
    position: "absolute",
    left: 8,
    top: 8,
    zIndex: 10,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    position: "absolute",
    right: 24,
    top: 0,
    bottom: 16,
    width: DELETE_BUTTON_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    zIndex: -1,
  },
  deleteButtonPressable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});