import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { getAccounts, getTransactions, linkAccount } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import LinkAccountModal from "@/components/LinkAccountModal";

export default function AccountsTransactionsScreen() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const accData = await getAccounts();
      const txnData = await getTransactions();
      setAccounts(accData || []);
      setTransactions(txnData || []);
    } catch (err) {
      console.error("Error loading accounts/transactions data:", err);
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

  // Group transactions by date, newest first
  const grouped = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reduce((acc: any, tx: any) => {
      const date = new Date(tx.date).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(tx);
      return acc;
    }, {});

  return (
    <ScrollView className="flex-1 bg-white p-6">
      {/* Accounts Section */}
      <Text className="text-2xl font-semibold mb-4">Accounts</Text>
      {accounts.length === 0 ? (
        <View className="items-center bg-white shadow-sm rounded-lg p-6 mb-6">
          <Image
            source={require("@/assets/images/account.png")}
            className="w-64 h-64 mx-auto mb-4"
            resizeMode="contain"
          />
          <Text className="text-center text-5xl font-semibold mb-4">
            See all your finances in one place
          </Text>
          <View className="flex-row items-center justify-center mb-4">
            <Ionicons name="lock-closed-outline" size={16} color="#000" />
            <Text className="text-gray-500 text-lg ml-2">
              Your data is secure and encrypted.
            </Text>
          </View>
          <TouchableOpacity
            className="bg-primary px-6 w-full py-4 rounded-lg"
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-white text-center font-semibold text-base">
              Connect Account
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        accounts.map((acc) => (
          <View
            key={acc.id}
            className="bg-white p-4 rounded-xl shadow mb-4 flex-row justify-between items-center border border-gray-100"
          >
            <View>
              <Text className="font-semibold text-lg">{acc.name}</Text>
              <Text className="text-gray-500 text-sm capitalize">
                {acc.type}
              </Text>
            </View>
            <Text
              className={`text-lg font-bold ${
                acc.balance < 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              {formatCurrency(acc.balance)}
            </Text>
          </View>
        ))
      )}

      {/* link account */}
      {/* <TouchableOpacity
        className="flex-1 flex-row justify-center bg-primary py-4 rounded-lg items-center"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-white text-base font-medium">
          Link Bank Account
        </Text>
      </TouchableOpacity> */}
      <TouchableOpacity
        className="bg-primary px-6 w-full py-4 rounded-lg"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-white text-center font-semibold text-base">
          Connect Account
        </Text>
      </TouchableOpacity>

      {/* Link Account Modal */}
      <LinkAccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={async (code: string) => {
          try {
            const res = await linkAccount(code);
            if (res.success) {
              Toast.show({
                type: "success",
                text1: "Account linked successfully",
              });
              fetchData();
              setModalVisible(false);
            } else {
              Toast.show({
                type: "error",
                text1: res.error || "Failed to link account",
              });
            }
          } catch (err) {
            console.error("Error linking account:", err);
            Toast.show({
              type: "error",
              text1: "Server error while linking account",
            });
          }
        }}
      />

      {/* Transactions Section */}
      <Text className="text-2xl font-semibold mt-6 mb-4">Transactions</Text>
      {transactions.length === 0 ? (
        <View className="bg-white shadow-sm rounded-lg p-6">
          <Image
            source={require("@/assets/images/transfer-money.png")}
            className="w-64 h-64 mx-auto mb-4"
            resizeMode="contain"
          />

          <Text className="text-gray-500 text-center text-lg">
            No transactions found
          </Text>
        </View>
      ) : (
        Object.keys(grouped).map((date) => (
          <View key={date} className="mb-6">
            {/* Date Header */}
            <Text className="text-gray-500 font-medium mb-3">{date}</Text>

            {/* Transactions for this date */}
            {grouped[date].map((tx: any) => (
              <View
                key={tx.id}
                className="bg-white p-4 rounded-xl shadow mb-3 flex-row justify-between border border-gray-100"
              >
                <View>
                  <Text className="font-medium">{tx.description}</Text>
                  <Text className="text-gray-500 text-sm">{tx.category}</Text>
                </View>
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
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}
