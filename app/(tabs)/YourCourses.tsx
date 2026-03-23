import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import CourseCard from "../../components/CourseCard";
import { useCourses } from "../../context/CourseContext";
import { Course } from "../../types";

type TabType = "all" | "saved" | "enrolled";

export default function YourCoursesScreen() {
 const {
  courses,
  instructors,
  savedCourses,
  enrolled,
  toggleSaveCourse,
  isEnrolled,
  isSaved,
 } = useCourses();

 const [activeTab, setActiveTab] = useState<TabType>("all");

 const allCourses = useMemo(() => {
  const enrolledIds = new Set(enrolled.map((e) => e.courseId));
  const savedSet = new Set(savedCourses);
  return courses.filter(
   (c) => savedSet.has(c.videoId) || enrolledIds.has(c.videoId),
  );
 }, [courses, savedCourses, enrolled]);

 const savedCoursesList = useMemo(
  () => courses.filter((c) => savedCourses.includes(c.videoId)),
  [courses, savedCourses],
 );

 const enrolledCoursesList = useMemo(() => {
  const enrolledIds = new Set(enrolled.map((e) => e.courseId));
  return courses.filter((c) => enrolledIds.has(c.videoId));
 }, [courses, enrolled]);

 const displayedCourses = useMemo(() => {
  if (activeTab === "saved") return savedCoursesList;
  if (activeTab === "enrolled") return enrolledCoursesList;
  return allCourses;
 }, [activeTab, allCourses, savedCoursesList, enrolledCoursesList]);

 function getInstructor(index: number) {
  if (!instructors.length) return undefined;
  return instructors[index % instructors.length];
 }

 const renderItem = useCallback(
  ({ item, index }: { item: Course; index: number }) => (
   <CourseCard
    course={item}
    instructor={getInstructor(index)}
    isBookmarked={isSaved(item.videoId)}
    isEnrolled={isEnrolled(item.videoId)}
    onSave={toggleSaveCourse}
   />
  ),
  [instructors, isSaved, isEnrolled, toggleSaveCourse],
 );

 const tabs: { key: TabType; label: string; count: number }[] = [
  { key: "all", label: "All", count: allCourses.length },
  { key: "saved", label: "Saved", count: savedCoursesList.length },
  { key: "enrolled", label: "Enrolled", count: enrolledCoursesList.length },
 ];

 const emptyConfig = {
  all: {
   icon: "albums-outline" as const,
   title: "No courses yet",
   subtitle: "Save or enroll in courses to see them here",
  },
  saved: {
   icon: "bookmark-outline" as const,
   title: "No saved courses",
   subtitle: "Tap the bookmark icon on any course to save it",
  },
  enrolled: {
   icon: "school-outline" as const,
   title: "No enrolled courses",
   subtitle: "Enroll in a course to track it here",
  },
 };

 const empty = emptyConfig[activeTab];

 return (
  <View className="flex-1 bg-gray-50">
   {/* <StatusBar style="dark" /> */}

   {/* Header */}
   <View className="bg-white px-4 pt-14 pb-0 border-b border-gray-100">
    <Text className="text-2xl font-bold text-gray-900 mb-4">Your Courses</Text>

    {/* Sub-tab bar */}
    <View className="flex-row">
     {tabs.map((tab) => {
      const isActive = activeTab === tab.key;
      return (
       <TouchableOpacity
        key={tab.key}
        onPress={() => setActiveTab(tab.key)}
        className="mr-6 pb-3"
        style={{
         borderBottomWidth: isActive ? 2 : 0,
         borderBottomColor: isActive ? "#6366f1" : "transparent",
        }}>
        <View className="flex-row items-center gap-1">
         <Text
          style={{
           color: isActive ? "#6366f1" : "#9ca3af",
           fontWeight: isActive ? "700" : "500",
           fontSize: 14,
          }}>
          {tab.label}
         </Text>
         {tab.count > 0 && (
          <View
           style={{
            backgroundColor: isActive ? "#6366f1" : "#e5e7eb",
            borderRadius: 999,
            paddingHorizontal: 6,
            paddingVertical: 1,
            marginLeft: 4,
           }}>
           <Text
            style={{
             color: isActive ? "white" : "#6b7280",
             fontSize: 10,
             fontWeight: "600",
            }}>
            {tab.count}
           </Text>
          </View>
         )}
        </View>
       </TouchableOpacity>
      );
     })}
    </View>
   </View>

   {/* Content */}
   {displayedCourses.length === 0 ? (
    <View className="flex-1 items-center justify-center px-8">
     <Ionicons name={empty.icon} size={56} color="#d1d5db" />
     <Text className="text-gray-700 font-semibold text-lg mt-4 text-center">
      {empty.title}
     </Text>
     <Text className="text-gray-400 text-sm text-center mt-2">
      {empty.subtitle}
     </Text>
    </View>
   ) : (
    <FlatList
     data={displayedCourses}
     keyExtractor={(item) => `${activeTab}-${item.videoId}`}
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
