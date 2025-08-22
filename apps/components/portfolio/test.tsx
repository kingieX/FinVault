import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { searchPortfolioAssets, getAllPortfolioAssets } from "@/lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { goBack } from "expo-router/build/global-state/routing";
import { Ionicons } from "@expo/vector-icons";

export default function SearchAssetScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      handleSearch(searchQuery);
    } else {
      resetAndFetch();
    }
  }, [searchQuery]);

  async function resetAndFetch() {
    setPage(0);
    setResults([]);
    setHasMore(true);
    fetchAllAssets(0);
  }

  async function fetchAllAssets(currentPage: number) {
    if (!hasMore) return;
    try {
      setLoading(true);
      const limit = 50;
      const offset = currentPage * limit;
      const res = await getAllPortfolioAssets(limit, offset);

      if (res.length < limit) setHasMore(false);

      setResults((prev) => [...prev, ...res]);
      setPage(currentPage + 1);
    } catch (err) {
      console.error("Error fetching all assets:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    try {
      setLoading(true);
      const res = await searchPortfolioAssets(query);
      setResults(res);
      setHasMore(false); // disable infinite scroll when searching
    } catch (err) {
      console.error("Error searching:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-medium">Add Asset</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Box */}
      <TextInput
        placeholder="Search asset (BTC, ETH...)"
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="border border-gray-300 rounded-lg p-3 mb-4 placeholder:text-gray-500"
      />

      {/* List */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="p-3 border-b border-gray-200"
            onPress={() =>
              navigation.navigate("AddTransaction", { asset: item })
            }
          >
            <Text className="font-semibold">{item.name}</Text>
            <Text className="text-gray-500">{item.symbol}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="small" color="#4D9351" className="mt-4" />
          ) : null
        }
        onEndReached={() => {
          if (!searchQuery && hasMore && !loading) {
            fetchAllAssets(page);
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}
