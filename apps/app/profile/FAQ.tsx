import { Ionicons } from "@expo/vector-icons";
import { goBack } from "expo-router/build/global-state/routing";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const faqData = [
  {
    q: "How does FinVault categorize my expenses?",
    a: "FinVault automatically categorizes your transactions (e.g., food, rent, travel) from your synced bank accounts. You can also manually override the categories or create custom ones.",
  },
  {
    q: "How secure is my financial data?",
    a: "We use bank-grade security protocols. All financial data is protected with end-to-end encryption, and sensitive information like access tokens is stored securely on your device using encrypted local storage. We do not store your bank login details.",
  },
  {
    q: "How does the AI financial coach work?",
    a: "The AI coach, powered by the Gemini API, provides a conversational assistant to help you understand your financial habits. It can answer questions like 'How did I do this month?' and summarize your financial behavior.",
  },
  {
    q: "How often is my bank data synced?",
    a: "Our system is designed for real-time feedback. Your financial data should sync within two seconds for small payloads.",
  },
  {
    q: "Can I set up savings goals?",
    a: "Yes, you can set specific financial goals, such as saving a certain amount for a vacation. FinVault will automatically track your progress and provide updates.",
  },
];

export default function FAQ() {
  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <View className="flex-row items-center justify-between px-2 py-4 border-b border-gray-200 mb-4">
        <TouchableOpacity onPress={() => goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold">
          Frequently Asked Questions
        </Text>
        <TouchableOpacity>
          <Ionicons name="refresh-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <Text className="text-2xl font-bold mb-4">
          Frequently Asked Questions
        </Text>
        {faqData.map((item, idx) => (
          <View key={idx} className="mb-4">
            <Text className="font-semibold text-lg">{item.q}</Text>
            <Text className="text-gray-600">{item.a}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
