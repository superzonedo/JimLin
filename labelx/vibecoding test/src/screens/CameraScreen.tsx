import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, StyleSheet, Image, Modal, Platform } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { analyzeFoodLabel } from "../api/food-analysis";
import { useFoodScanStore } from "../state/foodScanStore";
import { useUserStore } from "../state/userStore";
import { useLanguage } from "../i18n";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";

type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Result: undefined;
  History: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [cameraReady, setCameraReady] = useState(true); // Start as ready
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();

  const isAnalyzing = useFoodScanStore((s) => s.isAnalyzing);
  const setIsAnalyzing = useFoodScanStore ((s) => s.setIsAnalyzing);
  const addScanResult = useFoodScanStore((s) => s.addScanResult);
  const scanHistory = useFoodScanStore((s) => s.scanHistory);

  const updateDailyStats = useUserStore((s) => s.updateDailyStats);
  const updateWeeklyScores = useUserStore((s) => s.updateWeeklyScores);
  const updateStats = useUserStore((s) => s.updateStats);
  const userStats = useUserStore((s) => s.stats);

  // Animation values
  const scanLinePosition = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const cornerRotation = useSharedValue(0);

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

      // Corner rotation
      cornerRotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );

      // Simulate progress
      simulateProgress();
    } else {
      // Reset animations
      scanLinePosition.value = 0;
      pulseScale.value = 1;
      cornerRotation.value = 0;
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

  const cornerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${cornerRotation.value}deg` }],
    };
  });

  if (!permission) {
    console.log("[CameraScreen] Waiting for permission status...");
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4 text-center px-4">Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    console.log("[CameraScreen] Camera permission not granted:", permission);
    return (
      <View className="flex-1 bg-[#FFFFFF] items-center justify-center px-6">
        <Ionicons name="camera-outline" size={80} color="#9CA3AF" />
        <Text className="text-xl font-semibold text-gray-800 mt-6 text-center">
          {t.camera.needPermission}
        </Text>
        <Text className="text-base text-gray-600 mt-2 text-center">
          {t.camera.permissionDesc}
        </Text>
        <Pressable
          onPress={requestPermission}
          className="bg-[#2CB67D] px-8 py-4 rounded-full mt-8"
        >
          <Text className="text-white font-semibold text-base">{t.camera.grantPermission}</Text>
        </Pressable>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const checkScanLimit = (): boolean => {
    // All users now have unlimited scans
    return true;
  };

  const takePicture = async () => {
    console.log("[CameraScreen] takePicture called");
    if (!cameraRef.current || isAnalyzing) {
      console.log("[CameraScreen] Early return - cameraRef:", !!cameraRef.current, "isAnalyzing:", isAnalyzing);
      return;
    }

    // Check scan limit before taking picture
    if (!checkScanLimit()) {
      console.log("[CameraScreen] Scan limit check failed");
      return;
    }

    try {
      console.log("[CameraScreen] Starting to capture photo...");
      setIsAnalyzing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        exif: false,
      });

      console.log("[CameraScreen] Photo captured:", photo?.uri);
      if (photo?.uri) {
        setCapturedImageUri(photo.uri);
        await analyzePhoto(photo.uri);
      }
    } catch (error) {
      console.error("[CameraScreen] Error taking picture:", error);
      setIsAnalyzing(false);
      setCapturedImageUri(null);
      Alert.alert("Error", t.camera.errorPhoto);
    }
  };

  const pickImage = async () => {
    if (isAnalyzing) return;

    // Check scan limit before picking image
    if (!checkScanLimit()) return;

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
      Alert.alert("Error", t.camera.errorPickPhoto);
    }
  };

  const analyzePhoto = async (uri: string) => {
    try {
      console.log("[CameraScreen] Starting to analyze photo:", uri);
      const result = await analyzeFoodLabel(uri);

      console.log("[CameraScreen] Analysis completed successfully");
      // Complete progress to 100%
      setAnalysisProgress(100);

      // Add scan result to history
      addScanResult(result);

      // All users can scan freely
      // Small delay to show 100% completion, then navigate directly
      setTimeout(() => {
        console.log("[CameraScreen] Navigating to Result screen");
        setIsAnalyzing(false);
        setCapturedImageUri(null);
        navigation.navigate("Result");
      }, 500);
    } catch (error) {
      console.error("[CameraScreen] Analysis error:", error);
      setIsAnalyzing(false);
      setCapturedImageUri(null);
      Alert.alert("Analysis Failed", t.camera.errorAnalysis);
    }
  };

  const cancelAnalysis = () => {
    setIsAnalyzing(false);
    setCapturedImageUri(null);
    setAnalysisProgress(0);
  };

  // Fallback for when camera preview is not available
  const showCameraFallback = Platform.OS === 'web';

  if (showCameraFallback && !isAnalyzing) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <View style={{ paddingTop: insets.top }} className="absolute top-0 left-0 right-0 z-10">
          <View className="flex-row items-center justify-between px-6 py-4">
            <Pressable
              onPress={() => navigation.goBack()}
              className="bg-black/50 p-3 rounded-full"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Text className="text-white text-lg font-semibold">{t.camera.title}</Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

        <Ionicons name="images-outline" size={80} color="#2CB67D" />
        <Text className="text-white text-xl font-semibold mt-6 text-center">
          {t.camera.selectFoodPhoto || "選擇食品照片"}
        </Text>
        <Text className="text-white/70 text-base mt-2 text-center">
          {t.camera.selectFromGallery || "請從相冊選擇要分析的食品照片"}
        </Text>
        <Pressable
          onPress={pickImage}
          className="bg-[#2CB67D] px-8 py-4 rounded-full mt-8"
        >
          <Text className="text-white font-semibold text-base">{t.camera.openGallery || "打開相冊"}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Show camera preview only when not analyzing */}
      {!isAnalyzing && (
        <View className="flex-1">
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={facing}
            onCameraReady={() => {
              console.log("[CameraScreen] onCameraReady callback fired");
              setCameraReady(true);
            }}
            onMountError={(error) => {
              console.error("[CameraScreen] Camera mount error:", error);
            }}
          >
            {/* Top Bar */}
            <View
              style={{ paddingTop: insets.top }}
              className="absolute top-0 left-0 right-0 z-10"
            >
              <View className="flex-row items-center justify-between px-6 py-4">
                <Pressable
                  onPress={() => navigation.goBack()}
                  className="bg-black/50 p-3 rounded-full"
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>
                <Text className="text-white text-lg font-semibold">{t.camera.title}</Text>
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
                {t.camera.alignLabel}
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
        </View>
      )}

      {/* Analysis Overlay - Shows when analyzing with captured image */}
      {isAnalyzing && capturedImageUri && (
        <View className="flex-1 bg-black">
          {/* Captured Image Background */}
          <Image
            source={{ uri: capturedImageUri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            blurRadius={10}
          />
          
          {/* Dark Overlay */}
          <View style={StyleSheet.absoluteFillObject} className="bg-black/60" />

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
              <Text className="text-white text-lg font-semibold">{t.camera.aiAnalyzing}</Text>
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
                    {
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
                  ]}
                />

                {/* Animated Corners */}
                <Animated.View
                  style={[
                    cornerStyle,
                    {
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      width: 40,
                      height: 40,
                      borderLeftWidth: 4,
                      borderTopWidth: 4,
                      borderColor: '#2CB67D',
                      borderTopLeftRadius: 24,
                    },
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
                {Math.round(analysisProgress)}% Complete
              </Text>
            </View>

            {/* Status Messages */}
            <View className="items-center">
              <View className="flex-row items-center mb-3">
                <Animated.View style={pulseStyle}>
                  <Ionicons name="sparkles" size={24} color="#2CB67D" />
                </Animated.View>
                <Text className="text-white text-xl font-bold ml-2">{t.camera.recognizing}</Text>
              </View>

              <Text className="text-white/80 text-base text-center mb-2">
                {t.camera.recognizing}
              </Text>

              <View className="flex-row items-center mt-4">
                <Ionicons name="time-outline" size={18} color="#9CA3AF" />
                <Text className="text-gray-400 text-sm ml-2">{t.camera.estimatedTime}</Text>
              </View>
            </View>

            {/* Cancel Button */}
            <Pressable
              onPress={cancelAnalysis}
              className="mt-12 bg-red-500/20 border border-red-500 px-8 py-3 rounded-full"
            >
              <Text className="text-red-400 font-semibold">{t.camera.cancelAnalysis}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  captureButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
