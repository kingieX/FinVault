import React, { useEffect, useRef } from "react";
import { View, Text, ImageBackground, Image, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function IntroScreen() {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useEffect(() => {
    // Start the fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1, // Final value for opacity: 1
      duration: 1500, // Animation duration: 1.5 seconds
      useNativeDriver: true, // Use native driver for better performance
    }).start();

    // Navigate to the 'Welcome' screen after a delay
    const timer = setTimeout(() => {
      navigation.replace("welcome"); // Use replace to prevent going back to IntroScreen
    }, 2500); // 2.5 seconds delay (1.5s animation + 1s hold)

    return () => clearTimeout(timer); // Clean up the timer
  }, [fadeAnim, navigation]);

  return (
    <ImageBackground
      source={require("../assets/images/background.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex-1 justify-between px-6 py-12 bg-white/5">
        {/* Logo and Tagline with Fade Animation */}
        <Animated.View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            opacity: fadeAnim, // Bind opacity to animated value
          }}
        >
          <Image
            source={require("@/assets/images/finvault-logo.png")}
            className="w-1/2 h-1/4"
            resizeMode="contain"
          />
          <Text className="text-center font-semibold text-gray-700 -mt-16">
            Smarter money management, powered by you.
          </Text>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}
