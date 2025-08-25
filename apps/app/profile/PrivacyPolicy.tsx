// app/PrivacyPolicy.tsx
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
        <Text className="text-gray-700 leading-6">
          {/* Replace with real privacy policy */}
          Your privacy is important to us. This policy explains how we handle
          data...
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
