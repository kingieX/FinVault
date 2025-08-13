import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { getCurrentUser, getAccounts } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <ScrollView className="flex-1 bg-white/80 p-6">
      {/* Greeting */}
      <Text className="text-2xl font-semibold text-gray-800">
        Hello{user?.name ? `, ${user.name}` : ""}
      </Text>
      <Text className="text-gray-500 mb-6">
        Here’s a quick look at your finances!
      </Text>

      {/* Balance Cards */}
      <View className="flex-row justify-between mb-6">
        <View className="bg-white p-4 rounded-xl shadow w-[48%]">
          <Text className="text-gray-500">Total Balance</Text>
          <Text className="text-2xl font-bold text-green-600">
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

      {/* Recent Transactions */}
      <Text className="text-lg font-semibold mb-3">Recent Transactions</Text>
      {accounts.flatMap((acc) => acc.recent_transactions).length === 0 ? (
        <Text className="text-gray-500">No recent transactions</Text>
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
