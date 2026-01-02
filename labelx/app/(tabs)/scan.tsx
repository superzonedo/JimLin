import { useFoodScanStore } from "@/state/foodScanStore";
import { uploadAndAnalyzeImage } from "@/lib/api/scanService";
import { FoodAnalysisResult } from "@/types/food";
import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScanScreen() {
  const { t, language } = useLanguage();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const isAnalyzing = useFoodScanStore((s) => s.isAnalyzing);
  const setIsAnalyzing = useFoodScanStore((s) => s.setIsAnalyzing);
  const addScanResult = useFoodScanStore((s) => s.addScanResult);
  const setCurrentResult = useFoodScanStore((s) => s.setCurrentResult);

  // Animation values
  const scanLinePosition = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Start scanning animation when analyzing
  useEffect(() => {
    if (isAnalyzing) {
      // Scan line animation
      scanLinePosition.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.linear }),
          withTiming(0, { duration: 2000, easing: Easing.linear })
        ),
        -1,
        false
      );

      // Pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      // Simulate progress
      simulateProgress();
    } else {
      // Reset animations
      scanLinePosition.value = 0;
      pulseScale.value = 1;
      setAnalysisProgress(0);
    }
  }, [isAnalyzing]);

  const simulateProgress = () => {
    const interval = 100; // Update every 100ms
    const totalDuration = 8000; // 8 seconds
    const steps = totalDuration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min((currentStep / steps) * 100, 95); // Cap at 95% until real completion
      setAnalysisProgress(progress);

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    // Clean up on unmount or when analysis stops
    return () => clearInterval(timer);
  };

  // Animated styles
  const scanLineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scanLinePosition.value,
            [0, 1],
            [0, 380] // Height of the guide frame
          ),
        },
      ],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View key={`scan-permission-${language}`} style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={80} color="#9CA3AF" />
        <Text style={styles.permissionTitle}>{t('scan.cameraPermissionRequired')}</Text>
        <Text style={styles.permissionText}>{t('scan.cameraPermissionMessage')}</Text>
        <Pressable
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>{t('scan.grantPermission')}</Text>
        </Pressable>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        exif: false,
      });

      if (photo?.uri) {
        setCapturedImageUri(photo.uri);
        await analyzePhoto(photo.uri);
      }
    } catch (error) {
      setIsAnalyzing(false);
      setCapturedImageUri(null);
      Alert.alert(t('scan.error'), t('scan.photoFailed'));
    }
  };

  const pickImage = async () => {
    if (isAnalyzing) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1.0,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        setIsAnalyzing(true);
        setCapturedImageUri(result.assets[0].uri);
        await analyzePhoto(result.assets[0].uri);
      }
    } catch (error) {
      setIsAnalyzing(false);
      setCapturedImageUri(null);
      Alert.alert("錯誤", "選擇照片失敗，請重試");
    }
  };

  const analyzePhoto = async (uri: string) => {
    try {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      // 模擬進度更新（實際進度由後端處理時間決定）
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 95) return prev; // 保持在 95%，等待實際完成
          return prev + 5;
        });
      }, 500);

      // 調用真實的 API，傳遞當前語言
      const backendResult = await uploadAndAnalyzeImage(uri, (progress) => {
        setAnalysisProgress(progress);
      }, language);

      // 清除進度模擬
      clearInterval(progressInterval);

      // 計算健康分數（基於風險分數）
      const calculateHealthScore = (riskScore: number, maxRiskLevel: string): number => {
        // 風險分數越高，健康分數越低
        const baseScore = 100 - riskScore;
        
        // 根據風險等級調整
        if (maxRiskLevel === 'High') {
          return Math.max(0, baseScore - 20);
        } else if (maxRiskLevel === 'Medium') {
          return Math.max(0, baseScore - 10);
        }
        return Math.min(100, baseScore + 10);
      };

      // 映射風險等級
      const mapRiskLevel = (level: string): 'low' | 'medium' | 'high' => {
        if (level === 'Low' || level === 'low') return 'low';
        if (level === 'Medium' || level === 'medium') return 'medium';
        if (level === 'High' || level === 'high') return 'high';
        return 'medium';
      };

      // 將後端返回的結果轉換為前端格式
      const healthScore = calculateHealthScore(backendResult.riskScore || 0, backendResult.maxRiskLevel || 'Medium');
      
      const frontendResult: any = {
        id: backendResult.documentId || Date.now().toString(),
        timestamp: new Date().toISOString(),
        imageUri: backendResult.imageUrl || backendResult.imageThumbnailUrl || uri,
        healthScore: Math.round(healthScore),
        summary: backendResult.summary || t('scan.analysisComplete'),
        productName: backendResult.productName || backendResult.summary || t('scan.analysisComplete'), // 產品名稱
        recommendation: generateRecommendation(backendResult),
        riskLevel: mapRiskLevel(backendResult.maxRiskLevel || 'Medium'),
        isPurchased: false, // 默認未納入分析，需要用戶點擊「納入健康分析」按鈕後才納入計算
        ingredients: {
          safe: [
            // 有益成分
            ...(backendResult.beneficialIngredients || []).map((ing: any) => ({
              name: ing.name,
              description: ing.description || ing.benefits || '',
              riskLevel: 'safe' as const,
            })),
            // 低風險添加劑也歸類為安全
            ...(backendResult.additives?.filter((a: any) => a.riskLevel === 'Low').map((a: any) => ({
              name: a.name,
              description: a.description || a.potentialHarm || '',
              riskLevel: 'safe' as const,
            })) || []),
            // 中性成分（從完整成分列表中提取）
            ...(backendResult.allIngredients?.filter((ing: any) => ing.category === 'neutral').map((ing: any) => ({
              name: ing.name,
              description: ing.description || '',
              riskLevel: 'safe' as const,
            })) || []),
          ],
          warning: [
            // 所有添加劑（High 和 Medium）
            ...(backendResult.additives?.filter((a: any) => a.riskLevel === 'High' || a.riskLevel === 'Medium').map((a: any) => ({
              name: a.name,
              description: a.description || a.potentialHarm || '',
              riskLevel: a.riskLevel === 'High' ? 'warning' as const : 'moderate' as const,
              category: a.category || '',
              carcinogenicity: a.carcinogenicity || '',
            })) || []),
            // 需關注成分
            ...(backendResult.concerningIngredients?.map((ing: any) => ({
              name: ing.name,
              description: ing.description || ing.concerns || '',
              riskLevel: mapIngredientRisk(ing.riskLevel),
            })) || []),
          ],
        },
        nutritionBenefits: (backendResult.beneficialIngredients || []).map((ing: any) => ({
          name: ing.name,
        })),
        // 保存後端返回的完整數據（用於後續查詢）
        backendData: backendResult,
      };

      // 完成進度到 100%
      setAnalysisProgress(100);

      // 設置結果
      setCurrentResult(frontendResult);
      addScanResult(frontendResult);

      // 導航到結果頁面
      setTimeout(() => {
        setIsAnalyzing(false);
        setCapturedImageUri(null);
        router.push("/result");
      }, 500);
    } catch (error: any) {
      setIsAnalyzing(false);
      setCapturedImageUri(null);
      setAnalysisProgress(0);
      console.error('分析錯誤:', error);
      Alert.alert(
        "分析失敗",
        error.message || "無法分析此圖片，請確保照片清晰且包含食品標籤"
      );
    }
  };

  // 生成建議
  const generateRecommendation = (result: any): string => {
    const riskLevel = result.maxRiskLevel || 'Medium';
    const hasHighRisk = result.additives?.some((a: any) => a.riskLevel === 'High') || false;
    
    if (riskLevel === 'High' || hasHighRisk) {
      return '此產品含有高風險成分，建議謹慎攝取或選擇替代品。';
    } else if (riskLevel === 'Medium') {
      return '建議適量攝取，注意均衡飲食，搭配新鮮蔬果。';
    } else {
      return '這是一個相對健康的食品選擇，可以適量攝取。';
    }
  };

  // 映射成分風險等級
  const mapIngredientRisk = (level?: string): 'low' | 'medium' | 'high' | 'warning' => {
    if (level === 'Low' || level === 'low') return 'low';
    if (level === 'Medium' || level === 'medium') return 'medium';
    if (level === 'High' || level === 'high') return 'warning';
    return 'low';
  };

  const cancelAnalysis = () => {
    setIsAnalyzing(false);
    setCapturedImageUri(null);
    setAnalysisProgress(0);
  };

  return (
    <View key={`scan-${language}`} style={styles.container}>
      {/* Show camera preview only when not analyzing */}
      {!isAnalyzing && (
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
        >
          {/* Top Bar */}
          <View
            style={{ paddingTop: insets.top }}
            className="absolute top-0 left-0 right-0 z-10"
          >
            <View className="flex-row items-center justify-between px-6 py-4">
              <View style={{ width: 48 }} />
              <Text className="text-white text-lg font-semibold">{t('scan.scanLabel')}</Text>
              <Pressable
                onPress={toggleCameraFacing}
                className="bg-black/50 p-3 rounded-full"
              >
                <Ionicons name="camera-reverse-outline" size={24} color="white" />
              </Pressable>
            </View>
          </View>

          {/* Guide Frame */}
          <View className="flex-1 items-center justify-center">
            <View className="border-2 border-white/60 rounded-3xl w-80 h-96">
              <View className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-[#2CB67D] rounded-tl-3xl" />
              <View className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-[#2CB67D] rounded-tr-3xl" />
              <View className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-[#2CB67D] rounded-bl-3xl" />
              <View className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-[#2CB67D] rounded-br-3xl" />
            </View>
            <Text className="text-white text-center mt-6 text-base px-6">
              將食品標籤對準框內
            </Text>
          </View>

          {/* Bottom Controls */}
          <View
            style={{ paddingBottom: insets.bottom + 40 }}
            className="absolute bottom-0 left-0 right-0 z-10"
          >
            <View className="flex-row items-center justify-center px-6 py-6">
              {/* Gallery Button */}
              <Pressable
                onPress={pickImage}
                className="bg-black/50 p-4 rounded-full"
                style={{ position: 'absolute', left: 40 }}
              >
                <Ionicons name="images-outline" size={28} color="white" />
              </Pressable>

              {/* Capture Button */}
              <Pressable
                onPress={takePicture}
                className="bg-white w-20 h-20 rounded-full items-center justify-center"
                style={styles.captureButton}
              >
                <View className="bg-white w-16 h-16 rounded-full border-4 border-gray-800" />
              </Pressable>
            </View>
          </View>
        </CameraView>
      )}

      {/* Analysis Overlay - Shows when analyzing with captured image */}
      {isAnalyzing && capturedImageUri && (
        <View style={styles.analysisContainer}>
          {/* Captured Image Background */}
          <Image
            source={{ uri: capturedImageUri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            blurRadius={10}
          />
          
          {/* Dark Overlay */}
          <View style={[StyleSheet.absoluteFillObject, styles.darkOverlay]} />

          {/* Top Bar */}
          <View
            style={{ paddingTop: insets.top }}
            className="absolute top-0 left-0 right-0 z-10"
          >
            <View className="flex-row items-center justify-between px-6 py-4">
              <Pressable
                onPress={cancelAnalysis}
                className="bg-black/50 p-3 rounded-full"
              >
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
              <Text className="text-white text-lg font-semibold">AI 分析中</Text>
              <View style={{ width: 48 }} />
            </View>
          </View>

          {/* Analysis Content */}
          <View className="flex-1 items-center justify-center px-6">
            {/* Captured Image Preview with Animation */}
            <Animated.View style={[pulseStyle, { marginBottom: 40 }]}>
              <View className="border-4 border-[#2CB67D] rounded-3xl overflow-hidden">
                <Image
                  source={{ uri: capturedImageUri }}
                  style={{ width: 280, height: 350 }}
                  resizeMode="cover"
                />
                
                {/* Animated Scan Line */}
                <Animated.View
                  style={[
                    scanLineStyle,
                    styles.scanLine,
                  ]}
                />
              </View>
            </Animated.View>

            {/* Progress Bar */}
            <View className="w-full max-w-xs mb-6">
              <View className="bg-gray-700 h-2 rounded-full overflow-hidden">
                <Animated.View
                  style={{
                    width: `${analysisProgress}%`,
                    height: '100%',
                    backgroundColor: '#2CB67D',
                  }}
                />
              </View>
              <Text className="text-white text-center text-sm mt-2">
                {Math.round(analysisProgress)}% 完成
              </Text>
            </View>

            {/* Status Messages */}
            <View className="items-center">
              <View className="flex-row items-center mb-3">
                <Animated.View style={pulseStyle}>
                  <Ionicons name="sparkles" size={24} color="#2CB67D" />
                </Animated.View>
                <Text className="text-white text-xl font-bold ml-2">AI 分析中...</Text>
              </View>
              
              <Text className="text-white/80 text-base text-center mb-2">
                正在識別成分和添加物
              </Text>
              
              <View className="flex-row items-center mt-4">
                <Ionicons name="time-outline" size={18} color="#9CA3AF" />
                <Text className="text-gray-400 text-sm ml-2">約需 5-10 秒</Text>
              </View>
            </View>

            {/* Cancel Button */}
            <Pressable
              onPress={cancelAnalysis}
              className="mt-12 bg-red-500/20 border border-red-500 px-8 py-3 rounded-full"
            >
              <Text className="text-red-400 font-semibold">取消分析</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#2CB67D',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
    marginTop: 32,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  captureButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  analysisContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  darkOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#2CB67D',
    shadowColor: '#2CB67D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});
