import { useMonoConnect } from "@mono.co/connect-react-native";
import { TouchableOpacity, Text } from "react-native";
import Toast from "react-native-toast-message";
import { linkAccount } from "@/lib/api";

export default function LinkBankButton({
  onLinked,
}: {
  onLinked?: () => void;
}) {
  const mono = useMonoConnect({
    scope: ["auth", "transactions"], // you can also pass "income" etc if enabled
    onSuccess: async (data: any) => {
      await linkAccount(data.code);
      Toast.show({
        type: "success",
        text1: "Account Linked",
        text2: "Your bank account has been successfully linked.",
      });
    },
  });

  return (
    <TouchableOpacity
      onPress={() => mono.init()} // opens the Mono sheet
      className="flex-row justify-center bg-primary py-4 rounded-lg items-center"
    >
      <Text className="text-white text-base font-medium">
        Link Bank Account
      </Text>
    </TouchableOpacity>
  );
}
