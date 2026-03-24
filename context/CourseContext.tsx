import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
 createContext,
 useCallback,
 useContext,
 useEffect,
 useReducer,
} from "react";
import { courseApi } from "../lib/api";
import { scheduleBookmarkNotification } from "../lib/notifications";
import { Course, EnrolledCourse, Instructor } from "../types";

const SAVED_COURSES_KEY = "saved_courses_v3";
const ENROLLED_KEY = "enrolled_courses_v2";

interface CourseState {
 courses: Course[];
 instructors: Instructor[];
 savedCourses: string[];
 enrolled: EnrolledCourse[];
 isLoading: boolean;
 isRefreshing: boolean;
 error: string | null;
 page: number;
 hasMore: boolean;
}

type CourseAction =
 | { type: "SET_LOADING"; payload: boolean }
 | { type: "SET_REFRESHING"; payload: boolean }
 | {
    type: "SET_COURSES";
    payload: { courses: Course[]; hasMore: boolean; page: number };
   }
 | {
    type: "APPEND_COURSES";
    payload: { courses: Course[]; hasMore: boolean; page: number };
   }
 | { type: "SET_INSTRUCTORS"; payload: Instructor[] }
 | { type: "SET_SAVED_COURSES"; payload: string[] }
 | { type: "TOGGLE_SAVED_COURSE"; payload: string }
 | { type: "SET_ENROLLED"; payload: EnrolledCourse[] }
 | { type: "ENROLL_COURSE"; payload: EnrolledCourse }
 | { type: "SET_ERROR"; payload: string | null }
 | {
    type: "UPDATE_PROGRESS";
    payload: {
     courseId: string;
     progress: number;
     completedSections?: number[];
    };
   };

function courseReducer(state: CourseState, action: CourseAction): CourseState {
 switch (action.type) {
  case "SET_LOADING":
   return { ...state, isLoading: action.payload };
  case "SET_REFRESHING":
   return { ...state, isRefreshing: action.payload };
  case "SET_COURSES":
   return {
    ...state,
    courses: action.payload.courses,
    hasMore: action.payload.hasMore,
    page: action.payload.page,
    isLoading: false,
    isRefreshing: false,
    error: null,
   };
  case "APPEND_COURSES":
   return {
    ...state,
    courses: [...state.courses, ...action.payload.courses],
    hasMore: action.payload.hasMore,
    page: action.payload.page,
    isLoading: false,
   };
  case "SET_INSTRUCTORS":
   return { ...state, instructors: action.payload };
  case "SET_SAVED_COURSES":
   return { ...state, savedCourses: action.payload };
  case "TOGGLE_SAVED_COURSE": {
   const id = action.payload;
   const exists = state.savedCourses.includes(id);
   const updated = exists
    ? state.savedCourses.filter((b) => b !== id)
    : [...state.savedCourses, id];
   return { ...state, savedCourses: updated };
  }
  case "SET_ENROLLED":
   return { ...state, enrolled: action.payload };
  case "ENROLL_COURSE": {
   const already = state.enrolled.find(
    (e) => e.courseId === action.payload.courseId,
   );
   if (already) return state;
   return { ...state, enrolled: [...state.enrolled, action.payload] };
  }
  case "SET_ERROR":
   return {
    ...state,
    error: action.payload,
    isLoading: false,
    isRefreshing: false,
   };
  case "UPDATE_PROGRESS": {
   const updated = state.enrolled.map((e) =>
    e.courseId === action.payload.courseId
     ? {
        ...e,
        progress: action.payload.progress,
        completedSections:
         action.payload.completedSections ?? e.completedSections,
       }
     : e,
   );
   return { ...state, enrolled: updated };
  }
  default:
   return state;
 }
}

