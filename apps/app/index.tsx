// import React from "react";
// import {
//   View,
//   Text,
//   ImageBackground,
//   TouchableOpacity,
//   Image,
// } from "react-native";
// import ButtonPrimary from "../components/ButtonPrimary";
// import { useRouter } from "expo-router";

// export default function WelcomeScreen() {
//   const router = useRouter();

//   return (
//     <ImageBackground
//       source={require("../assets/images/background.png")}
//       className="flex-1"
//       resizeMode="cover"
//     >
//       <View className="flex-1 justify-between px-6 py-12 bg-white/10">
//         {/* Logo */}
//         <View className="flex-1 justify-center items-center">
//           <Image
//             source={require("@/assets/images/finvault-logo.png")}
//             className="w-1/2 h-1/4"
//             resizeMode="contain"
//           />
//           {/* Tagline */}
//           <Text className="text-center text-2xl font-semibold text-gray-700 -mt-12">
//             Your money, smarter.
//           </Text>
//         </View>

//         {/* Bottom Section */}
//         <View className="mb-10">
//           <ButtonPrimary
//             title="Get Started"
//             onPress={() => router.push("/signup")}
//             className="w-full"
//           />

//           <View className="flex-row justify-center mt-4">
//             <Text className="text-gray-500">Already have an account? </Text>
//             <TouchableOpacity onPress={() => router.push("/signin")}>
//               <Text className="text-primary font-medium">Log in</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </ImageBackground>
//   );
// }
