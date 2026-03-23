import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { StatusBar } from "expo-status-bar";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { bookmarks, enrolled } = useCourses();

  function handleLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: logout,
      },
    ]);
  }

  const avatarUrl = user?.avatar?.url;
  const initials = user?.username?.slice(0, 2).toUpperCase() || "??";

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* profile header */}
      <View className="bg-white px-4 pt-16 pb-6 items-center border-b border-gray-100">
        <View className="relative mb-3">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-indigo-100 items-center justify-center">
              <Text className="text-indigo-600 text-2xl font-bold">
                {initials}
              </Text>
            </View>
          )}
        </View>

        <Text className="text-xl font-bold text-gray-900">
          {user?.username || "User"}
        </Text>
        <Text className="text-gray-400 text-sm mt-0.5">{user?.email}</Text>

        <View className="flex-row gap-8 mt-5">
          <View className="items-center">
            <Text className="text-2xl font-bold text-indigo-600">
              {enrolled.length}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">Enrolled</Text>
          </View>
          <View className="w-px bg-gray-100" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-indigo-600">
              {bookmarks.length}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">Bookmarked</Text>
          </View>
          <View className="w-px bg-gray-100" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-indigo-600">
              {enrolled.filter((e) => e.progress === 100).length}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">Completed</Text>
          </View>
        </View>
      </View>

      {/* menu items */}
      <View className="mx-4 mt-6 bg-white rounded-2xl overflow-hidden border border-gray-100">
        <MenuItem
          icon="person-outline"
          label="Edit Profile"
          onPress={() => {}}
        />
        <View className="h-px bg-gray-50 ml-14" />
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() => {}}
        />
        <View className="h-px bg-gray-50 ml-14" />
        <MenuItem
          icon="shield-outline"
          label="Privacy"
          onPress={() => {}}
        />
        <View className="h-px bg-gray-50 ml-14" />
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => {}}
        />
      </View>

      <View className="mx-4 mt-4 mb-10">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 border border-red-100 rounded-2xl py-4 items-center flex-row justify-center gap-2"
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="text-red-500 font-semibold">Log out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-4"
      activeOpacity={0.7}
    >
      <View className="w-9 h-9 rounded-xl bg-indigo-50 items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#6366f1" />
      </View>
      <Text className="flex-1 text-gray-800 font-medium">{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
    </TouchableOpacity>
  );
}
