import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { getAccounts, getTransactions } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { Ionicons } from "@expo/vector-icons";
import { MonoProvider, useMonoConnect } from "@mono.co/connect-react-native";
import Toast from "react-native-toast-message";
import { getToken } from "@/lib/storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
// console.log("API URL:", API_URL);

export default function AccountsTransactionsScreen() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // 1) fetch or create mono_customer_id
        const token = await getToken("token");
        // console.log("Token", token);
        if (!token) {
          throw new Error("User not authenticated");
        }
        const resp = await fetch(`${API_URL}/users/mono-customer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const js = await resp.json();
        // console.log("Mono Customer Response:", js.customerId);
        if (js.error) {
          throw new Error(js.error);
        }
        setCustomerId(js.customerId);

        // 2) load data
        await fetchData();
      } catch (e) {
        console.error("init screen error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function fetchData() {
    try {
      const accData = await getAccounts();
      const txnData = await getTransactions();
      setAccounts(accData || []);
      setTransactions(txnData || []);
    } catch (err) {
      console.error("Error loading accounts/transactions data:", err);
    }
  }

  if (loading && !customerId) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" className="text-primary" />
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

  const config = {
    publicKey:
      process.env.EXPO_PUBLIC_MONO_PUBLIC_KEY || "test_pk_tl7dpn4m0a4nrrlolcbk",
    scope: "auth", // you can add "transactions" if enabled on your account; the v2 API calls above fetch them anyway
    data: {
      customer: { id: customerId },
    },
    onClose: () => {},
    onSuccess: async (data: any) => {
      try {
        const code = await data.getAuthCode();
        // console.log("Mono auth code:", code);
        if (!code) {
          Toast.show({
            type: "error",
            text1: "Failed to get auth code",
          });
          console.log("No auth code received");
          return;
        }
        const token = await getToken("token");
        const res = await fetch(`${API_URL}/accounts/link-account`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        });
        const js = await res.json();
        console.log("Link account response:", js);
        if (js.success) {
          Toast.show({ type: "success", text1: "Account linked" });
          console.log("Account linked successfully");
          await fetchData();
        } else {
          Toast.show({
            type: "error",
            text1: js.error || "Failed to link account",
          });
        }
      } catch (e: any) {
        Toast.show({
          type: "error",
          text1: e?.message || "Failed to link account",
        });
      }
    },
    onEvent: (eventName: string, payload: any) => {
      // optional telemetry
      // console.log(eventName, payload);
    },
  };

  function LinkAccount() {
    const { init } = useMonoConnect();
    return (
      <View style={{ marginBottom: 10 }}>
        <TouchableOpacity
          onPress={() => init()}
          className="flex-row justify-center bg-primary py-4 rounded-lg items-center"
        >
          <Text className="text-white text-base font-medium">
            Link your bank account
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <MonoProvider {...config}>
      <ScrollView className="flex-1 bg-white p-6">
        {/* Accounts */}
        <Text className="text-2xl font-semibold mb-4">Accounts</Text>
        {accounts.length === 0 ? (
          <View className="items-center bg-white shadow-sm rounded-lg p-6 mb-6">
            <Image
              source={require("@/assets/images/account.png")}
              className="w-32 h-32 mx-auto mb-4"
              resizeMode="contain"
            />
            <Text className="text-center text-xl font-semibold mb-2">
              See all your finances in one place
            </Text>
            <View className="flex-row items-center justify-center mb-4">
              <Ionicons name="lock-closed-outline" size={16} color="#000" />
              <Text className="text-gray-500 text-lg ml-2">
                Your data is secure and encrypted.
              </Text>
            </View>
          </View>
        ) : (
          accounts.map((acc, idx) => (
            <View
              key={acc.account_id || `acc-${idx}`}
              className="bg-white p-4 rounded-xl shadow mb-4 border border-gray-100"
            >
              <View className="flex justify-between items-">
                <View className="flex gap-2">
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      name={
                        acc.type !== "savings" ? "wallet" : "wallet-outline"
                      }
                      size={20}
                      color="#4D9351"
                    />
                    <Text className="text-gray-500 text-sm">
                      {acc.type || "Unknown Type"}
                    </Text>
                  </View>
                  <Text
                    className={`text-3xl font-bold ${
                      acc.balance < 0 ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(acc.balance || 0)}
                  </Text>
                </View>
                <View className="flex-row gap-2 items-center mt-2">
                  {/* <Text className="font-semibold text-lg">
                    {acc.account_name || "Account"}
                  </Text> */}
                  <Text className="text-gray-500 text-lg capitalize">
                    {acc.institution_name || "Unknown Institution"}
                  </Text>
                  {acc.account_number && (
                    <Text className="text-gray-400 text-sm">
                      ••••{acc.account_number.slice(-4)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))
        )}

        {/* Link Account */}
        <LinkAccount />

        {/* Transactions */}
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
            <View key={date} className="mb-3">
              <Text className="text-gray-500 font-medium mb-2">{date}</Text>
              {grouped[date].map((tx: any, idx: number) => (
                <View
                  key={tx.id || `tx-${idx}`}
                  className="bg-white p-4 rounded-xl shadow mb-3 flex-row justify-between border border-gray-100"
                >
                  <View className="flex-1 flex-col justify-center gap-1">
                    <Text className="font-medium">{tx.description}</Text>
                    {/* <Text className="text-gray-500 text-sm">
                      {tx.category ||
                        tx.account_name ||
                        tx.account_type ||
                        "Uncategorized"}
                    </Text> */}
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
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </MonoProvider>
  );
}
