/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { getAssetDetail } from "@/lib/api";
import { formatDollarCurrency } from "@/lib/format";

export default function AssetDetailScreen() {
  const route = useRoute<any>();
  const { assetId } = route.params;

  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, []);

  async function fetchDetail() {
    try {
      const data = await getAssetDetail(assetId);
      setAsset(data);
    } catch (err) {
      console.error("Error loading asset detail:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!asset) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Asset not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-2">{asset.name}</Text>
      <Text className="text-gray-500 mb-4">{asset.symbol}</Text>

      <Text className="text-lg">
        Current Price: {formatDollarCurrency(asset.price.toFixed(2))}
      </Text>
      <Text className="text-lg">
        Holdings: {asset.quantity} {asset.symbol}
      </Text>
      <Text className="text-lg">
        Value: {formatDollarCurrency(asset.value.toFixed(2))}
      </Text>

      <Text
        className={`text-lg font-semibold ${
          asset.profitLoss >= 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        {asset.profitLoss >= 0 ? "+" : ""}
        {formatDollarCurrency(asset.profitLoss.toFixed(2))} (
        {asset.profitLossPercent.toFixed(2)}%)
      </Text>
    </View>
  );
}
