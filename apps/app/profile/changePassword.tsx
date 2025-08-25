import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { updatePassword } from "@/lib/api";
import { useNavigation } from "@react-navigation/native";
import { goBack } from "expo-router/build/global-state/routing";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ✅ New state variables for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSave() {
    if (newPassword !== confirm) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
      });
      return;
    }
    try {
      await updatePassword({ currentPassword, newPassword });
      navigation.goBack();
      Toast.show({
        type: "success",
        text1: "Password changed successfully",
      });
    } catch (err) {
      console.error("Error updating password:", err);
      Toast.show({
        type: "error",
        text1: "Error updating password",
        text2: "Please check your current password and try again.",
      });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <View className="flex-row items-center justify-between py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold">Change Password</Text>
        <TouchableOpacity>
          {/* spacer to balance header */}
          <View style={{ width: 24 }} />
        </TouchableOpacity>
      </View>
      <ScrollView className="py-4">
        {/* ✅ Current Password Input */}
        <Text className="text-xl mb-2">Current password</Text>
        <View className="flex relative mb-4">
          <TextInput
            placeholder="Current Password"
            secureTextEntry={!showCurrentPassword} // Toggle secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            className="border border-gray-300 rounded-lg p-4 placeholder:text-gray-500 pr-12"
          />
          <TouchableOpacity
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-3"
          >
            <Ionicons
              name={showCurrentPassword ? "eye-off" : "eye"}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        {/* ✅ New Password Input */}
        <Text className="text-xl mb-2">New password</Text>
        <View className="flex relative mb-4">
          <TextInput
            placeholder="New Password"
            secureTextEntry={!showNewPassword} // Toggle secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            className="border border-gray-300 rounded-lg p-4 placeholder:text-gray-500 pr-12"
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-3"
          >
            <Ionicons
              name={showNewPassword ? "eye-off" : "eye"}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        {/* ✅ Confirm Password Input */}
        <Text className="text-xl mb-2">Confirm password</Text>
        <View className="flex relative mb-6">
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry={!showConfirm} // Toggle secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            className="border border-gray-300 rounded-lg p-4 placeholder:text-gray-500 pr-12"
          />
          <TouchableOpacity
            onPress={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-3"
          >
            <Ionicons
              name={showConfirm ? "eye-off" : "eye"}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
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
