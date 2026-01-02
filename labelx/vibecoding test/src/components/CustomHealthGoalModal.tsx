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

interface CustomHealthGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (goal: string) => void;
  existingGoals: string[];
}

export default function CustomHealthGoalModal({
  visible,
  onClose,
  onAdd,
  existingGoals,
}: CustomHealthGoalModalProps) {
  const [goalText, setGoalText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdd = () => {
    const trimmed = goalText.trim();

    // Validation
    if (trimmed.length < 2) {
      setErrorMessage("健康目標至少需要 2 個字元");
      return;
    }

    if (trimmed.length > 20) {
      setErrorMessage("健康目標不可超過 20 個字元");
      return;
    }

    if (existingGoals.some((g) => g.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage("此健康目標已存在");
      return;
    }

    // Successfully add
    onAdd(trimmed);
    setGoalText("");
    setErrorMessage("");
    onClose();
  };

  const handleClose = () => {
    setGoalText("");
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
              <Ionicons name="fitness" size={32} color="#2CB67D" />
              <Text style={styles.title}>新增自訂健康目標</Text>
            </View>

            {/* Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="leaf-outline" size={20} color="#001858" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="例如：低碳水化合物、無麩質、抗發炎"
                placeholderTextColor="#9CA3AF"
                value={goalText}
                onChangeText={(text) => {
                  setGoalText(text);
                  setErrorMessage("");
                }}
                autoFocus
                maxLength={20}
              />
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color="#2CB67D" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Hint */}
            <Text style={styles.hint}>輸入您的個人健康飲食偏好或目標</Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Pressable style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>取消</Text>
              </Pressable>
              <Pressable
                style={[styles.addButton, !goalText.trim() && styles.addButtonDisabled]}
                onPress={handleAdd}
                disabled={!goalText.trim()}
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
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#059669",
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
    backgroundColor: "#2CB67D",
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
