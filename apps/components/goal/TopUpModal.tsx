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
import { topUpGoal } from "@/lib/api";

interface TopUpModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goalId: string;
}

export default function TopUpModal({
  visible,
  onClose,
  onSuccess,
  goalId,
}: TopUpModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    const topUpAmount = parseFloat(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid amount",
        text2: "Please enter a positive number.",
      });
      return;
    }

    setLoading(true);
    try {
      await topUpGoal(goalId, topUpAmount);
      onSuccess(); // Refresh the parent screen data
      onClose(); // Close the modal
      Toast.show({
        type: "success",
        text1: "Top up successful!",
        text2: `Successfully added ${topUpAmount} to your goal.`,
      });
    } catch (err) {
      console.error("Top up failed:", err);
      Toast.show({
        type: "error",
        text1: "Top up failed",
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
          <Text className="text-2xl font-bold mb-4">Top Up</Text>
          <Text className="text-base text-gray-600 mb-4">
            Enter the amount you wish to add to this goal.
          </Text>

          <TextInput
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg px-4 py-3 text-lg mb-6"
          />

          <TouchableOpacity
            onPress={handleTopUp}
            disabled={loading}
            className={`py-4 rounded-lg items-center ${
              loading ? "bg-gray-400" : "bg-primary"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-medium text-lg">Add Money</Text>
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
