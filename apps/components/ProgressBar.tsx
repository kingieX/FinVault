import React from "react";
import { View } from "react-native";

interface ProgressBarProps {
  progress: number; // value between 0 and 1
  color?: string; // Tailwind class e.g. "bg-green-500"
}

export default function ProgressBar({
  progress,
  color = "bg-green-500",
}: ProgressBarProps) {
  return (
    <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <View
        className={`h-2 ${color}`}
        style={{ width: `${Math.min(progress * 100, 100)}%` }}
      />
    </View>
  );
}
