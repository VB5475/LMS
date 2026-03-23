import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
 ActivityIndicator,
 KeyboardAvoidingView,
 Platform,
 ScrollView,
 Text,
 TextInput,
 TouchableOpacity,
 View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
 const { login, isLoading, error, clearError } = useAuth();

 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [showPass, setShowPass] = useState(false);
 const [localErr, setLocalErr] = useState("");
 useEffect(() => {
  clearError();
 }, []);
 async function handleLogin() {
  clearError();
  setLocalErr("");
  if (!email.trim()) {
   setLocalErr("Email is required");
   return;
  }
  if (!password) {
   setLocalErr("Password is required");
   return;
  }
  const ok = await login(email.trim(), password);
  if (ok) router.replace("/(tabs)");
 }

 const errMsg = localErr || error;

 return (
  <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
   <KeyboardAvoidingView
    className="flex-1"
    behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView
     className="flex-1"
     contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
     keyboardShouldPersistTaps="handled">
     <View className="px-6 py-8">
      {/* header */}
      <View className="mb-8">
       <View className="w-14 h-14 rounded-2xl bg-indigo-600 items-center justify-center mb-4">
        <Ionicons name="school" size={28} color="white" />
       </View>
       <Text className="text-3xl font-bold text-gray-900">Welcome back</Text>
       <Text className="text-gray-500 mt-1">Sign in to continue learning</Text>
      </View>

      {/* form */}
      <View className="gap-4">
       <View>
        <Text className="text-gray-700 font-medium mb-2 text-sm">Email</Text>
        <TextInput
         className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
         placeholder="you@example.com"
         placeholderTextColor="#9ca3af"
         value={email}
         onChangeText={setEmail}
         keyboardType="email-address"
         autoCapitalize="none"
         autoCorrect={false}
        />
       </View>

       <View>
        <Text className="text-gray-700 font-medium mb-2 text-sm">Password</Text>
        <View className="relative">
         <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 pr-12"
          placeholder="Enter password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPass}
         />
         <TouchableOpacity
          onPress={() => setShowPass(!showPass)}
          className="absolute right-4 top-3.5">
          <Ionicons
           name={showPass ? "eye-off-outline" : "eye-outline"}
           size={20}
           color="#9ca3af"
          />
         </TouchableOpacity>
        </View>
       </View>

       {errMsg ? (
        <View className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
         <Text className="text-red-600 text-sm">{errMsg}</Text>
        </View>
       ) : null}

       <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoading}
        className="bg-indigo-600 rounded-xl py-4 items-center mt-2"
        activeOpacity={0.8}>
        {isLoading ? (
         <ActivityIndicator color="white" />
        ) : (
         <Text className="text-white font-semibold text-base">Sign in</Text>
        )}
       </TouchableOpacity>
      </View>

      {/* footer */}
      <View className="flex-row justify-center mt-8">
       <Text className="text-gray-500">Don't have an account? </Text>
       <TouchableOpacity onPress={() => router.push("/register")}>
        <Text className="text-indigo-600 font-semibold">Register</Text>
       </TouchableOpacity>
      </View>
     </View>
    </ScrollView>
   </KeyboardAvoidingView>
  </SafeAreaView>
 );
}
