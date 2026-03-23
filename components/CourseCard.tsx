import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
 getInstructorAvatar,
 getInstructorInitial,
 getInstructorName,
} from "../lib/instructorUtils";
import {
 Course,
 Instructor,
 getCourseChannel,
 getCourseDescription,
 getCourseThumbnail,
 getCourseTitle,
 getCourseViews,
} from "../types";

interface Props {
 course: Course;
 instructor?: Instructor;
 isBookmarked: boolean;
 isEnrolled: boolean;
 onBookmark: (id: string) => void;
}

function CourseCard({
 course,
 instructor,
 isBookmarked,
 isEnrolled,
 onBookmark,
}: Props) {
 const title = getCourseTitle(course);
 const description = getCourseDescription(course);
 const thumbnail = getCourseThumbnail(course);
 const channel = getCourseChannel(course);
 const views = getCourseViews(course);

 // use instructor if available, otherwise show youtube channel as instructor
 const instructorName = instructor ? getInstructorName(instructor) : channel;
 const avatarUrl = instructor ? getInstructorAvatar(instructor) : null;
 const initial = instructor
  ? getInstructorInitial(instructor)
  : channel.charAt(0).toUpperCase();

 function handlePress() {
  router.push({
   pathname: "/course/[id]",
   params: { id: course.videoId },
  });
 }

 return (
  <TouchableOpacity
   onPress={handlePress}
   activeOpacity={0.85}
   className="bg-white rounded-2xl mx-4 mb-4 overflow-hidden border border-gray-100"
   style={styles.card}>
   {/* thumbnail */}
   <View>
    {thumbnail ? (
     <Image
      source={{ uri: thumbnail }}
      style={styles.thumbnail}
      resizeMode="cover"
     />
    ) : (
     <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
      <Ionicons name="play-circle-outline" size={48} color="#d1d5db" />
     </View>
    )}

    {/* bookmark */}
    <TouchableOpacity
     onPress={() => onBookmark(course.videoId)}
     style={styles.bookmarkBtn}
     hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
     <Ionicons
      name={isBookmarked ? "bookmark" : "bookmark-outline"}
      size={18}
      color={isBookmarked ? "#6366f1" : "#9ca3af"}
     />
    </TouchableOpacity>

    {isEnrolled && (
     <View style={styles.enrolledBadge}>
      <Text style={styles.enrolledText}>Enrolled</Text>
     </View>
    )}

    {/* views badge */}
    {views !== "0" && (
     <View style={styles.viewsBadge}>
      <Ionicons name="eye-outline" size={10} color="white" />
      <Text style={styles.viewsText}> {views}</Text>
     </View>
    )}
   </View>

   {/* content */}
   <View className="p-4">
    <Text
     className="text-gray-900 font-semibold text-base mb-1"
     numberOfLines={2}>
     {title}
    </Text>
    <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>
     {description}
    </Text>

    <View style={styles.footer}>
     <View style={styles.instructorRow}>
      {avatarUrl ? (
       <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
      ) : (
       <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>{initial}</Text>
       </View>
      )}
      <Text
       className="text-gray-600 text-xs"
       numberOfLines={1}
       style={{ maxWidth: 130 }}>
       {instructorName}
      </Text>
     </View>

     <View style={styles.playRow}>
      <Ionicons name="logo-youtube" size={14} color="#ef4444" />
      <Text className="text-gray-400 text-xs" style={{ marginLeft: 4 }}>
       Watch
      </Text>
     </View>
    </View>
   </View>
  </TouchableOpacity>
 );
}

const styles = StyleSheet.create({
 card: {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
 },
 thumbnail: {
  width: "100%",
  height: 180,
  backgroundColor: "#f3f4f6",
 },
 thumbnailPlaceholder: {
  alignItems: "center",
  justifyContent: "center",
 },
 bookmarkBtn: {
  position: "absolute",
  top: 12,
  right: 12,
  backgroundColor: "white",
  borderRadius: 999,
  padding: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
 },
 enrolledBadge: {
  position: "absolute",
  top: 12,
  left: 12,
  backgroundColor: "#22c55e",
  borderRadius: 999,
  paddingHorizontal: 8,
  paddingVertical: 4,
 },
 enrolledText: {
  color: "white",
  fontSize: 11,
  fontWeight: "600",
 },
 viewsBadge: {
  position: "absolute",
  bottom: 10,
  right: 10,
  backgroundColor: "rgba(0,0,0,0.6)",
  borderRadius: 6,
  paddingHorizontal: 6,
  paddingVertical: 3,
  flexDirection: "row",
  alignItems: "center",
 },
 viewsText: {
  color: "white",
  fontSize: 10,
 },
 footer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
 },
 instructorRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  flex: 1,
 },
 avatarImg: {
  width: 22,
  height: 22,
  borderRadius: 11,
 },
 avatarPlaceholder: {
  width: 22,
  height: 22,
  borderRadius: 11,
  backgroundColor: "#e0e7ff",
  alignItems: "center",
  justifyContent: "center",
 },
 avatarInitial: {
  color: "#6366f1",
  fontSize: 10,
  fontWeight: "700",
 },
 playRow: {
  flexDirection: "row",
  alignItems: "center",
 },
});

export default memo(CourseCard, (prev, next) => {
 return (
  prev.isBookmarked === next.isBookmarked &&
  prev.isEnrolled === next.isEnrolled &&
  prev.course.videoId === next.course.videoId
 );
});
