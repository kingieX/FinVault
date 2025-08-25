import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useMonoConnect } from "@mono.co/connect-react-native";
import Toast from "react-native-toast-message";
import { unlinkAccount } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";

interface AccountsSectionProps {
  accounts: any[];
  fetchData: () => void;
  isLoading: boolean;
}

export default function ConnectedAccount({
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
          className="flex-row justify-center border border-primary py-4 rounded-lg items-center gap-2"
        >
          <Ionicons name="add-outline" size={16} color="#4D9351" />
          <Text className="text-primary text-base font-medium">
            Link a new bank account
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <View className="mb-4">
        {accounts.length === 0 ? (
          <View className="items-center bg-white shadow-sm rounded-lg p-6 mb-6">
            <Text className="text-center text-xl font-semibold mb-2">
              No account linked yet...
            </Text>
          </View>
        ) : (
          accounts.map((acc, idx) => (
            <View
              key={acc.account_id || `acc-${idx}`}
              className="px-4 py-2 bg-white border-b border-gray-200"
            >
              <View className="flex justify-between">
                <View className="flex-row items-center justify-between gap-2 mb-2">
                  <View className="flex-row gap-2 items-center mt-2">
                    <Text className="text-xl capitalize">
                      {acc.institution_name || "Unknown Institution"}
                    </Text>
                    {acc.account_number && (
                      <Text className="text-gray-500 text-lg">
                        {acc.account_number}
                      </Text>
                    )}
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
                    className="px-3 py-1"
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF0000" />
                    {/* <Text className="text-red-500 text-xs">Unlink</Text> */}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <LinkAccount />
    </>
  );
}
