import {
  View,
  Text,
  TouchableOpacity,
  // Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import {
  deleteAccount,
  getAccounts,
  getUserProfile,
  logoutUser,
} from "@/lib/api";
import { useNavigation } from "@react-navigation/native";
import { goBack } from "expo-router/build/global-state/routing";
import { getInitials, getAvatarColor } from "@/utils/avatar";
import { deleteToken, getToken } from "@/lib/storage";
import Toast from "react-native-toast-message";
import { MonoProvider } from "@mono.co/connect-react-native";
import ConnectedAccount from "@/components/ConnectedAccount";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Profile() {
  // const [notifications, setNotifications] = useState(true);
  // const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);

  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchUser();
  }, []);

  // Account settings
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken("token");
        if (!token) {
          throw new Error("User not authenticated");
        }
        const resp = await fetch(`${API_URL}/users/mono-customer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const js = await resp.json();
        if (js.error) {
          throw new Error(js.error);
        }
        setCustomerId(js.customerId);
        await fetchData();
      } catch (e) {
        console.error("init screen error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function fetchData() {
    try {
      const accData = await getAccounts();
      setAccounts(accData || []);
    } catch (err) {
      console.error("Error loading accounts/transactions data:", err);
    }
  }

  if (loading && !customerId) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  const config = {
    publicKey:
      process.env.EXPO_PUBLIC_MONO_PUBLIC_KEY || "test_pk_tl7dpn4m0a4nrrlolcbk",
    scope: "auth",
    data: {
      customer: { id: customerId },
    },
    onClose: () => {},
    onSuccess: async (data: any) => {
      try {
        const code = await data.getAuthCode();
        if (!code) {
          Toast.show({
            type: "error",
            text1: "Failed to get auth code",
          });
          console.log("No auth code received");
          return;
        }
        const token = await getToken("token");
        const res = await fetch(`${API_URL}/accounts/link-account`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        });
        const js = await res.json();
        console.log("Link account response:", js);
        if (js.success) {
          Toast.show({ type: "success", text1: "Account linked" });
          console.log("Account linked successfully");
          await fetchData();
        } else {
          Toast.show({
            type: "error",
            text1: js.error || "Failed to link account",
          });
        }
      } catch (e: any) {
        Toast.show({
          type: "error",
          text1: e?.message || "Failed to link account",
        });
      }
    },
    onEvent: (eventName: string, payload: any) => {},
  };
  // ==Ends here

  // Fetch user details
  async function fetchUser() {
    try {
      const data = await getUserProfile();
      setUser(data);
      // console.log("data: ", data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }

  // Handle logout
  async function handleLogout() {
    try {
      await logoutUser();
      await deleteToken("token"); // remove from local storage
      navigation.reset({
        index: 0,
        routes: [{ name: "welcome" }],
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  // Handle account delete
  async function handleDeleteAccount() {
    try {
      await deleteAccount();
      await deleteToken("token");
      navigation.reset({
        index: 0,
        routes: [{ name: "signup" }],
      });
    } catch (err) {
      console.error("Delete account failed:", err);
    }
  }

  // Confirm logout
  function confirmLogout() {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: handleLogout,
        },
      ],
      { cancelable: false }
    );
  }

  // COnfirm delete account
  function confirmDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleDeleteAccount,
        },
      ],
      { cancelable: false }
    );
  }

  // Profile picture style
  const initials = getInitials(user?.name);
  const avatarColor = getAvatarColor(user?.name);

  return (
    <MonoProvider {...config}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => goBack()}>
            <Ionicons name="arrow-back-outline" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold">Profile</Text>
          <TouchableOpacity>
            <Ionicons name="refresh-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View className="items-center py-6 border-b border-gray-200">
            {/* ✅ Initial Avatar View */}
            <View
              className="w-32 h-32 rounded-full mb-3 items-center justify-center"
              style={{ backgroundColor: avatarColor }}
            >
              <Text className="text-white text-7xl font-bold">{initials}</Text>
            </View>
            <Text className="text-2xl font-semibold">{user?.name}</Text>
            <Text className="text-gray-500">{user?.email}</Text>
          </View>

          {/* Account Information */}
          <View className="mt-6">
            <Text className="px-4 text-gray-500 mb-2 font-semibold">
              Account Information
            </Text>
            <TouchableOpacity
              className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-200"
              onPress={() => navigation.navigate("editProfile")}
            >
              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={20} color="#555" />
                <Text className="ml-3">Email</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-gray-500">{user?.email}</Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#999"
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row justify-between items-center px-4 py-4 bg-white"
              onPress={() => navigation.navigate("changePassword")}
            >
              <View className="flex-row items-center">
                <Ionicons name="lock-closed-outline" size={20} color="#555" />
                <Text className="ml-3">Password Change</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Connected Accounts */}
          <View className="mt-6 px-4">
            <Text className="text-gray-500 mb-2 font-semibold">
              Connected Accounts
            </Text>
            <ConnectedAccount
              accounts={accounts}
              fetchData={fetchData}
              isLoading={loading}
            />
          </View>

          {/* App Preferences */}
          {/* <View className="mt-6">
            <Text className="px-4 text-gray-500 mb-2 font-semibold">
              App Preferences
            </Text>
            {[
              { label: "Dark Mode", state: darkMode, setter: setDarkMode },
              {
                label: "Push Notifications",
                state: notifications,
                setter: setNotifications,
              },
            ].map((pref) => (
              <View
                key={pref.label}
                className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-200"
              >
                <Text>{pref.label}</Text>
                <Switch
                  value={pref.state}
                  onValueChange={pref.setter}
                  thumbColor={pref.state ? "#4D9351" : "#f4f3f4"}
                />
              </View>
            ))}
          </View> */}

          {/* Legal & Privacy */}
          <View className="mt-6">
            <Text className="px-4 text-gray-500 mb-2 font-semibold">
              Legal & Privacy
            </Text>
            <TouchableOpacity
              className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-200"
              onPress={() => navigation.navigate("TermsOfService")}
            >
              <Text>Terms of Service</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-200"
              onPress={() => navigation.navigate("PrivacyPolicy")}
            >
              <Text>Privacy Policy</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Support */}
          <View className="mt-6">
            <Text className="px-4 text-gray-500 mb-2 font-semibold">
              Support
            </Text>
            <TouchableOpacity
              className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-200"
              onPress={() => navigation.navigate("ContactUs")}
            >
              <Text>Contact Us</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-200"
              onPress={() => navigation.navigate("FAQ")}
            >
              <Text>FAQ</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Logout + Delete */}
          <View className="px-4 mt-8">
            <TouchableOpacity
              className="w-full bg-primary py-4 rounded-lg mb-3"
              onPress={confirmLogout}
            >
              <Text className="text-center text-white font-semibold">
                Log Out
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-full py-4">
              <Text
                className="text-center text-red-600 font-semibold"
                onPress={confirmDeleteAccount}
              >
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </MonoProvider>
  );
}
