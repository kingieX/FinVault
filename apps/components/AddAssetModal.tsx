import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  createPortfolio,
  fetchCryptoList,
  fetchStockList,
  getAssetPrice,
} from "@/lib/api";

export default function AddAssetModal({ visible, onClose, onSuccess }: any) {
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState<"stock" | "crypto">("stock");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [loading, setLoading] = useState(false);

  const [assetList, setAssetList] = useState<any[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      if (assetType === "crypto") {
        const list = await fetchCryptoList();
        setAssetList(list);
      } else {
        const list = await fetchStockList();
        setAssetList(list);
      }
    }
    loadAssets();
  }, [assetType]);

  function handleSearch(text: string) {
    setAssetName(text);
    if (!text) {
      setFilteredAssets([]);
      setShowDropdown(false);
      return;
    }
    const filtered = assetList.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredAssets(filtered.slice(0, 10));
    setShowDropdown(true);
  }

  async function handleSelectAsset(item: any) {
    setAssetName(item.name);
    setSymbol(item.symbol);
    setShowDropdown(false);

    // Auto fetch current price
    const price = await getAssetPrice(assetType, item.symbol);
    if (price) setPurchasePrice(price.toString());
  }

  async function handleSave() {
    if (!assetName || !assetType || !symbol || !quantity || !purchasePrice) {
      Toast.show({ type: "error", text1: "Fill all fields" });
      return;
    }
    try {
      setLoading(true);
      await createPortfolio({
        asset_name: assetName,
        asset_type: assetType,
        symbol,
        quantity: Number(quantity),
        purchase_price: Number(purchasePrice),
      });
      Toast.show({ type: "success", text1: "Asset added" });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      Toast.show({ type: "error", text1: "Error adding asset" });
      console.error("Error adding asset:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white w-full p-6 rounded-lg">
          <Text className="text-xl font-medium mb-4">Add Asset</Text>

          <Text className="mb-1">Type</Text>
          <View className="flex-row mb-4">
            {["stock", "crypto"].map((t) => (
              <TouchableOpacity
                key={t}
                className={`px-4 py-2 mr-2 rounded-lg border ${assetType === t ? "border-primary" : "border-gray-300"}`}
                onPress={() => setAssetType(t as any)}
              >
                <Text>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mb-1">Asset Name</Text>
          <TextInput
            value={assetName}
            onChangeText={handleSearch}
            placeholder="Search asset..."
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
          />
          {showDropdown && (
            <FlatList
              data={filteredAssets}
              keyExtractor={(item) => item.symbol}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectAsset(item)}
                  className="p-3 border-b border-gray-200"
                >
                  <Text>
                    {item.name} ({item.symbol})
                  </Text>
                </TouchableOpacity>
              )}
              style={{
                maxHeight: 150,
                backgroundColor: "white",
                marginBottom: 10,
              }}
            />
          )}

          <Text className="mb-1">Symbol</Text>
          <TextInput
            value={symbol}
            onChangeText={setSymbol}
            placeholder="e.g. AAPL or bitcoin"
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
          />

          <Text className="mb-1">Quantity</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g. 10"
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
          />

          <Text className="mb-1">Purchase Price (USD)</Text>
          <TextInput
            value={purchasePrice}
            onChangeText={setPurchasePrice}
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
          />

          <TouchableOpacity
            className="bg-primary py-4 rounded-lg items-center"
            onPress={handleSave}
            disabled={loading}
          >
            <Text className="text-white font-medium">
              {loading ? "Saving..." : "Save Asset"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-3 py-4 rounded-lg items-center border border-gray-300"
            onPress={onClose}
          >
            <Text className="text-gray-700 font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
