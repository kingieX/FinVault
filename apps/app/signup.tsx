import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ButtonPrimary from "@/components/ButtonPrimary";
import { Ionicons } from "@expo/vector-icons";
import { signup } from "@/lib/api";

// push notification import
import {
  registerForPushNotificationsAsync,
  sendDeviceTokenToBackend,
} from "@/lib/notifications";

import Toast from "react-native-toast-message";

export default function SignupScreen() {
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading
  const [loading, setLoading] = useState(false);

  // push notification setup
  useEffect(() => {
    (async () => {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) await sendDeviceTokenToBackend(pushToken);
      console.log("Push token registered:", pushToken);
    })();
  }, []);

  // Handle signup
  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      return Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
      });
    }
    if (password !== confirmPassword) {
      return Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
      });
    }
    try {
      setLoading(true);
      await signup(email, password, fullName);
      router.replace("/(tabs)/home");
      Toast.show({
        type: "success",
        text1: "Signup Successful",
        text2: "Welcome to FinVault!",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error;
      Toast.show({
        type: "error",
        text1: "Signup Failed",
        text2: errorMessage || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          className="flex-1 px-6 pt-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text className="text-center text-2xl font-medium mb-12">
            Sign Up
          </Text>

          {/* Title */}
          <Text className="text-4xl font-medium mb-2">
            Create Your FinVault Account
          </Text>
          <Text className="text-gray-500 text-lg mb-8">
            Join FinVault and manage your finances with ease.
          </Text>

          {/* Full Name */}
          <Text className="font-medium text-gray-700 mb-1">Full Name</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            placeholder="Jon Case"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email Address */}
          <Text className="font-medium text-gray-700 mb-1">Email Address</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            placeholder="example@finvault.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password */}
          <Text className="font-medium text-gray-700 mb-1">Password</Text>
          <View className="relative mb-4">
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 pr-10"
              placeholder="********"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3"
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text className="font-medium text-gray-700 mb-1">
            Confirm Password
          </Text>
          <View className="relative mb-6">
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 pr-10"
              placeholder="********"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3"
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={22}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Create Account Button */}
          <ButtonPrimary
            title={loading ? "Creating..." : "Create Account"}
            onPress={handleSignup}
            disabled={loading}
            className="w-full mb-6 mt-6"
          />

          {loading && (
            <ActivityIndicator size="small" color="#16a34a" className="mt-4" />
          )}

          {/* Footer */}
          <View className="flex-row justify-center mb-5">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signin")}>
              <Text className="text-primary font-medium">Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
