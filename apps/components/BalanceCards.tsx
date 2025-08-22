import { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/lib/format";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function BalanceCards({
  accounts,
  onRefresh,
}: {
  accounts: any[];
  onRefresh: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const cards = [
    {
      id: "total-balance",
      content: (
        <View className="bg-white p-4 border border-gray-200 rounded-lg w-full">
          <View className="flex-col justify-between gap-4">
            <View className="flex-row justify-between items-center gap-2 mb-4">
              <TouchableOpacity
                onPress={() => router.push("/accounts-transactions")}
                className="mt-2 bg-primary py-2 px-4 rounded-full"
              >
                <Text className="text-white text-xs">View Account</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onRefresh}>
                <Ionicons name="refresh-outline" size={24} color="#4D9351" />
              </TouchableOpacity>
            </View>
            <View className="flex items-start mb-2">
              <View className="flex-row items-end gap-2">
                <Ionicons name="wallet-outline" size={20} color="#4D9351" />
                <Text className="text-gray-800 text-lg">Total Balance</Text>
              </View>
              <Text className="text-2xl font-bold text-primary">
                {formatCurrency(
                  accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
                )}
              </Text>
            </View>
          </View>
        </View>
      ),
    },
    {
      id: "accounts-count",
      content: (
        <View className="bg-white p-4 border border-gray-200 rounded-lg w-full">
          <Text className="text-gray-500">Accounts</Text>
          <Text className="text-2xl font-bold text-blue-500">
            {accounts.length}
          </Text>
        </View>
      ),
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View className="mb-6">
      {/* Horizontal Scroll */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={width}
        decelerationRate="fast"
      >
        {cards.map((card) => (
          <View key={card.id} style={{ width, paddingHorizontal: 16 }}>
            {card.content}
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View className="flex-row justify-center mt-3">
        {cards.map((_, idx) => (
          <View
            key={idx}
            className={`h-2 w-2 rounded-full mx-1 ${
              activeIndex === idx ? "bg-primary" : "bg-gray-300"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
