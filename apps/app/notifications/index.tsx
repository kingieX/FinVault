import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { getNotifications } from "@/lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { goBack } from "expo-router/build/global-state/routing";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "@/types/navigation";

export default function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchData() {
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4D9351" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold">Notifications</Text>
        <TouchableOpacity onPress={() => fetchData()}>
          <Ionicons name="refresh-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView
        className="bg-white/80 p-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
          />
        }
      >
        {notifications.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-12 p-6">
            <Image
              source={require("@/assets/images/notifications.png")}
              className="w-48 h-48 mx-auto mb-4"
              resizeMode="contain"
            />
            <Text className="text-center text-xl text-gray-500">
              No notifications yet
            </Text>
          </View>
        ) : (
          notifications.map((n) => {
            const isRead = n.read || n.is_read; // Adjust based on your API field
            return (
              <TouchableOpacity
                key={n.id}
                className={`flex flex-col gap-2 rounded-lg p-4 mb-3 border ${
                  isRead
                    ? "bg-gray-100 border-gray-100" // read = light gray
                    : "bg-primary/10 border-primary" // unread = light green
                }`}
                onPress={() =>
                  navigation.navigate("NotificationDetail", {
                    notificationId: n.id,
                  })
                }
              >
                <View className="flex flex-row items-center justify-between">
                  <View className="flex flex-row items-center">
                    <Ionicons
                      name="alert-circle-outline"
                      size={24}
                      color="#4D9351"
                    />
                    <Text className="font-medium text-lg ml-1">{n.title}</Text>
                  </View>
                  {!isRead && (
                    <View className="w-2 h-2 bg-primary rounded-full mr-2" />
                    // <Ionicons name="ellipse" size={10} color="#4D9351" />
                  )}
                </View>
                {/* splice message to a single line and add "..." */}
                <View className="border-b border-gray-200 pb-3 mb-2">
                  <Text
                    className="text-gray-600 text-base"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {n.message}
                  </Text>
                  {/* <Text className="text-gray-600 text-lg">{n.message}</Text> */}
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-xs text-primary mr-1">view</Text>
                    <Ionicons
                      name="chevron-forward-outline"
                      size={20}
                      color="#4D9351"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
