import React from "react";
import { TouchableOpacity, Text, GestureResponderEvent } from "react-native";

interface ButtonPrimaryProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  className?: string;
  disabled?: boolean;
}

export default function ButtonPrimary({
  title,
  onPress,
  className,
  disabled = false,
}: ButtonPrimaryProps) {
  return (
    <TouchableOpacity
      className={`py-4 rounded-lg items-center ${
        disabled ? "bg-gray-400" : "bg-primary"
      } ${className || ""}`}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text className="text-white text-base font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}
