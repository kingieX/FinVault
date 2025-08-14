import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import { getUnreadNotificationsCount } from "@/lib/api";

export default function TabLayout() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadCount() {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
      // console.log("Unread notifications count:", count);
    }
    loadCount();
    const interval = setInterval(loadCount, 30000); // refresh every 30 sec
    return () => clearInterval(interval);
  }, []);

  const headerRight = () => (
    <View className="flex-row items-center gap-3 px-4">
      <TouchableOpacity onPress={() => router.push("/notifications")}>
        <Ionicons name="notifications-outline" size={24} color="#000" />
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full px-1.5 py-0.5">
            <Text className="text-white text-xs">{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/profile")}>
        <Ionicons name="person-circle-outline" size={32} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        headerRight,
        tabBarActiveTintColor: "#4D9351FF",
        tabBarInactiveTintColor: "#8e8e93",
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flag" size={size} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal" size={size} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="budgets"
        options={{
          title: "Budget",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts-transactions"
        options={{
          title: "Accounts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
