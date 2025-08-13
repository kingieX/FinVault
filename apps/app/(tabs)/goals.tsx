import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getGoals } from "@/lib/api";
import ProgressBar from "@/components/ProgressBar";
import { formatCurrency } from "@/lib/format";
import GoalModal from "@/components/GoalModal";

export default function GoalsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchGoals = async () => {
    try {
      const data = await getGoals();
      setGoals(data || []);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4D9351" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      {/* Add Goal Button */}
      <TouchableOpacity
        className="flex-1 flex-row justify-center bg-primary py-4 rounded-lg items-center mb-6"
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="gift-outline" size={20} color="#fff" />
        <Text className="ml-2 text-white text-base font-medium">
          Add New Goal
        </Text>
      </TouchableOpacity>

      {/* Goals List */}
      <Text className="text-2xl font-medium mb-4">My Active Goals</Text>
      {goals.length === 0 ? (
        <View className="p-6">
          <Image
            source={require("@/assets/images/goals.png")}
            className="w-48 h-48 mx-auto mb-4"
            resizeMode="contain"
          />
          <Text className="text-center text-xl text-gray-500">
            No active goals found
          </Text>
        </View>
      ) : (
        goals.map((goal) => {
          const progress = goal.saved_amount / goal.target_amount;
          return (
            <TouchableOpacity
              key={goal.id}
              className="bg-white p-8 rounded-xl shadow-sm mb-4"
            >
              <View className="flex-row justify-center items-center mb-2">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                  <Ionicons
                    name={(goal.icon || "cash-outline") as any}
                    size={22}
                    color="#4D9351"
                  />
                </View>
                <Text className="ml-2 text-2xl font-medium">{goal.name}</Text>
              </View>
              <View className="px-4">
                <Text className="text-2xl font-bold">
                  {formatCurrency(goal.saved_amount)}{" "}
                  <Text className="text-gray-500 text-xl font-normal">
                    / {formatCurrency(goal.target_amount)}
                  </Text>
                </Text>
                <ProgressBar progress={progress} color="bg-primary" />
              </View>
              <Text className="text-center text-gray-500 mt-4 text-lg">
                Estimated:{" "}
                {goal.deadline
                  ? new Date(goal.deadline).toLocaleDateString()
                  : "N/A"}
              </Text>
            </TouchableOpacity>
          );
        })
      )}

      {/* Milestones */}
      <View className="mt-4 py-4 mb-4">
        <Text className="text-2xl font-medium mb-2">
          Celebrate Your Milestones!
        </Text>
        <View className="bg-white p-4 rounded-xl shadow-sm mt-2">
          <Image
            source={require("@/assets/images/achievement.png")}
            className="w-48 h-48 mx-auto mb-4"
            resizeMode="contain"
          />
          <Text className="text-gray-500 text-center text-lg mb-4">
            You’re consistently hitting your savings targets! Keep up the
            amazing work on your financial journey.
          </Text>
          <TouchableOpacity className="bg-primary py-4 rounded-lg items-center">
            <Text className="text-white text-base font-medium">
              View Achievements
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Goal Creation Modal */}
      <GoalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchGoals}
      />
    </ScrollView>
  );
}
