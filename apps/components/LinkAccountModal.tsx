import { useMonoConnect } from "@mono.co/connect-react-native";
import { TouchableOpacity, Text } from "react-native";
import Toast from "react-native-toast-message";
import { getToken } from "@/lib/storage";

export default function LinkBankButton({
  onLinked,
}: {
  onLinked?: () => void;
}) {
  const { init } = useMonoConnect({
    onSuccess: async (data: any) => {
      try {
        const code = await data.getAuthCode(); // short-lived code from Mono
        console.log("Access code", code);
        if (!code) {
          Toast.show({
            type: "error",
            text1: "No code received from Mono connect",
          });
          return;
        }
        const token = await getToken("token");

        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/accounts/link-account`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ code }),
          }
        );

        const json = await res.json();
        if (json?.success) {
          Toast.show({ type: "success", text1: "Account linked successfully" });
          onLinked?.();
        } else {
          Toast.show({
            type: "error",
            text1: json?.error || "Failed to link account",
          });
        }
      } catch (e: any) {
        Toast.show({
          type: "error",
          text1: e?.message || "Failed to link account",
        });
      }
    },
  });

  return (
    <TouchableOpacity
      onPress={() => init()} // opens the Mono widget
      className="flex-row justify-center bg-primary py-4 rounded-lg items-center"
    >
      <Text className="text-white text-base font-medium">
        Link Bank Account
      </Text>
    </TouchableOpacity>
  );
}
