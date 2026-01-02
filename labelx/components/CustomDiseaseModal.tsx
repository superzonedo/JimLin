import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomDiseaseModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (disease: string) => void;
  existingDiseases: string[];
}

export default function CustomDiseaseModal({
  visible,
  onClose,
  onAdd,
  existingDiseases,
}: CustomDiseaseModalProps) {
  const [diseaseText, setDiseaseText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdd = () => {
    const trimmed = diseaseText.trim();

    // 驗證
    if (trimmed.length < 2) {
      setErrorMessage("疾病名稱至少需要 2 個字元");
      return;
    }

    if (existingDiseases.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage("此疾病已存在");
      return;
    }

    // 成功添加
    onAdd(trimmed);
    setDiseaseText("");
    setErrorMessage("");
    onClose();
  };

  const handleClose = () => {
    setDiseaseText("");
    setErrorMessage("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="medical" size={32} color="#EF4444" />
              <Text style={styles.title}>新增自訂疾病</Text>
            </View>

            {/* Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="heart-outline" size={20} color="#001858" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="例如：痛風、甲狀腺疾病、乳糖不耐"
                placeholderTextColor="#9CA3AF"
                value={diseaseText}
                onChangeText={(text) => {
                  setDiseaseText(text);
                  setErrorMessage("");
                }}
                autoFocus
                maxLength={30}
              />
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Hint */}
            <Text style={styles.hint}>輸入您需要注意的健康狀況或疾病名稱</Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Pressable style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>取消</Text>
              </Pressable>
              <Pressable
                style={[styles.addButton, !diseaseText.trim() && styles.addButtonDisabled]}
                onPress={handleAdd}
                disabled={!diseaseText.trim()}
              >
                <Text style={styles.addButtonText}>新增</Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  keyboardView: {
    width: "100%",
    maxWidth: 340,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001858",
    marginTop: 12,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#001858",
    paddingVertical: 12,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginLeft: 8,
    flex: 1,
  },
  hint: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  addButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});



