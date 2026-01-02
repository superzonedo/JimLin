import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface UpdateModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
  latestVersion: string;
  currentVersion: string;
  releaseNotes: string;
  isForceUpdate?: boolean;
  isUpdating?: boolean;
}

export default function UpdateModal({
  visible,
  onClose,
  onUpdate,
  latestVersion,
  currentVersion,
  releaseNotes,
  isForceUpdate = false,
  isUpdating = false,
}: UpdateModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={isForceUpdate ? undefined : onClose}
    >
      <BlurView intensity={20} style={styles.backdrop}>
        <Pressable
          style={styles.backdrop}
          onPress={isForceUpdate ? undefined : onClose}
          disabled={isUpdating}
        >
          <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-3xl overflow-hidden" style={styles.modal}>
              {/* Header with Gradient */}
              <LinearGradient
                colors={["#2CB67D", "#249C6A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
              >
                <View className="items-center">
                  <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-3">
                    <Ionicons name="arrow-up-circle" size={36} color="white" />
                  </View>
                  <Text className="text-white text-2xl font-bold mb-1">
                    {isForceUpdate ? "需要更新" : "發現新版本"}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-white/80 text-base">
                      {currentVersion} → {latestVersion}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Release Notes */}
              <ScrollView
                className="px-6 py-5"
                style={{ maxHeight: 300 }}
                showsVerticalScrollIndicator={false}
              >
                <Text className="text-base text-gray-800 leading-6 whitespace-pre-line">
                  {releaseNotes}
                </Text>
              </ScrollView>

              {/* Force Update Warning */}
              {isForceUpdate && (
                <View className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-2xl p-4">
                  <View className="flex-row items-center">
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <Text className="text-red-700 font-medium ml-2 flex-1">
                      此版本為必要更新，請立即更新以繼續使用
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View className="px-6 pb-6">
                <Pressable
                  onPress={onUpdate}
                  disabled={isUpdating}
                  className="bg-[#2CB67D] rounded-2xl overflow-hidden mb-3"
                  style={({ pressed }) => [
                    styles.updateButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <LinearGradient
                    colors={["#2CB67D", "#249C6A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    {isUpdating ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={20} color="white" />
                        <Text className="text-white font-semibold text-base ml-2">
                          立即更新
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                {!isForceUpdate && (
                  <Pressable
                    onPress={onClose}
                    disabled={isUpdating}
                    className="bg-gray-100 rounded-2xl py-4 items-center"
                    style={({ pressed }) => [pressed && styles.buttonPressed]}
                  >
                    <Text className="text-gray-700 font-medium text-base">稍後提醒</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    maxWidth: 400,
  },
  modal: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  updateButton: {
    shadowColor: "#2CB67D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
