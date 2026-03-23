import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
} from "react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCourses } from "../../context/CourseContext";
import { courseApi } from "../../lib/api";
import {
  Course,
  getCourseTitle,
  getCourseDescription,
  getCourseThumbnail,
  getCourseChannel,
  getCourseViews,
  getYoutubeUrl,
} from "../../types";
import { getInstructorName, getInstructorAvatar } from "../../lib/instructorUtils";
import { StatusBar } from "expo-status-bar";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const {
    courses,
    instructors,
    toggleBookmark,
    isBookmarked,
    enrollCourse,
    isEnrolled,
  } = useCourses();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  const videoId = id ?? "";
  const bookmarked = isBookmarked(videoId);
  const enrolled = isEnrolled(videoId);

  const instructor = instructors.length
    ? instructors[Math.abs(videoId.charCodeAt(0) || 0) % instructors.length]
    : null;

  const instructorName = getInstructorName(instructor) || getCourseChannel(course!);
  const avatarUrl = getInstructorAvatar(instructor);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => toggleBookmark(videoId)}
          style={{ marginRight: 4, padding: 4 }}
        >
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={bookmarked ? "#6366f1" : "#374151"}
          />
        </TouchableOpacity>
      ),
    });
  }, [bookmarked, videoId]);

  useEffect(() => {
    // try from cache first
    const cached = courses.find((c) => c.videoId === videoId);
    if (cached) {
      setCourse(cached);
      return;
    }
    loadCourse();
  }, [videoId]);

  async function loadCourse() {
    setLoading(true);
    setError("");
    try {
      const res = await courseApi.getCourseById(videoId);
      // api might return the video directly or nested under data
      const raw = res?.data || res;
      if (raw) {
        const videoIdVal = raw.videoId || raw.id?.videoId || raw._id || videoId;
        setCourse({
          _id: raw._id || videoIdVal,
          videoId: String(videoIdVal),
          snippet: raw.snippet || {},
          statistics: raw.statistics || {},
        });
      } else {
        setError("Video not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll() {
    if (enrolled) return;
    setEnrolling(true);
    await enrollCourse(videoId);
    setEnrolling(false);
    Alert.alert("Enrolled! 🎉", "You can now watch this course.", [{ text: "Got it" }]);
  }

  async function handleWatch() {
    if (!course) return;
    const url = getYoutubeUrl(course);
    // open in webview first, fallback to youtube app/browser
    router.push({
      pathname: "/webview",
      params: {
        courseId: videoId,
        title: getCourseTitle(course),
        category: course.snippet?.tags?.[0] || "Video",
        instructor: instructorName,
        youtubeUrl: url,
      },
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.center}>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={52} color="#d1d5db" />
        <Text style={styles.errorText}>{error || "Video not found"}</Text>
        <TouchableOpacity onPress={loadCourse} style={styles.retryBtn}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = getCourseTitle(course);
  const description = getCourseDescription(course);
  const thumbnail = getCourseThumbnail(course);
  const views = getCourseViews(course);
  const channel = getCourseChannel(course);
  const tags = course.snippet?.tags?.slice(0, 3) || [];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* thumbnail */}
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Ionicons name="play-circle-outline" size={64} color="#d1d5db" />
          </View>
        )}

        <View style={styles.content}>
          {/* tags */}
          {tags.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={styles.tagRow}>
                {tags.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <Text style={styles.title}>{title}</Text>

          {/* stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color="#6366f1" />
              <Text style={styles.statText}>{views} views</Text>
            </View>
            {course.statistics?.likeCount && (
              <View style={styles.statItem}>
                <Ionicons name="thumbs-up-outline" size={14} color="#6366f1" />
                <Text style={styles.statText}>
                  {getCourseViews({ ...course, statistics: { viewCount: course.statistics.likeCount } })} likes
                </Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons name="logo-youtube" size={14} color="#ef4444" />
              <Text style={styles.statText}>YouTube</Text>
            </View>
          </View>

          {/* instructor / channel */}
          <View style={styles.instructorCard}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {instructorName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.instructorName}>{instructorName}</Text>
              <Text style={styles.channelName}>{channel}</Text>
            </View>
            <View style={styles.instructorBadge}>
              <Text style={styles.instructorBadgeText}>Instructor</Text>
            </View>
          </View>

          {/* description */}
          <Text style={styles.description}>{description}</Text>

          {/* watch button */}
          <TouchableOpacity
            onPress={handleWatch}
            style={styles.watchBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle" size={22} color="white" />
            <Text style={styles.watchBtnText}>Watch Course</Text>
          </TouchableOpacity>

          {/* enroll button */}
          <TouchableOpacity
            onPress={handleEnroll}
            disabled={enrolled || enrolling}
            style={[styles.enrollBtn, enrolled && styles.enrolledBtn]}
            activeOpacity={0.85}
          >
            {enrolling ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons
                  name={enrolled ? "checkmark-circle" : "add-circle-outline"}
                  size={20}
                  color="white"
                />
                <Text style={styles.enrollBtnText}>
                  {enrolled ? "Enrolled" : "Enroll Now"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  hero: {
    width: "100%",
    height: 220,
    backgroundColor: "#f3f4f6",
  },
  heroPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    backgroundColor: "#eef2ff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  tagText: {
    color: "#6366f1",
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 28,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  instructorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#6366f1",
    fontWeight: "700",
    fontSize: 18,
  },
  instructorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  channelName: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  instructorBadge: {
    backgroundColor: "#eef2ff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  instructorBadgeText: {
    color: "#6366f1",
    fontSize: 11,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
    marginBottom: 20,
  },
  watchBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  watchBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
  enrollBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  enrolledBtn: {
    backgroundColor: "#22c55e",
  },
  enrollBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
});
