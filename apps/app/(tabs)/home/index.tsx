import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  // TouchableOpacity,
  RefreshControl,
} from "react-native";
import { getCurrentUser, getAccounts, getInsights } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { Ionicons } from "@expo/vector-icons";
import BalanceCards from "@/components/BalanceCards";

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [insights, setInsights] = useState<any[]>([]);

  // Fetch insights data
  useEffect(() => {
    (async () => {
      fetchData();
    })();
  }, []);

  // Fetch Account data
  async function fetchData(isRefreshing = false) {
    try {
      if (isRefreshing) setRefreshing(true);

      const userData = await getCurrentUser();
      if (userData) setUser(userData);

      const accountsData = await getAccounts();
      setAccounts(accountsData);

      const insightsData = await getInsights(3);
      setInsights(insightsData);
      // console.log("Insights data: ", insightsData);
    } catch (err) {
      console.error("Error loading home data:", err);
    } finally {
      if (isRefreshing) setRefreshing(false);
      else setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4D9351" />
      </View>
    );
  }

  // Greetings based on time of day
  const now = new Date();
  const hours = now.getHours();
  let greeting = "Hello";
  if (hours < 12) greeting = "Good morning";
  else if (hours < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  return (
    <ScrollView
      className="flex-1 bg-white/80"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchData(true)}
          colors={["#4D9351"]}
          tintColor="#4D9351"
        />
      }
    >
      <View className="px-6 pt-6">
        {/* Greeting */}
        <View className="flex-row items-center mb-1">
          <Text className="text-2xl font-semibold text-gray-800">
            {greeting}
          </Text>
          <Text className="text-2xl font-semibold text-primary">
            {user?.name ? `, ${user.name}` : ""}
          </Text>
        </View>
        <Text className="text-gray-500 mb-4">
          Here’s a quick look at your finances!
        </Text>
      </View>

      {/* Balance Cards */}
      <BalanceCards accounts={accounts} onRefresh={() => fetchData(true)} />

      {/* Insights */}
      <View className="bg-white pb-4 px-6">
        <Text className="text-2xl font-semibold mb-2">Insights</Text>
        {insights.length === 0 ? (
          <View className=" p-6">
            <Image
              source={require("@/assets/images/budget.png")}
              className="w-48 h-48 mx-auto mb-4"
              resizeMode="contain"
            />
            <Text className="text-center text-xl text-gray-500">
              No insights available yet
            </Text>
          </View>
        ) : (
          <View className="mt-2">
            {insights.map((i) => (
              <View
                key={i.id}
                className="bg-green-50 p-4 rounded-lg mb-3 border border-green-200"
              >
                <View className="flex flex-row items-center">
                  <View className="w-8 h-8 bg-white rounded-full items-center justify-center">
                    <Ionicons name="analytics" size={24} color="#4D9351" />
                  </View>
                  <Text className="font-medium text-xl ml-2">{i.title}</Text>
                </View>
                <View className="px-2">
                  <Text className="text-gray-700 text-lg">{i.message}</Text>
                  {/* <Text className="text-gray-500 text-sm mt-1">
                    {new Date(i.created_at).toLocaleString()}
                  </Text> */}
                  <View className="flex-row gap-2 items-center mb-1">
                    <Text className="text-gray-500 mt-1 text-sm font-medium">
                      {new Date(i.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1 font-medium">
                      {new Date(i.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true, // Use AM/PM format
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Recent Transactions */}
      <View className="px-6">
        <Text className="text-2xl font-semibold mb-3">Recent Transactions</Text>
        {accounts.flatMap((acc) => acc.recent_transactions).length === 0 ? (
          <View className=" p-6">
            <Image
              source={require("@/assets/images/transfer-money.png")}
              className="w-48 h-48 mx-auto mb-4"
              resizeMode="contain"
            />
            <Text className="text-center text-xl text-gray-500">
              No recent transactions
            </Text>
          </View>
        ) : (
          accounts
            .flatMap((acc) =>
              acc.recent_transactions.map((tx: any) => ({
                ...tx,
                accountName: acc.name,
              }))
            )
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 5) // latest 5 from all accounts
            .map((tx: any, idx: number) => (
              <View
                key={tx.id || `tx-${idx}`}
                className="bg-white p-4 rounded-xl shadow mb-4"
              >
                <Text className="font-medium">{tx.description}</Text>
                <Text
                  className={`font-semibold ${
                    tx.amount < 0 ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {tx.amount < 0
                    ? `- ${formatCurrency(Math.abs(tx.amount))}`
                    : formatCurrency(tx.amount)}
                </Text>
              </View>
            ))
        )}
      </View>
    </ScrollView>
  );
}
