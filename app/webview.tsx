import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
 ActivityIndicator,
 StyleSheet,
 Text,
 TouchableOpacity,
 View,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

function buildCourseHTML(title: string, youtubeUrl: string, courseId: string) {
 const videoId = courseId || "";
 const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;

 return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0f0f0f; color: #fff; }
    .video-wrap { position: relative; width: 100%; padding-bottom: 56.25%; background: #000; }
    .video-wrap iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
    .info { padding: 16px; background: #111; }
    .title { font-size: 16px; font-weight: 700; line-height: 1.4; margin-bottom: 12px; }
    .progress-card { background: #1a1a1a; border-radius: 12px; padding: 16px; margin-bottom: 14px; }
    .section-label { font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
    .pct-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .pct-label { font-size: 12px; color: #9ca3af; }
    .pct-val { font-size: 12px; font-weight: 700; color: #818cf8; }
    .bar { background: #374151; border-radius: 100px; height: 6px; overflow: hidden; }
    .fill { height: 100%; background: linear-gradient(90deg, #6366f1, #818cf8); width: 0%; transition: width 0.5s; }
    .lessons { background: #1a1a1a; border-radius: 12px; padding: 12px; margin-bottom: 14px; }
    .lesson { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #2a2a2a; cursor: pointer; }
    .lesson:last-child { border-bottom: none; }
    .num { width: 28px; height: 28px; background: #2a2a2a; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #818cf8; flex-shrink: 0; }
    .info-col { flex: 1; }
    .lname { font-size: 13px; font-weight: 500; }
    .ldur { font-size: 11px; color: #6b7280; margin-top: 2px; }
    .check { font-size: 15px; color: #374151; }
    .back-btn { background: #6366f1; color: white; border: none; border-radius: 12px; padding: 14px; font-size: 14px; font-weight: 600; width: 100%; cursor: pointer; }
  </style>
</head>
<body>
  <div class="video-wrap">
    <iframe src="${embedUrl}" allowfullscreen allow="autoplay; encrypted-media"></iframe>
  </div>
  <div class="info">
    <div class="title">${title}</div>
    <div class="progress-card">
      <div class="section-label">Your Progress</div>
      <div class="pct-row"><span class="pct-label">Completion</span><span class="pct-val" id="pv">0%</span></div>
      <div class="bar"><div class="fill" id="pf"></div></div>
    </div>
    <div class="lessons">
      <div class="section-label">Sections</div>
      <div class="lesson" onclick="done(1)"><div class="num" id="n1">1</div><div class="info-col"><div class="lname">Introduction</div><div class="ldur">5 min</div></div><span class="check" id="c1">○</span></div>
      <div class="lesson" onclick="done(2)"><div class="num" id="n2">2</div><div class="info-col"><div class="lname">Core Concepts</div><div class="ldur">15 min</div></div><span class="check" id="c2">○</span></div>
      <div class="lesson" onclick="done(3)"><div class="num" id="n3">3</div><div class="info-col"><div class="lname">Deep Dive</div><div class="ldur">20 min</div></div><span class="check" id="c3">○</span></div>
      <div class="lesson" onclick="done(4)"><div class="num" id="n4">4</div><div class="info-col"><div class="lname">Practical Examples</div><div class="ldur">18 min</div></div><span class="check" id="c4">○</span></div>
      <div class="lesson" onclick="done(5)"><div class="num" id="n5">5</div><div class="info-col"><div class="lname">Summary</div><div class="ldur">8 min</div></div><span class="check" id="c5">○</span></div>
    </div>
    <button class="back-btn" onclick="goBack()">← Back to App</button>
  </div>
  <script>
    var completed = [];
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
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'progress', progress: pct, courseId: '${courseId}' }));
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

 const { courseId = "", title = "Course", youtubeUrl = "" } = params;

 const htmlContent = buildCourseHTML(title, youtubeUrl, courseId);

 function handleMessage(event: WebViewMessageEvent) {
  try {
   const data = JSON.parse(event.nativeEvent.data);
   if (data.type === "goBack") router.back();
  } catch {}
 }

 return (
  <View style={{ flex: 1, backgroundColor: "#0f0f0f" }}>
   {/* <StatusBar style="light" /> */}

   {/* header */}
   <View style={styles.header}>
    <TouchableOpacity
     onPress={() => router.back()}
     style={{ marginRight: 12, padding: 2 }}>
     <Ionicons name="arrow-back" size={22} color="#fff" />
    </TouchableOpacity>
    <Text style={styles.headerTitle} numberOfLines={1}>
     {title}
    </Text>
   </View>

   {loading && !hasError && (
    <View style={styles.loadingOverlay}>
     <ActivityIndicator size="large" color="#6366f1" />
     <Text style={{ color: "#9ca3af", fontSize: 13, marginTop: 12 }}>
      Loading...
     </Text>
    </View>
   )}

   {hasError ? (
    <View style={styles.errorView}>
     <Ionicons name="cloud-offline-outline" size={52} color="#4b5563" />
     <Text
      style={{
       color: "#9ca3af",
       fontWeight: "600",
       fontSize: 16,
       marginTop: 12,
      }}>
      Failed to load
     </Text>
     <TouchableOpacity
      onPress={() => {
       setHasError(false);
       setLoading(true);
       webviewRef.current?.reload();
      }}
      style={styles.retryBtn}>
      <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
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
     style={{ flex: 1 }}
    />
   )}
  </View>
 );
}

const styles = StyleSheet.create({
 header: {
  flexDirection: "row",
  alignItems: "center",
  paddingTop: 52,
  paddingBottom: 12,
  paddingHorizontal: 16,
  backgroundColor: "#111",
  borderBottomWidth: 1,
  borderBottomColor: "#1f1f1f",
 },
 headerTitle: {
  flex: 1,
  fontSize: 15,
  fontWeight: "600",
  color: "#fff",
 },
 loadingOverlay: {
  position: "absolute",
  top: 100,
  left: 0,
  right: 0,
  bottom: 0,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#0f0f0f",
  zIndex: 10,
 },
 errorView: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  backgroundColor: "#0f0f0f",
 },
 retryBtn: {
  marginTop: 16,
  backgroundColor: "#6366f1",
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 12,
 },
});
