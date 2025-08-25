import { Ionicons } from "@expo/vector-icons";
import { goBack } from "expo-router/build/global-state/routing";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsOfService() {
  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <View className="flex-row items-center justify-between px-2 py-4 border-b border-gray-200 mb-4">
        <TouchableOpacity onPress={() => goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold">Terms of Service</Text>
        <TouchableOpacity>
          <Ionicons name="refresh-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <Text className="text-2xl font-bold mb-4">Terms of Service</Text>
        <Text className="text-gray-700 leading-6 mb-4">
          Welcome to FinVault, your mobile-first personal finance and investment
          companion. By using our app, you agree to these terms, which govern
          your use of a platform designed to help you manage spending, track
          financial goals, and gain personalized financial insights through AI.
        </Text>
        <Text className="text-lg font-bold mb-2">1. Service Description</Text>
        <Text className="text-gray-700 leading-6 mb-4">
          FinVault provides tools for syncing bank and investment accounts via
          secure APIs like Plaid. Our features include expense categorization,
          budget planning, goal tracking, and AI-powered financial coaching.
        </Text>
        <Text className="text-lg font-bold mb-2">2. Data & Security</Text>
        <Text className="text-gray-700 leading-6 mb-4">
          We prioritize the security of your financial data through end-to-end
          encryption and secure storage of sensitive information and tokens.
        </Text>
        <Text className="text-lg font-bold mb-2">3. User Responsibilities</Text>
        <Text className="text-gray-700 leading-6 mb-4">
          You are responsible for all data you provide and the accuracy of your
          financial information. Our AI-powered insights and summaries are for
          informational purposes only and are not financial advice.
        </Text>
        <Text className="text-lg font-bold mb-2">4. AI Usage</Text>
        <Text className="text-gray-700 leading-6 mb-4">
          The AI service, powered by Gemini API, provides a conversational
          assistant to summarize financial behavior and offer recommendations.
        </Text>
        <Text className="text-lg font-bold mb-2">
          5. Third-Party Integrations
        </Text>
        <Text className="text-gray-700 leading-6 mb-4">
          The app integrates with third-party services like Plaid to fetch bank
          account details, transaction history, and investment holdings.
        </Text>
        <Text className="text-gray-700 leading-6 mb-8">
          By using FinVault, you acknowledge that you have read, understood, and
          agree to be bound by these Terms of Service.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