interface CourseContextType extends CourseState {
 fetchCourses: (refresh?: boolean) => Promise<void>;
 loadMore: () => Promise<void>;
 toggleSaveCourse: (courseId: string) => Promise<void>;
 enrollCourse: (courseId: string) => Promise<void>;
 isEnrolled: (courseId: string) => boolean;
 isSaved: (courseId: string) => boolean;
 updateProgress: (courseId: string, progress: number) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | null>(null);

function parseVideo(item: any): Course | null {
 try {
  if (!item || typeof item !== "object") return null;

  const payload = item.items ?? item;

  const videoId =
   typeof payload.id === "string" ? payload.id : (payload.id?.videoId ?? null);

  if (!videoId) return null;

  const snippet = payload.snippet ?? {};
  const statistics = payload.statistics ?? {};
  const thumbnails = snippet.thumbnails ?? {};

  return {
   _id: videoId,
   videoId: String(videoId),
   snippet: {
    publishedAt: snippet.publishedAt ?? "",
    channelId: snippet.channelId ?? "",
    title: snippet.title ?? "Untitled",
    description: snippet.description ?? "",
    channelTitle: snippet.channelTitle ?? "Unknown Channel",
    thumbnails,
    tags: snippet.tags ?? [],
    categoryId: snippet.categoryId,
   },
   statistics: {
    viewCount: statistics.viewCount,
    likeCount: statistics.likeCount,
    commentCount: statistics.commentCount,
    favoriteCount: statistics.favoriteCount,
   },
  };
 } catch {
  return null;
 }
}
export function CourseProvider({ children }: { children: React.ReactNode }) {
 const [state, dispatch] = useReducer(courseReducer, {
  courses: [],
  instructors: [],
  savedCourses: [],
  enrolled: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  page: 1,
  hasMore: true,
 });

 useEffect(() => {
  loadPersistedData();
 }, []);

 async function loadPersistedData() {
  try {
   const bm = await AsyncStorage.getItem(SAVED_COURSES_KEY);
   if (bm) dispatch({ type: "SET_SAVED_COURSES", payload: JSON.parse(bm) });

   const en = await AsyncStorage.getItem(ENROLLED_KEY);
   if (en) dispatch({ type: "SET_ENROLLED", payload: JSON.parse(en) });
  } catch {}
 }

 const fetchCourses = useCallback(async (refresh = false) => {
  if (refresh) {
   dispatch({ type: "SET_REFRESHING", payload: true });
  } else {
   dispatch({ type: "SET_LOADING", payload: true });
  }

  try {
   const [videosRes, instructorsRes] = await Promise.all([
    courseApi.getCourses(1, 20),
    courseApi.getInstructors(1, 20),
   ]);

   const rawVideos: any[] = videosRes?.data?.data || [];
   console.log("see the rawVideos:", rawVideos);
   const courses: Course[] = rawVideos
    .map(parseVideo)
    .filter((c): c is Course => c !== null && !!c.videoId)
    .filter(
     (c, index, self) =>
      index === self.findIndex((t) => t.videoId === c.videoId),
    );

   const instructors: Instructor[] = instructorsRes?.data?.data || [];
   console.log("see the courses:", courses);
   dispatch({
    type: "SET_COURSES",
    payload: {
     courses,
     hasMore: videosRes?.data?.hasNextPage || false,
     page: 1,
    },
   });
   dispatch({ type: "SET_INSTRUCTORS", payload: instructors });
  } catch (err: any) {
   dispatch({
    type: "SET_ERROR",
    payload: err.message || "Failed to load courses",
   });
  }
 }, []);

 const loadMore = useCallback(async () => {
  if (!state.hasMore || state.isLoading) return;
  dispatch({ type: "SET_LOADING", payload: true });
  try {
   const nextPage = state.page + 1;
   const res = await courseApi.getCourses(nextPage, 20);
   const rawVideos: any[] = res?.data?.data || [];
   const courses: Course[] = rawVideos
    .map(parseVideo)
    .filter((c): c is Course => c !== null && !!c.videoId)
    .filter(
     (c, index, self) =>
      index === self.findIndex((t) => t.videoId === c.videoId),
    );
   dispatch({
    type: "APPEND_COURSES",
    payload: {
     courses,
     hasMore: res?.data?.hasNextPage || false,
     page: nextPage,
    },
   });
  } catch (err: any) {
   dispatch({ type: "SET_ERROR", payload: err.message });
  }
 }, [state.page, state.hasMore, state.isLoading]);

 const toggleSaveCourse = useCallback(async (courseId: string) => {
  try {
   const stored = await AsyncStorage.getItem(SAVED_COURSES_KEY);
   const current: string[] = stored ? JSON.parse(stored) : [];

   const exists = current.includes(courseId);
   const updated = exists
    ? current.filter((b) => b !== courseId)
    : [...current, courseId];

   dispatch({ type: "SET_SAVED_COURSES", payload: updated });
   await AsyncStorage.setItem(SAVED_COURSES_KEY, JSON.stringify(updated));

   console.log("exists:", exists, "| updated.length:", updated.length);

   if (!exists && updated.length >= 5) {
    await scheduleBookmarkNotification(updated.length);
   }
  } catch (err) {
   console.log("toggleSaveCourse error:", err);
  }
 }, []);

 const enrollCourse = useCallback(
  async (courseId: string) => {
   const newEnrollment: EnrolledCourse = {
    courseId,
    enrolledAt: new Date().toISOString(),
    progress: 0,
   };
   dispatch({ type: "ENROLL_COURSE", payload: newEnrollment });
   const updated = [...state.enrolled, newEnrollment];
   await AsyncStorage.setItem(ENROLLED_KEY, JSON.stringify(updated));
  },
  [state.enrolled],
 );

 const isEnrolled = useCallback(
  (courseId: string) => state.enrolled.some((e) => e.courseId === courseId),
  [state.enrolled],
 );

 const isSaved = useCallback(
  (courseId: string) => state.savedCourses.includes(courseId),
  [state.savedCourses],
 );

 const updateProgress = useCallback(
  async (courseId: string, progress: number, completedSections?: number[]) => {
   try {
    const stored = await AsyncStorage.getItem(ENROLLED_KEY);
    const current: EnrolledCourse[] = stored ? JSON.parse(stored) : [];
    const updated = current.map((e) =>
     e.courseId === courseId
      ? { ...e, progress, ...(completedSections && { completedSections }) }
      : e,
    );
    dispatch({
     type: "UPDATE_PROGRESS",
     payload: { courseId, progress, completedSections },
    });
    await AsyncStorage.setItem(ENROLLED_KEY, JSON.stringify(updated));
   } catch (err) {
    console.log("updateProgress error:", err);
   }
  },
  [],
 );

 return (
  <CourseContext.Provider
   value={{
    ...state,
    fetchCourses,
    loadMore,
    toggleSaveCourse,
    enrollCourse,
    updateProgress,
    isEnrolled,
    isSaved,
   }}>
   {children}
  </CourseContext.Provider>
 );
}

export function useCourses() {
 const ctx = useContext(CourseContext);
 if (!ctx) throw new Error("useCourses must be inside CourseProvider");
 return ctx;
}
