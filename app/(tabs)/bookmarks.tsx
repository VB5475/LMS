import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import CourseCard from "../../components/CourseCard";
import { useCourses } from "../../context/CourseContext";
import { Course } from "../../types";

export default function BookmarksScreen() {
 const { courses, instructors, bookmarks, toggleBookmark, isEnrolled } =
  useCourses();

 const bookmarkedCourses = useMemo(
  () => courses.filter((c) => bookmarks.includes(c.videoId)),
  [courses, bookmarks],
 );

 function getInstructor(index: number) {
  if (!instructors.length) return undefined;
  return instructors[index % instructors.length];
 }

 function renderItem({ item, index }: { item: Course; index: number }) {
  return (
   <CourseCard
    course={item}
    instructor={getInstructor(index)}
    isBookmarked={true}
    isEnrolled={isEnrolled(item.videoId)}
    onBookmark={toggleBookmark}
   />
  );
 }

 return (
  <View className="flex-1 bg-gray-50">
   <StatusBar style="dark" />

   <View className="bg-white px-4 pt-14 pb-4 border-b border-gray-100">
    <Text className="text-2xl font-bold text-gray-900">Bookmarks</Text>
    <Text className="text-gray-400 text-sm mt-0.5">
     {bookmarkedCourses.length} saved course
     {bookmarkedCourses.length !== 1 ? "s" : ""}
    </Text>
   </View>

   {bookmarkedCourses.length === 0 ? (
    <View className="flex-1 items-center justify-center px-8">
     <Ionicons name="bookmark-outline" size={56} color="#d1d5db" />
     <Text className="text-gray-700 font-semibold text-lg mt-4">
      No bookmarks yet
     </Text>
     <Text className="text-gray-400 text-sm text-center mt-2">
      Tap the bookmark icon on any course to save it here
     </Text>
    </View>
   ) : (
    <FlatList
     data={bookmarkedCourses}
     keyExtractor={(item) => `bm-${item.videoId}`}
     renderItem={renderItem}
     contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
     showsVerticalScrollIndicator={false}
     removeClippedSubviews
     maxToRenderPerBatch={6}
     initialNumToRender={5}
    />
   )}
  </View>
 );
}
