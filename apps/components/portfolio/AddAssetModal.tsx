import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from "react-native";

export default function AddAssetModal({
  visible,
  onClose,
  searchQuery,
  onSearch,
  searchResults,
  selectedAsset,
  setSelectedAsset,
  quantity,
  setQuantity,
  amount,
  setAmount,
  onAdd,
}: any) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/40 justify-center px-6">
            <View className="bg-white rounded-lg p-6">
              <Text className="text-xl font-bold mb-4">Add Asset</Text>

              {/* Search Input */}
              <TextInput
                placeholder="Search asset (BTC, ETH...)"
                value={searchQuery}
                onChangeText={onSearch}
                className="border border-gray-300 rounded-lg p-3 mb-3 placeholder:text-gray-500"
              />

              {/* Search Results */}
              {searchResults.map((asset: any) => (
                <TouchableOpacity
                  key={asset.id}
                  className={`p-2 border-b border-gray-200 ${
                    selectedAsset?.id === asset.id ? "bg-green-100" : ""
                  }`}
                  onPress={() => {
                    setSelectedAsset(asset);
                    Keyboard.dismiss();
                  }}
                >
                  <Text className="font-semibold">{asset.name}</Text>
                  <Text className="text-gray-500">{asset.symbol}</Text>
                </TouchableOpacity>
              ))}

              {/* Quantity or Amount */}
              <TextInput
                placeholder="Quantity (e.g. 0.5)"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg p-3 mb-3 placeholder:text-gray-500"
              />
              <TextInput
                placeholder="Amount in USD (e.g. 500)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg p-3 mb-3 placeholder:text-gray-500"
              />

              {/* Buttons */}
              <View className="flex-row justify-end">
                <TouchableOpacity onPress={onClose} className="px-4 py-2 mr-2">
                  <Text className="text-gray-600">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onAdd}
                  className="px-4 py-2 bg-primary rounded-lg"
                >
                  <Text className="text-white">Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
