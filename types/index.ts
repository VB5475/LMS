export interface User {
 _id: string;
 username: string;
 email: string;
 avatar: {
  url: string;
  localPath: string;
 };
 role: string;
 isEmailVerified: boolean;
 createdAt: string;
 updatedAt: string;
}

export interface AuthTokens {
 accessToken: string;
 refreshToken: string;
}

export interface LoginPayload {
 email: string;
 password: string;
}

export interface RegisterPayload {
 email: string;
 password: string;
 username: string;
}

export interface ApiResponse<T> {
 data: T;
 message: string;
 statusCode: number;
 success: boolean;
}

export interface YoutubeThumbnail {
 url: string;
 width?: number;
 height?: number;
}

export interface YoutubeSnippet {
 publishedAt: string;
 channelId: string;
 title: string;
 description: string;
 channelTitle: string;
 thumbnails: {
  default?: YoutubeThumbnail;
  medium?: YoutubeThumbnail;
  high?: YoutubeThumbnail;
  standard?: YoutubeThumbnail;
  maxres?: YoutubeThumbnail;
 };
 tags?: string[];
 categoryId?: string;
 liveBroadcastContent?: string;
}

export interface YoutubeStatistics {
 viewCount?: string;
 likeCount?: string;
 dislikeCount?: string;
 favoriteCount?: string;
 commentCount?: string;
}

export interface Course {
 _id: string;
 videoId: string;
 snippet: YoutubeSnippet;
 statistics?: YoutubeStatistics;
}

export function getCourseTitle(c: Course): string {
 return c.snippet?.title || "Untitled";
}

export function getCourseDescription(c: Course): string {
 return c.snippet?.description || "No description";
}

export function getCourseThumbnail(c: Course): string {
 const t = c.snippet?.thumbnails;
 return (
  t?.high?.url || t?.medium?.url || t?.standard?.url || t?.default?.url || ""
 );
}

export function getCourseChannel(c: Course): string {
 return c.snippet?.channelTitle || "Unknown Channel";
}

export function getCourseViews(c: Course): string {
 const v = c.statistics?.viewCount;
 if (!v) return "0";
 const n = parseInt(v, 10);
 if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
 if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
 return String(n);
}

export function getYoutubeUrl(c: Course): string {
 return `https://www.youtube.com/watch?v=${c.videoId}`;
}

export interface Instructor {
 id: number;
 uid: string;
 firstName?: string;
 lastName?: string;
 name?: {
  first: string;
  last: string;
  title?: string;
 };
 username: string;
 email: string;
 avatar?: string;
 picture?: {
  large: string;
  medium: string;
  thumbnail: string;
 };
 jobTitle?: string;
 bio?: string;
}

export interface EnrolledCourse {
 courseId: string;
 enrolledAt: string;
 progress: number;
 completedSections?: number[];
}

export interface UserPreferences {
 theme: "light" | "dark";
 notifications: boolean;
}
