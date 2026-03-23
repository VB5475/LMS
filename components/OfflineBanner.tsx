import React from "react";
import { View, Text } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export default function OfflineBanner() {
  const { isConnected } = useNetworkStatus();

  if (isConnected !== false) return null;

  return (
    <View className="bg-red-500 px-4 py-2 items-center">
      <Text className="text-white text-xs font-medium">
        No internet connection
      </Text>
    </View>
  );
}
