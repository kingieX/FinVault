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
import { getBudgetById, deleteBudget } from "@/lib/api"; // Import budget API functions
import { formatCurrency } from "@/lib/format";
import Toast from "react-native-toast-message";
import ProgressBar from "@/components/ProgressBar";
import { AppStackParamList } from "@/types/navigation";
import EditBudgetModal from "@/components/budget/EditBudgetModal";
import UpdateSpentAmountModal from "@/components/budget/TopUpModal";

// Define the type for the budget data
interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  spent_amount: number;
  month: number;
  year: number;
  icon: string;
  color: string;
  description: string;
  tags: string[];
  created_at: string;
}

// Route type for navigation
type BudgetDetailScreenRouteProp = RouteProp<AppStackParamList, "BudgetDetail">;

export default function BudgetDetail() {
  const navigation = useNavigation();
  const route = useRoute<BudgetDetailScreenRouteProp>();
  const { budgetId } = route.params;

  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);

  // Function to fetch the budget data
  const fetchBudget = async () => {
    try {
      setLoading(true);
      const data = await getBudgetById(budgetId);
      setBudget(data);
      //   console.log("Budget data by ID: ", data);
    } catch (err) {
      console.error("Failed to fetch budget:", err);
      navigation.goBack();
      Toast.show({
        type: "error",
        text1: "Budget not found",
        text2: "The requested budget could not be loaded.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [budgetId]);

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this budget?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (budget) {
                await deleteBudget(budget.id);
                Toast.show({
                  type: "success",
                  text1: "Budget deleted",
                });
                navigation.goBack();
              } else {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Budget data is missing.",
                });
              }
            } catch (err) {
              console.error("Failed to delete budget:", err);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Could not delete budget. Try again.",
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

  if (!budget) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="">Budget not found.</Text>
      </View>
    );
  }

  // Calculate progress based on spent_amount vs. limit_amount
  const progress =
    budget.limit_amount > 0 ? budget.spent_amount / budget.limit_amount : 0;

  // Get month name
  const monthName = new Date(budget.year, budget.month - 1).toLocaleString(
    "en-US",
    { month: "long" }
  );

  // logic to determine budget status and message
  let budgetStatusText;
  let budgetStatusColor = "text-green-600"; // Default to green

  if (budget.spent_amount > budget.limit_amount) {
    budgetStatusText = `You've exceeded your budget by ${formatCurrency(budget.spent_amount - budget.limit_amount)}`;
    budgetStatusColor = "text-red-500";
  } else if (budget.spent_amount === budget.limit_amount) {
    budgetStatusText = "You've hit your budget limit";
    budgetStatusColor = "text-yellow-500";
  } else if (budget.spent_amount < budget.limit_amount) {
    budgetStatusText = `${formatCurrency(budget.limit_amount - budget.spent_amount)} remaining`;
  }

  //   console.log(budget.spent_amount);

  // Conditionally change ProgressBar color as well
  const progressBarColor =
    budget.spent_amount > budget.limit_amount ? "bg-red-500" : "bg-primary";

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

      {/* Budget Summary Card */}
      <View className="bg-white p-4 rounded-xl flex-row items-center mb-4 border border-gray-50 shadow-sm">
        <View
          className={`w-28 h-28 rounded-lg items-center justify-center mr-4 ${budget.color}`}
        >
          <Ionicons
            name={(budget.icon || "card-outline") as any}
            size={48}
            color="#fff"
          />
        </View>
        <View className="flex-1 justify-between">
          <Text className="text-xl font-bold mb-1">{budget.category}</Text>
          <Text className="text-sm font-semibold text-gray-500 mb-2">
            {monthName} {budget.year}
          </Text>

          <View className="flex-row justify-between items-center mb-4 mr-4">
            <View className="flex">
              <Text className="">{formatCurrency(budget.limit_amount)}</Text>
              <Text className="text-sm text-gray-500">Limit</Text>
            </View>
            <View className="flex">
              <Text className="">{formatCurrency(budget.spent_amount)}</Text>
              <Text className="text-sm text-gray-500">Spent</Text>
            </View>
          </View>

          <View className="">
            <ProgressBar progress={progress} color={progressBarColor} />
            <Text
              className={`text-base mt-1 font-semibold ${budgetStatusColor}`}
            >
              {budgetStatusText}
            </Text>
          </View>
        </View>
      </View>

      {/* Add Transaction Button */}
      <View className="px-4">
        <Text className="text-xl mb-2 font-semibold">
          How much did you spend?
        </Text>
        <TouchableOpacity
          className="bg-primary py-4 rounded-lg items-center mb-4"
          onPress={() => setUpdateModalVisible(true)}
        >
          <Text className="text-white text-lg font-bold">
            + Update spending
          </Text>
        </TouchableOpacity>
      </View>

      {/* Key Details Grid */}
      <View className="grid grid-rows-2 gap-4 mb-4">
        {/* Detail 1: Description */}
        <View className="bg-white p-4 rounded-xl shadow-sm">
          <Text className="text-sm mb-1">Description</Text>
          <Text className="text-lg font-semibold">
            {budget.description || "N/A"}
          </Text>
        </View>

        {/* Detail 2: Tags */}
        <View className="bg-white p-4 rounded-xl shadow-sm">
          <Text className="text-sm mb-1">Tags</Text>
          <Text className="text-lg font-semibold">
            {budget.tags && budget.tags.length > 0
              ? budget.tags.join(", ")
              : "N/A"}
          </Text>
        </View>

        {/* Detail 3: Created At */}
        <View className="bg-white p-4 rounded-xl shadow-sm">
          <Text className="text-sm mb-1">Created On</Text>
          <Text className="text-lg font-semibold">
            {new Date(budget.created_at).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Detail 4: Budget ID */}
        <View className="bg-white p-4 rounded-xl shadow-sm">
          <Text className="text-sm mb-1">Budget ID</Text>
          <Text className="text-lg font-semibold">
            {budget.id.substring(0, 15)}...
          </Text>
        </View>
      </View>

      {/* Edit Modal */}
      <EditBudgetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchBudget}
        editingBudget={budget}
      />

      {/* Update spending */}
      <UpdateSpentAmountModal
        visible={isUpdateModalVisible}
        onClose={() => setUpdateModalVisible(false)}
        onSuccess={fetchBudget}
        budgetId={budget.id}
      />
    </ScrollView>
  );
}
