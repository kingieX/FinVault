// components/AddBudgetModal.tsx
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { createBudget } from "@/lib/api";

const colors = [
  { name: "bg-green-500", hex: "#22c55e" },
  { name: "bg-blue-500", hex: "#3b82f6" },
  { name: "bg-red-500", hex: "#ef4444" },
  { name: "bg-yellow-500", hex: "#eab308" },
];

const predefinedTags = [
  "Food",
  "Bills",
  "Transportation",
  "Entertainment",
  "Health",
  "Shopping",
  "Savings",
];

export default function AddBudgetModal({ visible, onClose, onSuccess }: any) {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [icon, setIcon] = useState("card");
  const [color, setColor] = useState(colors[0].name);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!category || !limit) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill in category and limit amount",
      });
      return;
    }

    try {
      setLoading(true);
      const now = new Date();
      await createBudget({
        category,
        limit_amount: Number(limit),
        month: now.getMonth() + 1, // current month
        year: now.getFullYear(), // current year
        icon,
        color,
        description: description || undefined,
        tags: tags.join(","),
      });

      Toast.show({
        type: "success",
        text1: "Budget Created",
      });

      // Reset form
      setCategory("");
      setLimit("");
      setIcon("card");
      setColor(colors[0].name);
      setDescription("");
      setTags([]);

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not create budget",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white w-full p-6 rounded-lg">
          <Text className="text-xl font-medium mb-4">Create New Budget</Text>

          {/* Category */}
          <Text className="mb-1 text-lg">Category Name</Text>
          <TextInput
            placeholder="e.g. Groceries"
            value={category}
            onChangeText={setCategory}
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
          />

          {/* Limit */}
          <Text className="mb-1 text-lg">Limit Amount</Text>
          <TextInput
            placeholder="e.g. 5000"
            value={limit}
            onChangeText={setLimit}
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
          />

          {/* Description */}
          <Text className="mb-1 text-lg">Description (Optional)</Text>
          <TextInput
            placeholder="Short note about this budget"
            value={description}
            onChangeText={setDescription}
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
          />

          {/* Tags */}
          <Text className="mb-1 text-lg">Tags (Optional)</Text>
          {/* <Text className="mb-1 text-lg">Tags</Text> */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {predefinedTags.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  className={`px-4 py-2 rounded-full border ${
                    selected ? "bg-primary border-primary" : "border-gray-300"
                  }`}
                  onPress={() => {
                    if (selected) {
                      setTags(tags.filter((t) => t !== tag));
                    } else {
                      setTags([...tags, tag]);
                    }
                  }}
                >
                  <Text className={selected ? "text-white" : "text-gray-700"}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Icon selector */}
          <Text className="mb-1 text-lg">Icon</Text>
          <View className="flex-row gap-3 mb-4">
            {["cart", "restaurant", "car", "film", "wallet"].map((ic) => (
              <TouchableOpacity
                key={ic}
                className={`p-2 rounded-full border ${
                  icon === ic ? "border-primary" : "border-gray-300"
                }`}
                onPress={() => setIcon(ic)}
              >
                <Ionicons name={ic as any} size={20} color="#4D9351" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Color picker */}
          <Text className="mb-1 text-lg">Color</Text>
          <View className="flex-row gap-3 mb-4">
            {colors.map((c) => (
              <TouchableOpacity
                key={c.name}
                onPress={() => setColor(c.name)}
                className={`w-8 h-8 rounded-full border-2 ${
                  color === c.name ? "border-primary" : "border-transparent"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className="bg-primary py-4 rounded-lg items-center"
            onPress={handleSave}
            disabled={loading}
          >
            <Text className="text-white font-medium">
              {loading ? "Saving..." : "Save Budget"}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
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
