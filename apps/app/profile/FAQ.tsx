// app/FAQ.tsx
import { Ionicons } from "@expo/vector-icons";
import { goBack } from "expo-router/build/global-state/routing";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const faqData = [
  { q: "How do I reset my password?", a: "Go to Settings → Change Password." },
  {
    q: "How do I add an asset?",
    a: "On Portfolio, press the + button to add assets.",
  },
  {
    q: "How secure is my data?",
    a: "We use bank-grade encryption and secure authentication.",
  },
];

export default function FAQ() {
  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <View className="flex-row items-center justify-between px-2 py-4 border-b border-gray-200 mb-4">
        <TouchableOpacity onPress={() => goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold">Terms of service</Text>
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
