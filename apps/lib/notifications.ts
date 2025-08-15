import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getToken } from "./storage";
import axios from "axios";

const API_URL = "http://172.20.10.3:5000/api/v1";
// const API_URL = "https://finvault-service.onrender.com/api/v1"; // Use this for production

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Function to register for push notifications
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  if (!Constants.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.warn("Push permissions not granted");
    return null;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  return token;
}

// Function to send the device token to the backend
export async function sendDeviceTokenToBackend(expoPushToken: string) {
  const jwt = await getToken("token");
  if (!jwt) return;

  await axios.post(
    `${API_URL}/notifications/device-token`,
    { expo_push_token: expoPushToken },
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
}
