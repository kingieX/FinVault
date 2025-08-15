/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import ProgressBar from "@/components/ProgressBar";
import { formatCurrency } from "@/lib/format";
import { getBudgets } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";

import AddBudgetModal from "@/components/AddBudgetModal";

export default function BudgetOverviewScreen() {
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [budgetRemaining, setBudgetRemaining] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  // Fetch budgets from API
  async function fetchBudgets() {
    try {
      const budgets = await getBudgets();
      if (budgets && budgets.length > 0) {
        // Calculate total and remaining
        const total = budgets.reduce(
          (sum: number, b: any) => sum + Number(b.limit_amount || 0),
          0
        );
        const spent = budgets.reduce(
          (sum: number, b: any) => sum + Number(b.spent_amount || 0),
          0
        );
        const remaining = total - spent;

        setBudgetTotal(total);
        setBudgetRemaining(remaining);

        // Map categories from API data
        const mapped = budgets.map((b: any) => ({
          id: b.id,
          name: b.category,
          spent: Number(b.spent_amount || 0),
          limit: Number(b.limit_amount || 0),
          icon: b.icon || "card",
          color: b.color || "bg-primary",
        }));

        setCategories(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4D9351" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      {/* Budget Summary */}
      <View className="bg-gray-50 rounded-xl shadow-sm p-4 mb-6">
        <View className="flex-row justify-between items-center mt-4 mb-4">
          <Text className="text-3xl font-medium">This Month's Budget</Text>
          <TouchableOpacity>
            <Text className="text-primary text-lg font-medium">Edit</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className=" text-xl">Total Budget</Text>
          <Text className="text-2xl font-medium">
            {formatCurrency(budgetTotal)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className=" text-xl">Remaining</Text>
          <Text className="text-2xl font-medium text-primary">
            {formatCurrency(budgetRemaining)}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View className="flex-row mb-6 gap-3">
        <TouchableOpacity
          className="flex-1 flex-row justify-center bg-primary py-4 rounded-lg items-center"
          onPress={() => setModalVisible(true)}
        >
          <View className="mr-2 w-8 h-8 border border-white rounded-full items-center justify-center">
            <Ionicons name="add-outline" size={16} color="#fff" />
          </View>
          <Text className="text-white text-base font-medium">Add Category</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 flex-row justify-center border border-gray-300 py-4 rounded-lg items-center">
          <Ionicons name="shuffle" size={20} color="#000" />
          <Text className="ml-2 text-gray-700 text-base font-medium">
            Auto-Categorize
          </Text>
        </TouchableOpacity>
      </View>

      {/* Spending Categories */}
      <Text className="text-2xl font-medium mb-4">Spending Categories</Text>
      {categories.length === 0 ? (
        <View className=" p-6">
          <Image
            source={require("@/assets/images/budget.png")}
            className="w-48 h-48 mx-auto mb-4"
            resizeMode="contain"
          />
          <Text className="text-center text-xl text-gray-500">
            No budget categories found
          </Text>
        </View>
      ) : (
        categories.map((cat) => {
          const progress = cat.spent / cat.limit;
          return (
            <TouchableOpacity
              key={cat.id}
              className="bg-white p-4 rounded-xl shadow-sm mb-4"
            >
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row justify-start items-center mb-2">
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                    <Ionicons
                      name={(cat.icon || "cash-outline") as any}
                      size={22}
                      color="#4D9351"
                    />
                  </View>
                  <Text className="font-medium text-2xl ml-2">{cat.name}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#000" />
              </View>
              <View className="flex justify-between flex-row items-center px-4 mb-2">
                <Text className="text-gray-900 text-lg">
                  {formatCurrency(cat.spent)} spent
                </Text>
                <Text className="text-gray-400 text-lg">
                  of {formatCurrency(cat.limit)}
                </Text>
              </View>
              <View className="px-4 mb-2">
                <ProgressBar
                  progress={progress}
                  color={progress >= 1 ? "bg-red-500" : "bg-primary"}
                />
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* modal */}
      <AddBudgetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchBudgets} // refresh budget list after adding
      />
    </ScrollView>
  );
}
