import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { formatDollarCurrency } from "@/lib/format";

// Enable layout animations on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TrendingTab({ trending }: { trending: any[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  function formatChange(value: number): string {
    return value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  }

  function toggleExpand(symbol: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === symbol ? null : symbol);
  }

  return (
    <FlatList
      data={trending}
      keyExtractor={(item) => item.symbol}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      renderItem={({ item }) => (
        <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm">
          {/* Header row */}
          <TouchableOpacity
            className="flex-row justify-between items-center"
            onPress={() => toggleExpand(item.symbol)}
          >
            {/* ✅ Left: Logo + Name + Symbol */}
            <View className="flex-1 flex-row items-center">
              {item.logo_url ? (
                <Image
                  source={{ uri: item.logo_url }}
                  className="w-8 h-8 rounded-full mr-2"
                  resizeMode="contain"
                />
              ) : (
                <View className="w-8 h-8 rounded-full bg-gray-300 mr-2" />
              )}
              <View>
                <Text className="text-lg font-semibold">{item.name}</Text>
                <Text className="text-gray-500">{item.symbol}</Text>
              </View>
            </View>

            {/* ✅ Middle: Price */}
            <View className="flex-1 items-center">
              <Text className="text-lg font-bold">
                {formatDollarCurrency(item.price)}
              </Text>
            </View>

            {/* ✅ Right: 24h Change */}
            <View className="flex-1 items-end">
              <Text
                className={`font-bold ${
                  item.percent_change_24h >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {formatChange(item.percent_change_24h)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* ✅ Expanded details */}
          {expanded === item.symbol && (
            <View className="mt-3 border-t border-gray-200 pt-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">Market Cap</Text>
                <Text className="font-semibold">
                  {formatDollarCurrency(item.market_cap)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">Circulating Supply</Text>
                <Text className="font-semibold">
                  {item.circulating_supply?.toLocaleString()} /{" "}
                  {item.max_supply?.toLocaleString() || "∞"}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">Market Pairs</Text>
                <Text className="font-semibold">{item.market_pairs}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">CMC Rank</Text>
                <Text className="font-semibold">#{item.cmc_rank}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">Date Added</Text>
                <Text className="font-semibold">
                  {new Date(item.date_added).toLocaleDateString()}
                </Text>
              </View>

              {/* Tags */}
              {item.tags?.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-2"
                >
                  {item.tags.slice(0, 10).map((tag: string) => (
                    <View
                      key={tag}
                      className="bg-gray-100 px-3 py-1 rounded-full mr-2"
                    >
                      <Text className="text-gray-600 text-sm">{tag}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      )}
    />
  );
}
