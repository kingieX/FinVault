import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { updateSpentAmount } from "@/lib/api";

interface UpdateSpentAmountModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budgetId: string;
}

export default function UpdateSpentAmountModal({
  visible,
  onClose,
  onSuccess,
  budgetId,
}: UpdateSpentAmountModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    const spentAmount = parseFloat(amount);
    if (isNaN(spentAmount) || spentAmount <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid amount",
        text2: "Please enter a positive number.",
      });
      return;
    }

    setLoading(true);
    try {
      await updateSpentAmount(budgetId, spentAmount);
      onSuccess(); // Refresh the parent screen data
      onClose(); // Close the modal
      Toast.show({
        type: "success",
        text1: "Update successful!",
        text2: `Successfully added ${spentAmount} to your spent amount.`,
      });
    } catch (err) {
      console.error("Update failed:", err);
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: "Please try again.",
      });
    } finally {
      setLoading(false);
      setAmount(""); // Reset the input field
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white w-full p-6 rounded-lg shadow-xl">
          <Text className="text-2xl font-bold mb-4">Update Spending</Text>
          <Text className="text-base text-gray-600 mb-4">
            Enter the amount you spent.
          </Text>

          <TextInput
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg px-4 py-3 text-lg mb-6"
          />

          <TouchableOpacity
            onPress={handleUpdate}
            disabled={loading}
            className={`py-4 rounded-lg items-center ${
              loading ? "bg-gray-400" : "bg-primary"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-medium text-lg">
                Update Spending
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="mt-3 py-4 rounded-lg items-center border border-gray-300"
          >
            <Text className="text-gray-700 font-medium text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
