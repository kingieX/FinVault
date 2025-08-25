import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserProfile, updateUserProfile } from "@/lib/api";
import { useNavigation } from "@react-navigation/native";
import { goBack } from "expo-router/build/global-state/routing";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const data = await getUserProfile();
    setName(data.name);
    setEmail(data.email);
  }

  async function handleSave() {
    try {
      await updateUserProfile({ name, email });
      navigation.goBack();
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <View className="flex-row items-center justify-between py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold">Edit Profile</Text>
        <TouchableOpacity>
          {/* <Ionicons name="refresh-outline" size={24} color="#000" /> */}
        </TouchableOpacity>
      </View>
      <ScrollView className="py-4">
        <View className="flex">
          <Text className="text-xl mb-2">Full name</Text>
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            className="border border-gray-300 rounded-lg p-4 mb-4"
          />
        </View>
        <View className="flex">
          <Text className="text-xl mb-2">Email</Text>
          <TextInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            className="border border-gray-300 rounded-lg p-4 mb-4"
          />
        </View>
        <TouchableOpacity
          onPress={handleSave}
          className="bg-primary py-4 rounded-lg"
        >
          <Text className="text-center text-white font-semibold">Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
