import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { getPortfolio, getTrendingAssets } from "@/lib/api";
import PortfolioTab from "@/components/portfolio/PortfolioTab";
import TrendingTab from "@/components/portfolio/TrendingTab";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function PortfolioScreen() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "trending">(
    "portfolio"
  );
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [trending, setTrending] = useState<any[]>([]);

  const navigation = useNavigation<any>();

  useEffect(() => {
    if (activeTab === "portfolio") {
      fetchPortfolio();
    } else {
      fetchTrending();
    }
  }, [activeTab]);

  async function fetchPortfolio() {
    try {
      setLoading(true);
      const data = await getPortfolio();
      // console.log("Portfolio: ", data);
      setPortfolio(data);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrending() {
    try {
      setLoading(true);
      const data = await getTrendingAssets();
      setTrending(data);
    } catch (err) {
      console.error("Error fetching trending assets:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-2">
      <View className="flex-row items-center justify-between px-4 py-2 border-b mb-4 border-gray-200">
        <TouchableOpacity>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold">Portfolio</Text>
        <TouchableOpacity onPress={() => fetchPortfolio() || fetchTrending()}>
          <Ionicons name="refresh-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {/* ✅ Tab Switcher */}
      <View className="w-full flex-row justify-center mb-4">
        {["portfolio", "trending"].map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`px-4 py-2 rounded-full mx-2 ${
              activeTab === tab ? "bg-primary" : "bg-gray-200"
            }`}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              className={`${
                activeTab === tab ? "text-white" : "text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4D9351" />
        </View>
      ) : activeTab === "portfolio" ? (
        <PortfolioTab portfolio={portfolio} />
      ) : (
        <TrendingTab trending={trending} />
      )}

      {/* Floating Add Button */}
      {activeTab === "portfolio" && (
        <TouchableOpacity
          className="absolute bottom-8 right-8 bg-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          // onPress={() => setModalVisible(true)}
          onPress={() => navigation.navigate("SearchAsset")}
        >
          <Text className="text-white text-2xl">+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
