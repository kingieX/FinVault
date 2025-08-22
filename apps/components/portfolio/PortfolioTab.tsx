import { formatDollarCurrency } from "@/lib/format";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import PortfolioChart from "./PortfolioChart";

export default function PortfolioTab({ portfolio }: { portfolio: any }) {
  const navigation = useNavigation<any>();

  if (!portfolio) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Loading portfolio...</Text>
      </View>
    );
  }

  // ✅ New component to hold the header content
  const ListHeader = () => (
    <>
      <View className="px-4 border-b-2 border-gray-200 pb-2">
        <Text className="text-4xl font-medium mb-3">
          {formatDollarCurrency(portfolio?.totalValue?.toFixed(2) || 0)}
        </Text>
        <View className="flex-row gap-2">
          <Text className="text-gray-500">24h:</Text>
          <Text
            className={
              portfolio?.portfolio24hChange >= 0
                ? "text-green-500"
                : "text-red-500"
            }
          >
            {formatDollarCurrency(portfolio?.portfolio24hChange.toFixed(2))} (
            {portfolio?.portfolio24hChangePercent.toFixed(2)}%)
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Text className="text-gray-500">All-time:</Text>
          <Text
            className={
              portfolio?.allTimeChange >= 0 ? "text-green-500" : "text-red-500"
            }
          >
            {formatDollarCurrency(portfolio?.allTimeChange.toFixed(2))} (
            {portfolio?.allTimeChangePercent.toFixed(2)}%)
          </Text>
        </View>
      </View>

      <PortfolioChart />

      {/* ✅ Asset List Header */}
      <View className="px-4 py-2">
        <View className="flex-row justify-between items-center p-2">
          <Text className="font-semibold">Asset</Text>
          <Text className="font-semibold">Price</Text>
          <Text className="font-semibold">Holdings</Text>
        </View>
      </View>
    </>
  );

  return (
    <View className="flex-1">
      <FlatList
        data={portfolio?.holdings || []}
        keyExtractor={(item) => item.symbol}
        ListHeaderComponent={ListHeader} // ✅ Use the ListHeader component here
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row justify-between items-center bg-white border border-gray-200 rounded-lg p-3 mb-3 mx-4"
            onPress={() =>
              navigation.navigate("AssetDetail", {
                assetId: item.asset_id,
              })
            }
          >
            {/* Asset icon & Name */}
            <View className="flex-row gap-1 items-center">
              <Image src={item.logo_url} width={20} height={20} />
              <Text className="text-xl">{item.name}</Text>
            </View>

            {/* Price */}
            <View className="flex items-center">
              <Text>{formatDollarCurrency(item.price.toFixed(2))}</Text>
              {item.profitLoss != null && (
                <Text
                  className={`text-sm ${
                    item.profitLoss >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {item.profitLoss >= 0 ? "+" : ""}
                  {formatDollarCurrency(item.profitLoss.toFixed(2))} (
                  {item.profitLossPercent?.toFixed(2)}%)
                </Text>
              )}
            </View>

            {/* Holdings + Profit/Loss */}
            <View className="flex items-end">
              <Text className="text-lg font-medium">
                {formatDollarCurrency(item.value.toFixed(2))}
              </Text>
              <Text className="text-sm text-gray-500">
                {item.quantity} {item.symbol}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
