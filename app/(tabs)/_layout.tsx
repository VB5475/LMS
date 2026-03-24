import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCourses } from "../../context/CourseContext";

export default function TabsLayout() {
 const { courses, savedCourses, enrolled } = useCourses();
 const insets = useSafeAreaInsets();
 const allCount = useMemo(() => {
  const enrolledIds = new Set(enrolled.map((e) => e.courseId));
  const savedSet = new Set(savedCourses);
  return courses.filter(
   (c) => savedSet.has(c.videoId) || enrolledIds.has(c.videoId),
  ).length;
 }, [courses, savedCourses, enrolled]);
 return (
  <Tabs
   screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: "#6366f1",
    tabBarInactiveTintColor: "#9ca3af",
    tabBarStyle: {
     borderTopColor: "#f3f4f6",
     borderTopWidth: 1,
     paddingBottom: insets.bottom || 6,
     //  marginBottom: 10,
     paddingTop: 6,
     height: 60 + insets.bottom,
    },
    tabBarLabelStyle: {
     fontSize: 11,
     fontWeight: "500",
    },
   }}>
   <Tabs.Screen
    name="index"
    options={{
     title: "Courses",
     tabBarIcon: ({ color, focused }) => (
      <Ionicons
       name={focused ? "library" : "library-outline"}
       size={22}
       color={color}
      />
     ),
    }}
   />
   <Tabs.Screen
    name="YourCourses"
    options={{
     title: "Your Courses",
     tabBarBadge: allCount > 0 ? allCount : undefined,
     tabBarBadgeStyle: { backgroundColor: "#6366f1", fontSize: 10 },
     tabBarIcon: ({ color, focused }) => (
      <Ionicons
       name={focused ? "bookmark" : "bookmark-outline"}
       size={22}
       color={color}
      />
     ),
    }}
   />
   <Tabs.Screen
    name="profile"
    options={{
     title: "Profile",
     tabBarIcon: ({ color, focused }) => (
      <Ionicons
       name={focused ? "person" : "person-outline"}
       size={22}
       color={color}
      />
     ),
    }}
   />
  </Tabs>
 );
}
