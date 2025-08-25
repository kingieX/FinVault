import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMonoConnect } from "@mono.co/connect-react-native";
import { formatCurrency } from "@/lib/format";
import Toast from "react-native-toast-message";
import { unlinkAccount } from "@/lib/api";

interface AccountsSectionProps {
  accounts: any[];
  fetchData: () => void;
  isLoading: boolean;
}

export default function AccountsSection({
  accounts,
  fetchData,
  isLoading,
}: AccountsSectionProps) {
  const { init } = useMonoConnect();

  function LinkAccount() {
    return (
      <View style={{ marginBottom: 10 }}>
        <TouchableOpacity
          onPress={() => init()}
          className="flex-row justify-center bg-primary px-4 py-4 rounded-lg items-center"
        >
          <Text className="text-white text-base font-medium">
            Link your bank account
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Text className="text-2xl font-semibold mb-4">Accounts</Text>
      {accounts.length === 0 ? (
        <View className="flex items-center bg-white shadow-sm rounded-lg p-6 mb-6">
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
          <LinkAccount />
        </View>
      ) : (
        accounts.map((acc, idx) => (
          <View
            key={acc.account_id || `acc-${idx}`}
            className="bg-white p-4 rounded-xl shadow mb-4 border border-gray-100"
          >
            <View className="flex justify-between items-">
              <View className="flex gap-2">
                <View className="flex-row items-center justify-between gap-2 mb-2">
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
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "Unlink Account",
                        "If you unlink this account, all its transactions will also be deleted. Are you sure?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Unlink",
                            style: "destructive",
                            onPress: async () => {
                              const res = await unlinkAccount(acc.account_id);
                              if (res.success) {
                                Toast.show({
                                  type: "success",
                                  text1: "Account unlinked",
                                });
                                await fetchData();
                              } else {
                                Toast.show({
                                  type: "error",
                                  text1: res.error || "Unlink failed",
                                });
                              }
                            },
                          },
                        ]
                      );
                    }}
                    className="bg-red-500 px-3 py-2 rounded-lg"
                  >
                    <Text className="text-white text-xs">Unlink</Text>
                  </TouchableOpacity>
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
    </>
  );
}
