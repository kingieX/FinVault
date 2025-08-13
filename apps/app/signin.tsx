/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ButtonPrimary from "@/components/ButtonPrimary";
import { Ionicons } from "@expo/vector-icons";
import { login } from "@/lib/api";

import Toast from "react-native-toast-message";

export default function SigninScreen() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Loading
  const [loading, setLoading] = useState(false);

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      return Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your email and password",
      });
    }
    try {
      setLoading(true);
      await login(email, password);
      router.replace("/(tabs)/(home)/home");
      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: "Welcome back!",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error;
      Toast.show({
        type: "error",
        text1: "Login Failed",
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
          className="flex-1 px-6 pt-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex justify-start items-center mb-6">
            <Image
              source={require("@/assets/images/finvault-logo2.png")}
              className="w-full "
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text className="text-4xl font-medium mb-2">
            Welcome Back to FinVault
          </Text>
          <Text className="text-gray-500 text-lg mb-12">
            Sign in to continue managing your finances.
          </Text>

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
          <View className="relative mb-2">
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

          {/* forgot password */}
          <TouchableOpacity
            className="mb-12"
            onPress={() => alert("Forgot Password?")}
          >
            <Text className="text-primary text-right text-sm font-medium">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Log In Button */}
          <ButtonPrimary
            title={loading ? "Logging in..." : "Log In"}
            onPress={handleLogin}
            disabled={loading}
            className="w-full mb-6"
          />

          {loading && (
            <ActivityIndicator size="small" color="#16a34a" className="mt-4" />
          )}

          {/* Footer */}
          <View className="flex-row justify-center mb-10">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text className="text-primary font-medium">Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
