import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
 ActivityIndicator,
 Linking,
 Text,
 TouchableOpacity,
 View,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useCourses } from "../context/CourseContext";

function buildCourseHTML(
 title: string,
 courseId: string,
 completedSections: number[],
) {
 const thumbnailUrl = `https://img.youtube.com/vi/${courseId}/hqdefault.jpg`;
 const youtubeAppUrl = `https://www.youtube.com/watch?v=${courseId}`;
 const initialPct = Math.round((completedSections.length / 5) * 100);

 const sectionsData = [
  { id: 1, name: "Introduction", dur: "5 min" },
  { id: 2, name: "Core Concepts", dur: "15 min" },
  { id: 3, name: "Deep Dive", dur: "20 min" },
  { id: 4, name: "Practical Examples", dur: "18 min" },
  { id: 5, name: "Summary", dur: "8 min" },
 ];

 const sectionsHTML = sectionsData
  .map((s) => {
   const done = completedSections.includes(s.id);
   return `
      <div class="lesson" onclick="done(${s.id})">
        <div class="num" id="n${s.id}" style="${done ? "background:#14532d;color:#4ade80;" : ""}">
          ${s.id}
        </div>
        <div class="info-col">
          <div class="lname">${s.name}</div>
          <div class="ldur">${s.dur}</div>
        </div>
        <span class="check" id="c${s.id}" style="${done ? "color:#4ade80;" : ""}">
          ${done ? "✓" : "○"}
        </span>
      </div>`;
  })
  .join("");

 return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f9fafb; color: #111827; }
    .video-wrap { position: relative; width: 100%; padding-bottom: 56.25%; background: #000; cursor: pointer; }
    .video-wrap img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
    .play-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; }
    .play-btn { width: 64px; height: 64px; background: #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .play-arrow { width: 0; height: 0; border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-left: 22px solid white; margin-left: 5px; }
    .yt-label { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; font-size: 11px; padding: 3px 8px; border-radius: 4px; }
    .info { padding: 16px; background: #fff; }
    .title { font-size: 16px; font-weight: 700; line-height: 1.4; margin-bottom: 12px; color: #111827; }
    .progress-card { background: #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 14px; }
    .section-label { font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
    .pct-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .pct-label { font-size: 12px; color: #6b7280; }
    .pct-val { font-size: 12px; font-weight: 700; color: #6366f1; }
    .bar { background: #e5e7eb; border-radius: 100px; height: 6px; overflow: hidden; }
    .fill { height: 100%; background: linear-gradient(90deg, #6366f1, #818cf8); transition: width 0.5s; }
    .lessons { background: #f3f4f6; border-radius: 12px; padding: 12px; margin-bottom: 14px; }
    .lesson { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #e5e7eb; cursor: pointer; }
    .lesson:last-child { border-bottom: none; }
    .num { width: 28px; height: 28px; background: #e0e7ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #6366f1; flex-shrink: 0; }
    .info-col { flex: 1; }
    .lname { font-size: 13px; font-weight: 500; color: #111827; }
    .ldur { font-size: 11px; color: #9ca3af; margin-top: 2px; }
    .check { font-size: 15px; color: #d1d5db; }
    .back-btn { background: #6366f1; color: white; border: none; border-radius: 12px; padding: 14px; font-size: 14px; font-weight: 600; width: 100%; cursor: pointer; }
  </style>
</head>
<body>
  <div class="video-wrap" onclick="openVideo()">
    <img src="${thumbnailUrl}" />
    <div class="play-overlay">
      <div class="play-btn">
        <div class="play-arrow"></div>
      </div>
    </div>
    <div class="yt-label">Tap to watch on YouTube</div>
  </div>
  <div class="info">
    <div class="title">${title}</div>
    <div class="progress-card">
      <div class="section-label">Your Progress</div>
      <div class="pct-row">
        <span class="pct-label">Completion</span>
        <span class="pct-val" id="pv">${initialPct}%</span>
      </div>
      <div class="bar">
        <div class="fill" id="pf" style="width:${initialPct}%"></div>
      </div>
    </div>
    <div class="lessons">
      <div class="section-label">Sections</div>
      ${sectionsHTML}
    </div>
    <button class="back-btn" onclick="goBack()">← Back to App</button>
  </div>
  <script>
    var completed = ${JSON.stringify(completedSections)};

    function openVideo() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'openVideo',
          url: '${youtubeAppUrl}'
        }));
      }
    }

    function done(n) {
      if (completed.indexOf(n) !== -1) return;
      completed.push(n);
      document.getElementById('n'+n).style.background = '#14532d';
      document.getElementById('n'+n).style.color = '#4ade80';
      document.getElementById('c'+n).textContent = '✓';
      document.getElementById('c'+n).style.color = '#4ade80';
      var pct = Math.round((completed.length / 5) * 100);
      document.getElementById('pf').style.width = pct + '%';
      document.getElementById('pv').textContent = pct + '%';
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'progress',
          progress: pct,
          completed: completed,
          courseId: '${courseId}'
        }));
      }
    }

    function goBack() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'goBack' }));
      }
    }
  </script>
</body>
</html>`;
}

export default function WebViewScreen() {
 const params = useLocalSearchParams<{
  courseId: string;
  title: string;
  category: string;
  instructor: string;
  youtubeUrl: string;
 }>();

 const webviewRef = useRef<WebView>(null);
 const [loading, setLoading] = useState(true);
 const [hasError, setHasError] = useState(false);

 const { updateProgress, enrolled } = useCourses();
 const { courseId = "", title = "Course" } = params;

 const enrolledCourse = enrolled.find((e) => e.courseId === courseId);
 const completedSections: number[] =
  (enrolledCourse as any)?.completedSections ?? [];
 const htmlContent = buildCourseHTML(title, courseId, completedSections);

 async function handleMessage(event: WebViewMessageEvent) {
  try {
   const data = JSON.parse(event.nativeEvent.data);
   if (data.type === "goBack") router.back();
   if (data.type === "openVideo") await Linking.openURL(data.url);
   if (data.type === "progress") {
    await updateProgress(courseId, data.progress, data.completed);
   }
  } catch {}
 }

 return (
  <View className="flex-1 bg-white">
   {/* header */}
   <View className="flex-row items-center bg-white px-4 pb-3 pt-14 border-b border-gray-100">
    <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
     <Ionicons name="arrow-back" size={22} color="#111827" />
    </TouchableOpacity>
    <Text
     className="flex-1 text-gray-900 font-semibold text-base"
     numberOfLines={1}>
     {title}
    </Text>
   </View>

   {/* loading overlay */}
   {loading && !hasError && (
    <View className="absolute top-24 left-0 right-0 bottom-0 items-center justify-center bg-white z-10">
     <ActivityIndicator size="large" color="#6366f1" />
     <Text className="text-gray-400 text-sm mt-3">Loading...</Text>
    </View>
   )}

   {/* error state */}
   {hasError ? (
    <View className="flex-1 items-center justify-center p-6 bg-gray-50">
     <Ionicons name="cloud-offline-outline" size={52} color="#d1d5db" />
     <Text className="text-gray-700 font-semibold text-base mt-3">
      Failed to load
     </Text>
     <TouchableOpacity
      onPress={() => {
       setHasError(false);
       setLoading(true);
       webviewRef.current?.reload();
      }}
      className="bg-indigo-600 px-6 py-3 rounded-xl mt-4">
      <Text className="text-white font-semibold">Retry</Text>
     </TouchableOpacity>
    </View>
   ) : (
    <WebView
     ref={webviewRef}
     source={{ html: htmlContent }}
     onLoadEnd={() => setLoading(false)}
     onError={() => {
      setLoading(false);
      setHasError(true);
     }}
     onMessage={handleMessage}
     javaScriptEnabled={true}
     domStorageEnabled={true}
     allowsInlineMediaPlayback={true}
     mediaPlaybackRequiresUserAction={false}
     originWhitelist={["*"]}
     className="flex-1"
    />
   )}
  </View>
 );
}
