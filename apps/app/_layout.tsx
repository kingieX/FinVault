/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { getToken, deleteToken } from "@/lib/storage";
import { getCurrentUser } from "@/lib/api";
import "./global.css";

import { MonoProvider } from "@mono.co/connect-react-native";

import * as Notifications from "expo-notifications";

import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  console.log("Current Pathname:", pathname);
  const [loading, setLoading] = useState(true);

  // Routes that do not require authentication
  const publicRoutes = ["/welcome", "/signin", "/signup"];

  // notification setup
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const screen = response.notification.request.content.data?.screen;
        if (screen === "budgets") router.push("/(tabs)/budgets");
        else if (screen === "goals") router.push("/(tabs)/goals");
        else router.push("/(tabs)/(home)/home");
      }
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    // deleteToken("token");

    async function init() {
      const token = await getToken("token");
      // console.log("Token found:", token);

      // CASE 1 — No token found
      if (!token || token === "null" || token === "undefined") {
        console.warn("No valid token found");
        if (!publicRoutes.includes(pathname)) {
          router.replace("/welcome");
        }
        setLoading(false);
        return;
      }

      // CASE 2 — Token exists, verify user
      const user = await getCurrentUser();
      if (user) {
        console.log("Valid session → dashboard");
        // If user is on a public page but has a valid token, send them to dashboard
        if (publicRoutes.includes(pathname)) {
          router.replace("/(tabs)/(home)/home");
        }
        // If user is on a protected route, allow access
        else if (pathname.startsWith("/(tabs)")) {
          console.log("User authenticated, staying on current page");
          router.push(pathname as any);
        } else if (pathname === "/") {
          console.warn("Unknown route, redirecting to home");
          router.replace("/(tabs)/(home)/home");
        }
      } else {
        console.warn("Invalid token/session → signin");
        await deleteToken("token");
        if (!publicRoutes.includes(pathname)) {
          router.replace("/signin");
        }
      }

      setLoading(false);
    }

    init();
  }, [pathname]);

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4D9351FF" />
      </View>
    );
  }

  // Stack configuration
  return (
    <>
      <MonoProvider
        publicKey="test_pk_tl7dpn4m0a4nrrlolcbk" // your sandbox public key
        onEvent={(evt) => console.log("Mono event:", evt)}
        onClose={() => console.log("Mono closed")}
        onSuccess={(data) => console.log("Mono success:", data)}
      >
        <Stack screenOptions={{ headerShown: false }}>
          {/* <Stack.Screen name="index" /> */}
          <Stack.Screen name="welcome" />
          <Stack.Screen name="signin" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="/notifications" />

          <Stack.Screen name="/profile" />
        </Stack>
        <Toast
          config={{
            success: (props) => (
              <BaseToast
                {...props}
                style={{ borderLeftColor: "#4D9351" }}
                text1Style={{ fontSize: 16, fontWeight: "bold" }}
                text2Style={{ fontSize: 15, fontWeight: "semibold" }}
              />
            ),
            error: (props) => (
              <ErrorToast
                {...props}
                style={{ borderLeftColor: "red" }}
                text1Style={{ fontSize: 16, fontWeight: "bold" }}
                text2Style={{ fontSize: 15, fontWeight: "semibold" }}
              />
            ),
          }}
        />
      </MonoProvider>
    </>
  );
}
