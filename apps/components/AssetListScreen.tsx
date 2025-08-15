import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getPortfolio } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function AssetListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { type } = route.params;

  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await getPortfolio();
      // Filter only the type passed in
      setAssets((data.assets || []).filter((a: any) => a.asset_type === type));
      console.log("Assets API response:", data.assets);
    } catch (err) {
      console.error("Failed to load assets", err);
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
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold capitalize">{type} Assets</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {assets.length === 0 ? (
          <Text className="text-gray-500 text-center mt-10">
            No assets found for this type.
          </Text>
        ) : (
          assets.map((asset) => (
            <View
              key={asset.id}
              className="flex-row justify-between items-center bg-white rounded-lg p-4 mb-3 border border-gray-200"
            >
              <View>
                <Text className="text-lg font-semibold">
                  {asset.asset_name}
                </Text>
                <Text className="text-gray-500 uppercase">{asset.symbol}</Text>
              </View>
              <View className="items-end">
                <Text className="font-medium">
                  {formatCurrency(asset.current_price * asset.quantity)}
                </Text>
                <Text className="text-gray-500">Qty: {asset.quantity}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
