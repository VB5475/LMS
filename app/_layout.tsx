import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { CourseProvider } from "../context/CourseContext";
import "../global.css";
import { handleAppOpenNotification } from "../lib/notifications";

function AuthGuard({ children }: { children: React.ReactNode }) {
 const { isLoggedIn, isLoading } = useAuth();
 const segments = useSegments();

 useEffect(() => {
  if (isLoading) return;

  const inAuthGroup = segments[0] === "(auth)";

  if (!isLoggedIn && !inAuthGroup) {
   router.replace("/(auth)/login");
  } else if (isLoggedIn && inAuthGroup) {
   router.replace("/(tabs)");
  }
 }, [isLoggedIn, isLoading, segments]);

 if (isLoading) {
  return (
   <View
    style={{
     flex: 1,
     alignItems: "center",
     justifyContent: "center",
     backgroundColor: "#fff",
    }}>
    <ActivityIndicator size="large" color="#6366f1" />
   </View>
  );
 }

 return <>{children}</>;
}

export default function RootLayout() {
 useEffect(() => {
  handleAppOpenNotification().catch(() => {});
 }, []);

 return (
  <AuthProvider>
   <CourseProvider>
    <AuthGuard>
     <StatusBar style="dark" />
     <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen
       name="course/[id]"
       options={{
        presentation: "card",
        headerShown: true,
        headerTitle: "",
        headerBackTitle: "",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#374151",
       }}
      />
      <Stack.Screen name="webview" options={{ presentation: "card" }} />
     </Stack>
    </AuthGuard>
   </CourseProvider>
  </AuthProvider>
 );
}
