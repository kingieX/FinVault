import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getPortfolio } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { PieChart } from "react-native-gifted-charts";
import AddAssetModal from "@/components/AddAssetModal";
import AssetListScreen from "@/components/AssetListScreen";

export default function PortfolioScreen({ navigation }: any) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [totalValue, setTotalValue] = useState(0);
  const [allocations, setAllocations] = useState<any[]>([]);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await getPortfolio();
      // console.log("Portfolio API response:", data);

      // Ensure correct structure
      setAssets(data.assets || []);
      setAllocations(data.allocations || []);
      setTotalValue(data.totalValue || 0);
    } catch (err) {
      console.error("Failed to load portfolio", err);
    } finally {
      setLoading(false);
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
      <ScrollView className="px-4">
        {/* Portfolio Performance Summary */}
        <View className="bg-gray-50 rounded-xl p-6 mb-6">
          <Text className="text-xl font-semibold mb-2">Portfolio Value</Text>
          <Text className="text-3xl font-bold">
            {formatCurrency(totalValue)}
          </Text>
          {/* Placeholder for performance change */}
          <Text className="text-green-500 mt-1">+5.4% Today</Text>
        </View>

        {/* Chart */}
        {allocations.length > 0 && (
          <View className="items-center mb-6">
            <PieChart
              data={allocations.map((a) => ({
                value: a.value,
                color: a.color,
                text: `${a.percentage}%`,
              }))}
              radius={80}
              showText
              textColor="white"
              textSize={12}
            />
          </View>
        )}

        {/* Add Asset Button */}
        <TouchableOpacity
          className="flex-row bg-primary py-4 rounded-lg items-center justify-center mb-6"
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-outline" size={20} color="#fff" />
          <Text className="text-white text-lg font-medium ml-2">Add Asset</Text>
        </TouchableOpacity>

        {/* Asset Allocations */}
        <Text className="text-xl font-semibold mb-4">Asset Allocation</Text>
        {allocations.length === 0 ? (
          <View className=" p-6">
            <Image
              source={require("@/assets/images/portfolio.png")}
              className="w-48 h-48 mx-auto mb-4"
              resizeMode="contain"
            />
            <Text className="text-center text-xl text-gray-500">
              No allocations yet
            </Text>
          </View>
        ) : (
          allocations.map((a) => (
            <TouchableOpacity
              key={a.name}
              className="flex-row justify-between items-center bg-white rounded-lg p-4 mb-3 border border-gray-200"
              onPress={() =>
                navigation.navigate("AssetListScreen", { type: a.name })
              }
            >
              <Text className="text-lg capitalize">{a.name}</Text>
              <Text className="font-medium">{a.percentage}%</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <AddAssetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchData}
      />
    </SafeAreaView>
  );
}
