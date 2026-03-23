import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
 ActivityIndicator,
 FlatList,
 RefreshControl,
 Text,
 TextInput,
 TouchableOpacity,
 View,
} from "react-native";
import CourseCard from "../../components/CourseCard";
import OfflineBanner from "../../components/OfflineBanner";
import { useCourses } from "../../context/CourseContext";
import { Course } from "../../types";

export default function HomeScreen() {
 const {
  courses,
  instructors,
  isLoading,
  isRefreshing,
  error,
  hasMore,
  fetchCourses,
  loadMore,
  toggleBookmark,
  isBookmarked,
  isEnrolled,
 } = useCourses();

 const [searchText, setSearchText] = useState("");

 useEffect(() => {
  fetchCourses();
 }, []);

 const filteredCourses = useMemo(() => {
  if (!searchText.trim()) return courses;
  const q = searchText.toLowerCase();
  return courses.filter((c) => {
   const title = c.snippet?.title?.toLowerCase() ?? "";
   const description = c.snippet?.description?.toLowerCase() ?? "";
   const channel = c.snippet?.channelTitle?.toLowerCase() ?? "";
   const tags = c.snippet?.tags?.join(" ").toLowerCase() ?? "";
   return (
    title.includes(q) ||
    description.includes(q) ||
    channel.includes(q) ||
    tags.includes(q)
   );
  });
 }, [courses, searchText]);

 const handleRefresh = useCallback(() => {
  fetchCourses(true);
 }, [fetchCourses]);

 function getInstructor(index: number) {
  if (!instructors.length) return undefined;
  return instructors[index % instructors.length];
 }

 const renderItem = useCallback(
  ({ item, index }: { item: Course; index: number }) => (
   <CourseCard
    course={item}
    instructor={getInstructor(index)}
    isBookmarked={isBookmarked(item.videoId)}
    isEnrolled={isEnrolled(item.videoId)}
    onBookmark={toggleBookmark}
   />
  ),
  [instructors, isBookmarked, isEnrolled, toggleBookmark],
 );

 function renderEmpty() {
  if (isLoading) return null;
  return (
   <View className="flex-1 items-center justify-center py-20">
    <Ionicons name="search-outline" size={48} color="#d1d5db" />
    <Text className="text-gray-400 mt-3">
     {searchText ? "No courses found" : "No courses available"}
    </Text>
   </View>
  );
 }

 function renderFooter() {
  if (!hasMore || !courses.length) return null;
  return (
   <View className="py-4 items-center">
    <ActivityIndicator color="#6366f1" />
   </View>
  );
 }

 if (error && !courses.length) {
  return (
   <View className="flex-1 bg-gray-50 items-center justify-center px-6">
    <Ionicons name="cloud-offline-outline" size={52} color="#d1d5db" />
    <Text className="text-gray-700 font-semibold text-lg mt-4 text-center">
     Something went wrong
    </Text>
    <Text className="text-gray-400 text-sm text-center mt-1">{error}</Text>
    <TouchableOpacity
     onPress={() => fetchCourses()}
     className="bg-indigo-600 rounded-xl px-6 py-3 mt-6">
     <Text className="text-white font-semibold">Try again</Text>
    </TouchableOpacity>
   </View>
  );
 }

 return (
  <View className="flex-1 bg-gray-50">
   <StatusBar style="dark" />
   <OfflineBanner />

   {/* header */}
   <View className="bg-white px-4 pt-14 pb-4 border-b border-gray-100">
    <Text className="text-2xl font-bold text-gray-900 mb-4">
     Explore Courses
    </Text>
    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
     <Ionicons name="search-outline" size={18} color="#9ca3af" />
     <TextInput
      className="flex-1 ml-2 text-gray-900 text-sm"
      placeholder="Search courses..."
      placeholderTextColor="#9ca3af"
      value={searchText}
      onChangeText={setSearchText}
      returnKeyType="search"
     />
     {searchText.length > 0 && (
      <TouchableOpacity onPress={() => setSearchText("")}>
       <Ionicons name="close-circle" size={18} color="#9ca3af" />
      </TouchableOpacity>
     )}
    </View>
   </View>

   {isLoading && !courses.length ? (
    <View className="flex-1 items-center justify-center">
     <ActivityIndicator size="large" color="#6366f1" />
     <Text className="text-gray-400 mt-3 text-sm">Loading courses...</Text>
    </View>
   ) : (
    <FlatList
     data={filteredCourses}
     keyExtractor={(item) => `course-${item.videoId}`}
     renderItem={renderItem}
     ListEmptyComponent={renderEmpty}
     ListFooterComponent={renderFooter}
     contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
     refreshControl={
      <RefreshControl
       refreshing={isRefreshing}
       onRefresh={handleRefresh}
       tintColor="#6366f1"
       colors={["#6366f1"]}
      />
     }
     onEndReached={loadMore}
     onEndReachedThreshold={0.4}
     showsVerticalScrollIndicator={false}
     removeClippedSubviews={true}
     maxToRenderPerBatch={8}
     windowSize={10}
     initialNumToRender={6}
    />
   )}
  </View>
 );
}
