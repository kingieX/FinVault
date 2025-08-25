import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { updateGoal } from "@/lib/api";

interface EditGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingGoal: any;
}

const categoryOptions = [
  { label: "Housing", value: "housing" },
  { label: "Transportation", value: "transportation" },
  { label: "Savings", value: "savings" },
  { label: "Vacation", value: "vacation" },
  { label: "Education", value: "education" },
  { label: "Health", value: "health" },
  { label: "Other", value: "other" },
];

const iconOptions = [
  "home-outline",
  "car-outline",
  "cash-outline",
  "airplane-outline",
  "heart-outline",
  "school-outline",
  "briefcase-outline",
  "gift-outline",
];

export default function EditGoalModal({
  visible,
  onClose,
  onSuccess,
  editingGoal,
}: EditGoalModalProps) {
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState<string>("");
  const [icon, setIcon] = useState("cash-outline");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setGoalName(editingGoal.name);
      setTargetAmount(String(editingGoal.target_amount));
      setSavedAmount(String(editingGoal.saved_amount));
      setDeadline(editingGoal.deadline.split("T")[0]);
      setCategory(editingGoal.category || "");
      setIcon(editingGoal.icon || "cash-outline");
    }
  }, [editingGoal]);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split("T")[0];
      setDeadline(formatted);
    }
  };

  const handleUpdate = async () => {
    if (!goalName || !targetAmount || !deadline) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill in all required fields",
      });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: goalName,
        target_amount: Number(targetAmount),
        saved_amount: Number(savedAmount),
        deadline,
        category: category || undefined,
        icon: icon || undefined,
      };

      await updateGoal(editingGoal.id, payload);

      onSuccess();
      onClose();

      Toast.show({
        type: "success",
        text1: "Goal updated",
        text2: "Goal updated successfully",
      });
    } catch (err) {
      console.error("Error updating goal:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not update goal",
      });
    } finally {
      setLoading(false);
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
        <View className="bg-white w-full p-6 rounded-lg max-h-[90%]">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-medium mb-4">Edit Goal</Text>

            {/* Goal name input */}
            <Text className="text-xl font-medium mb-1">Goal name</Text>
            <TextInput
              placeholder="e.g., New Car, Dream Vacation"
              value={goalName}
              onChangeText={setGoalName}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            />

            {/* Target Amount input */}
            <Text className="text-xl font-medium mb-1">Target Amount</Text>
            <TextInput
              placeholder="e.g., 500000"
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            />

            {/* Saved Amount input */}
            <Text className="text-xl font-medium mb-1">Saved Amount</Text>
            <TextInput
              placeholder="e.g., 50000"
              value={savedAmount}
              onChangeText={setSavedAmount}
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            />

            {/* Deadline input with date picker */}
            <Text className="text-xl font-medium mb-1">Deadline</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4 flex-row justify-between items-center"
            >
              <Text className="text-gray-500">
                {deadline
                  ? new Date(deadline).toLocaleDateString()
                  : "Select Date"}
              </Text>
              <Ionicons name="calendar-outline" size={24} color="#888" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(deadline || Date.now())}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            {/* Category Selector (using the same mini-modal as AddGoalModal) */}
            <Text className="mb-1 text-xl">Category</Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4 flex-row justify-between items-center"
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text className={category ? "text-black" : "text-gray-400"}>
                {category
                  ? categoryOptions.find((c) => c.value === category)?.label
                  : "Select category"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#6b7280" />
            </TouchableOpacity>

            {/* Icon Selector (using the same horizontal scroll view as AddGoalModal) */}
            <Text className="mb-1 text-xl">Icon</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {iconOptions.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  className={`p-3 mr-3 rounded-full ${icon === ic ? "bg-primary" : "bg-gray-100"}`}
                  onPress={() => setIcon(ic)}
                >
                  <Ionicons
                    name={ic as any}
                    size={22}
                    color={icon === ic ? "#fff" : "#4D9351"}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              className={`py-4 rounded-lg items-center ${
                loading ? "bg-gray-400" : "bg-primary"
              }`}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text className="text-white font-medium">
                {loading ? "Updating goal..." : "Update Goal"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-3 py-4 rounded-lg items-center border border-gray-300"
              onPress={onClose}
            >
              <Text className="text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Mini-modal for Category Picker (copied from AddGoalModal) */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl p-4">
            <Text className="text-lg font-medium mb-2">Select Category</Text>
            <Picker
              selectedValue={category}
              onValueChange={(val) => setCategory(val)}
            >
              <Picker.Item label="Select category" value="" />
              {categoryOptions.map((opt) => (
                <Picker.Item
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                  color="#4D9351"
                />
              ))}
            </Picker>
            <TouchableOpacity
              className="bg-primary py-3 rounded-lg items-center mt-2"
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text className="text-white font-medium">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
