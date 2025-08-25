import { Ionicons } from "@expo/vector-icons";
import { goBack } from "expo-router/build/global-state/routing";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicy() {
  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <View className="flex-row items-center justify-between px-2 py-4 border-b border-gray-200 mb-4">
        <TouchableOpacity onPress={() => goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold">Privacy Policy</Text>
        <TouchableOpacity>
          <Ionicons name="refresh-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <Text className="text-2xl font-bold mb-4">Privacy Policy</Text>
        <Text className="text-gray-700 leading-6 mb-4">
          Your privacy is a top priority for us. This policy outlines how we
          handle your data when you use FinVault.
        </Text>
        <Text className="text-lg font-bold mb-2">1. Data Collection</Text>
        <Text className="text-gray-700 leading-6 mb-4">
          We collect and securely fetch your bank account details, transaction
          history, and investment holdings through OAuth-based connections via
          the Plaid API. This data is used to provide core features like budget
          planning, goal tracking, and financial insights.
        </Text>
        <Text className="text-lg font-bold mb-2">2. Data Storage</Text>
        <Text className="text-gray-700 leading-6 mb-4">
          Tokens and other sensitive data are stored securely on your device
          using encrypted local storage.
        </Text>
        <Text className="text-lg font-bold mb-2">3. Data Security</Text>
        <Text className="text-gray-700 leading-6 mb-4">
          We ensure end-to-end encryption for all financial data to protect it
          during transmission and storage. We do not store your banking
          credentials on our servers.
        </Text>
        <Text className="text-lg font-bold mb-2">4. Third-Party Services</Text>
        <Text className="text-gray-700 leading-6 mb-4">
          We use the Gemini API for our AI financial coach, which processes your
          financial behavior to provide summaries and recommendations. We do not
          share personally identifiable information with this service.
        </Text>
        <Text className="text-lg font-bold mb-2">5. Data Usage</Text>
        <Text className="text-gray-700 leading-6 mb-8">
          We use your data to power key features of the app and to provide
          personalized feedback and educational nudges. We will not sell your
          personal data to third parties.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
