import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AppStackParamList } from "@/types/navigation";
import { getNotificationById, markNotificationAsRead } from "@/lib/api";

type NotificationDetailRouteProp = RouteProp<
  AppStackParamList,
  "NotificationDetail"
>;

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
}

export default function NotificationDetail() {
  const navigation = useNavigation();
  const route = useRoute<NotificationDetailRouteProp>();
  const { notificationId } = route.params;

  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndMarkNotification() {
      try {
        setLoading(true);
        const data = await getNotificationById(notificationId);
        setNotification(data);
        // console.log("Notification: ", data);

        if (data && !data.is_read) {
          await markNotificationAsRead(notificationId);
        }
      } catch (err) {
        console.error("Failed to fetch or mark notification:", err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not load notification.",
        });
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }
    fetchAndMarkNotification();
  }, [notificationId, navigation]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4D9351" />
      </View>
    );
  }

  if (!notification) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl text-gray-500">Notification not found.</Text>
      </View>
    );
  }

  // Determine the icon and color based on notification type
  const getIconAndColor = (type: string) => {
    switch (type) {
      case "budget_overspend":
        return { icon: "alert-circle", color: "bg-red-500" };
      case "goal_reached":
        return { icon: "trophy", color: "bg-green-500" };
      case "transaction_alert":
        return { icon: "card", color: "bg-blue-500" };
      default:
        return { icon: "notifications", color: "bg-gray-500" };
    }
  };

  const { icon, color } = getIconAndColor(notification.type);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-2xl font-semibold">
          Notification
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="p-6">
        {/* Notification Summary Card */}
        <View className="bg-white p-6 rounded-xl flex-row items-center mb-6 border border-gray-100 shadow-sm">
          <View
            className={`w-20 h-20 rounded-lg items-center justify-center mr-4 ${color}`}
          >
            <Ionicons name={icon as any} size={40} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold mb-1">
              {notification.title}
            </Text>
            {/* <Text className="text-sm text-gray-600">
              {new Date(notification.created_at).toLocaleString()}
            </Text> */}
            <View className="flex-row gap-2 items-center mb-1">
              <Text className=" text-sm font-semibold">
                {new Date(notification.created_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
              <Text className=" text-sm font-semibold">
                {new Date(notification.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true, // Use AM/PM format
                })}
              </Text>
            </View>

            <Text className="text-sm text-gray-500 font-semibold">
              {notification.type}
            </Text>
          </View>
        </View>

        {/* Message Card */}
        <View className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-4">
          <Text className="text-2xl font-semibold mb-2">Message</Text>
          <Text className="text-lg text-gray-800">{notification.message}</Text>
        </View>

        {/* Additional Details Grid */}
        <View className="grid grid-rows-2 gap-4">
          {/* Detail 1: Notification ID */}
          {/* <View className="bg-white p-4 rounded-xl shadow-sm">
            <Text className="text-sm mb-1">Notification ID</Text>
            <Text className="text-lg font-semibold">
              {notification.id.substring(0, 15)}...
            </Text>
          </View> */}
          {/* Detail 2: Status */}
          {/* <View className="bg-white p-4 rounded-xl shadow-sm">
            <Text className="text-sm mb-1">Status</Text>
            <Text
              className={`text-lg font-semibold ${notification.is_read ? "text-gray-500" : "text-primary"}`}
            >
              {notification.is_read ? "Read" : "Unread"}
            </Text>
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
