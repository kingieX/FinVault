// app/ContactUs.tsx
import { Ionicons } from "@expo/vector-icons";
import { goBack } from "expo-router/build/global-state/routing";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactUs() {
  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <View className="flex-row items-center justify-between px-2 py-4 border-b border-gray-200 mb-4">
        <TouchableOpacity onPress={() => goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold">Contact Us</Text>
        <TouchableOpacity>
          <Ionicons name="refresh-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text className="text-2xl font-bold mb-4">Contact Us</Text>

      <TextInput
        placeholder="Your Name"
        className="border border-gray-300 rounded-lg p-3 mb-3"
      />
      <TextInput
        placeholder="Your Email"
        keyboardType="email-address"
        className="border border-gray-300 rounded-lg p-3 mb-3"
      />
      <TextInput
        placeholder="Your Message"
        multiline
        numberOfLines={4}
        className="border border-gray-300 rounded-lg p-3 mb-3"
      />

      <TouchableOpacity className="bg-green-600 p-4 rounded-lg">
        <Text className="text-white text-center font-semibold">Send</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
