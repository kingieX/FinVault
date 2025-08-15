import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Image } from "react-native";
import { getCurrentUser, getAccounts, getInsights } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [insights, setInsights] = useState<any[]>([]);

  // Fetch insights data
  useEffect(() => {
    (async () => {
      const data = await getInsights(3);
      setInsights(data);
      // console.log("Insights data:", data);
    })();
  }, []);

  // Fetch Account data
  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getCurrentUser();
        if (userData) setUser(userData);

        const accountsData = await getAccounts();
        setAccounts(accountsData);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
    <ScrollView className="flex-1 bg-white/80 p-6">
      {/* Greeting */}
      <View className="flex-row items-center mb-1">
        <Text className="text-2xl font-semibold text-gray-800">{greeting}</Text>
        <Text className="text-2xl font-semibold text-primary">
          {user?.name ? `, ${user.name}` : ""}
        </Text>
      </View>
      <Text className="text-gray-500 mb-4">
        Here’s a quick look at your finances!
      </Text>

      {/* Balance Cards */}
      <View className="flex-row justify-between mb-6">
        <View className="bg-white p-4 rounded-xl shadow w-[48%]">
          <Text className="text-gray-500">Total Balance</Text>
          <Text className="text-2xl font-bold text-primary">
            {formatCurrency(
              accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
            )}
          </Text>
        </View>
        <View className="bg-white p-4 rounded-xl shadow w-[48%]">
          <Text className="text-gray-500">Accounts</Text>
          <Text className="text-2xl font-bold text-blue-500">
            {accounts.length}
          </Text>
        </View>
      </View>

      {/* Insights */}
      <View className="bg-white pb-4">
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
                  <Text className="text-gray-500 text-sm mt-1">
                    {new Date(i.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Recent Transactions */}
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
          .map((tx: any) => (
            <View key={tx.id} className="bg-white p-4 rounded-xl shadow mb-4">
              <Text className="font-medium">{tx.description}</Text>
              <Text className="text-gray-500">
                {tx.amount < 0
                  ? `- ${formatCurrency(Math.abs(tx.amount))}`
                  : formatCurrency(tx.amount)}{" "}
                • {tx.category} • {tx.accountName}
              </Text>
            </View>
          ))
      )}
    </ScrollView>
  );
}
