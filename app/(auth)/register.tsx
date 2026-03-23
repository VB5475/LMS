import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [localErr, setLocalErr] = useState("");

  function validate() {
    if (!username.trim()) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 chars";
    if (!email.trim()) return "Email is required";
    if (!email.includes("@")) return "Enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
  }

  async function handleRegister() {
    clearError();
    const err = validate();
    if (err) {
      setLocalErr(err);
      return;
    }
    setLocalErr("");

    const ok = await register(username.trim(), email.trim(), password);
    if (ok) {
      router.replace("/(tabs)");
    }
  }

  const errMsg = localErr || error;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16 pb-10">
          <View className="mb-8">
            <View className="w-14 h-14 rounded-2xl bg-indigo-600 items-center justify-center mb-4">
              <Ionicons name="school" size={28} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900">
              Create account
            </Text>
            <Text className="text-gray-500 mt-1">
              Start your learning journey today
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-gray-700 font-medium mb-2 text-sm">
                Username
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
                placeholder="johndoe"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2 text-sm">
                Email
              </Text>
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
              <Text className="text-gray-700 font-medium mb-2 text-sm">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 pr-12"
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity
                  onPress={() => setShowPass(!showPass)}
                  className="absolute right-4 top-3.5"
                >
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
              onPress={handleRegister}
              disabled={isLoading}
              className="bg-indigo-600 rounded-xl py-4 items-center mt-2"
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Create account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text className="text-indigo-600 font-semibold">Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
