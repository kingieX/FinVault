/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { addPortfolioAsset, getAssetPrice } from "@/lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { goBack } from "expo-router/build/global-state/routing";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { formatDollarCurrency } from "@/lib/format";

export default function AddTransactionScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { asset } = route.params;
  // console.log("asset: ", asset);

  const [price, setPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrice();
  }, []);

  async function fetchPrice() {
    // ✅ FIX: Check if the cmc_id exists before making the API call
    if (!asset || !asset.cmc_id) {
      console.error("No valid asset ID found for fetching price.");
      Toast.show({
        type: "error",
        text1: "Error fetching price",
        text2: "Asset ID is missing.",
      });
      return;
    }
    try {
      const { price } = await getAssetPrice(asset.cmc_id);
      setPrice(price);
    } catch (err) {
      console.error("Error fetching price:", err);
    }
  }

  function handleQuantityChange(q: string) {
    setQuantity(q);
    if (price) {
      setAmount((parseFloat(q) * price).toFixed(2));
    }
  }

  function handleAmountChange(a: string) {
    setAmount(a);
    if (price) {
      setQuantity((parseFloat(a) / price).toFixed(6));
    }
  }

  async function handleAdd() {
    setLoading(true);
    try {
      await addPortfolioAsset({
        symbol: asset.symbol,
        type: asset.type,
        quantity: parseFloat(quantity),
        amount: parseFloat(amount),
      });
      navigation.navigate("index");
      Toast.show({
        type: "success",
        text1: "Asset added",
      });
    } catch (err: any) {
      console.error("Error adding transaction:", err);
      const errorMessage = err.response?.data?.error;
      Toast.show({
        type: "error",
        text1: "Error adding transaction",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-6 py-4">
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-medium">Add Asset</Text>
        <TouchableOpacity>
          {/* <Ionicons name="refresh-outline" size={24} color="#000" /> */}
        </TouchableOpacity>
      </View>
      <View className="flex-row gap-2 justify-center items-center mb-4">
        <Image src={asset.logo_url} width={32} height={32} />
        <Text className="text-2xl font-bold">{asset.name}</Text>
        <Text className="text-2xl text-gray-500">{asset.symbol}</Text>
      </View>

      {price && (
        <Text className="text-xl text-center text-gray-600 mb-4">
          {formatDollarCurrency(price)} per coin
        </Text>
      )}

      <TextInput
        placeholder="Quantity"
        value={quantity}
        onChangeText={handleQuantityChange}
        keyboardType="numeric"
        className="border border-gray-300 rounded-lg p-3 mb-3 placeholder:text-gray-600"
      />

      <TextInput
        placeholder="Amount (USDT)"
        value={amount}
        onChangeText={handleAmountChange}
        keyboardType="numeric"
        className="border border-gray-300 rounded-lg p-3 mb-6 placeholder:text-gray-600"
      />

      <TouchableOpacity
        onPress={handleAdd}
        className={`${loading ? "bg-primary/50" : ""} bg-primary p-4 rounded-lg`}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold">
          {loading ? "Adding asset..." : "Add asset"}
          {/* Add Transaction */}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
