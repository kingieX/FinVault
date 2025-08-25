/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getGoalById, deleteGoal } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import EditGoalModal from "@/components/goal/EditGoalModal";
import Toast from "react-native-toast-message";
import { AppStackParamList } from "@/types/navigation";
import ProgressBar from "@/components/ProgressBar";
import TopUpModal from "@/components/goal/TopUpModal";

// Utility function to calculate remaining days
const getDaysRemaining = (deadline: string) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffInTime = deadlineDate.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
  return diffInDays > 0 ? diffInDays : 0;
};

// New utility function to calculate total days and elapsed days
const getProgressByTime = (createdAt: string, deadline: string) => {
  const now = new Date();
  const createdDate = new Date(createdAt);
  const deadlineDate = new Date(deadline);

  // Total duration of the goal in milliseconds
  const totalDurationMs = deadlineDate.getTime() - createdDate.getTime();

  // If the total duration is zero or negative (already passed), progress is 100%
  if (totalDurationMs <= 0) {
    return 1;
  }

  // Elapsed time in milliseconds
  const elapsedTimeMs = now.getTime() - createdDate.getTime();

  // Calculate progress ratio (elapsed / total)
  let progress = elapsedTimeMs / totalDurationMs;

  // Clamp progress between 0 and 1
  return Math.max(0, Math.min(progress, 1));
};

type GoalDetailScreenRouteProp = RouteProp<AppStackParamList, "GoalDetail">;

export default function GoalDetail() {
  const navigation = useNavigation();
  const route = useRoute<GoalDetailScreenRouteProp>();
  const { goalId } = route.params;

  const [goal, setGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isTopUpModalVisible, setIsTopUpModalVisible] = useState(false);

  const fetchGoal = async () => {
    try {
      setLoading(true);
      const data = await getGoalById(goalId);
      setGoal(data);
    } catch (err) {
      console.error("Failed to fetch goal:", err);
      navigation.goBack();
      Toast.show({
        type: "error",
        text1: "Goal not found",
        text2: "The requested goal could not be loaded.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, [goalId]);

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this goal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoal(goal.id);
              Toast.show({
                type: "success",
                text1: "Goal deleted",
              });
              navigation.goBack();
            } catch (err) {
              console.error("Failed to delete goal:", err);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Could not delete goal. Try again.",
              });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4D9351" />
      </View>
    );
  }

  if (!goal) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="">Goal not found.</Text>
      </View>
    );
  }

  const timeProgress = getProgressByTime(goal.created_at, goal.deadline);
  const daysRemaining = getDaysRemaining(goal.deadline);

  return (
    <ScrollView className="flex-1 bg-gray-50 px-6 py-4">
      {/* Top Navigation */}
      <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="chevron-back-outline" size={28} color="#000" />
        </TouchableOpacity>
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="p-2"
          >
            <Ionicons name="create-outline" size={28} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} className="p-2 ml-4">
            <Ionicons name="trash-outline" size={28} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Goal Summary Card */}
      <View className="bg-white p-4 rounded-xl flex-row items-center mb-4 border border-gray-50 shadow-sm">
        <View className="bg-gray-100 w-28 h-28 rounded-lg items-center justify-center mr-4">
          <Ionicons
            name={(goal.icon || "cash-outline") as any}
            size={48}
            color="#4D9351"
          />
        </View>
        <View className="flex-1 justify-between">
          <Text className="text-xl font-bold mb-1">{goal.name}</Text>
          <View className="flex-row justify-between items-center mb-4 mr-4">
            <View className="flex">
              <Text className="">{formatCurrency(goal.target_amount)}</Text>
              <Text className="text-sm text-gray-500">Target</Text>
            </View>
            <View className="flex">
              <Text className="">{formatCurrency(goal.saved_amount)}</Text>
              <Text className="text-sm text-gray-500">Saved</Text>
            </View>
          </View>
          <View className="">
            <ProgressBar progress={timeProgress} color="bg-primary" />
            <Text className="text-base mt-1 font-semibold">
              {daysRemaining} days left
            </Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        className="bg-primary py-4 rounded-lg items-center mb-4"
        onPress={() => setIsTopUpModalVisible(true)}
      >
        <Text className="text-white text-lg font-bold">+ Top Up</Text>
      </TouchableOpacity>

      {/* Key Details Grid */}
      <View className="grid grid-rows-2 gap-4 mb-4">
        {/* Detail 1: Initial Deposit */}
        <View className="bg-white p-4 rounded-xl shadow-sm">
          <Text className="text-sm mb-1">Initial Deposit (Amount saved)</Text>
          <Text className="text-lg font-semibold">
            {formatCurrency(goal.saved_amount)}
          </Text>
        </View>
        {/* Detail 2: amount remaining*/}
        <View className="bg-white p-4 rounded-xl shadow-sm">
          <Text className="text-sm mb-1">Amount remaining</Text>
          <Text className="text-lg font-semibold">
            {formatCurrency(goal.target_amount - goal.saved_amount)}
          </Text>
        </View>
        {/* Detail 3: Start Date */}
        <View className="bg-white p-4 rounded-xl shadow-sm">
          <Text className="text-sm mb-1">Start Date</Text>
          <View className="flex-row gap-2 items-center">
            <Text className=" text-lg font-semibold">
              {new Date(goal.created_at).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
            <Text className=" text-lg font-semibold">
              {new Date(goal.created_at).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true, // Use AM/PM format
              })}
            </Text>
          </View>
        </View>
        {/* Detail 4: Payback Date */}
        <View className="bg-white p-4 rounded-xl shadow-sm">
          <Text className="text-sm mb-1">Deadline</Text>
          <Text className="text-lg font-semibold">
            {new Date(goal.deadline).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Detail 6: Goal ID */}
        <View className="bg-white p-4 rounded-xl shadow-sm">
          <Text className="text-sm mb-1">Goal ID</Text>
          <Text className="text-lg font-semibold">
            {goal.id.substring(0, 15)}...
          </Text>
        </View>
      </View>

      {/* Edit Modal */}
      <EditGoalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchGoal}
        editingGoal={goal}
      />

      {/* top up */}
      <TopUpModal
        visible={isTopUpModalVisible}
        onClose={() => setIsTopUpModalVisible(false)}
        onSuccess={fetchGoal} // Refresh the screen after a successful top-up
        goalId={goal.id}
      />
    </ScrollView>
  );
}
