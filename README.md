# LearnSpace — Mini LMS App

A React Native Expo app built as an LMS assignment. Uses freeapi.app for data — random products as courses, random users as instructors.

## Screenshots

> Add screenshots to `/assets/screenshots/` and reference them here after first run.

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Android Studio or Xcode (for emulator) or Expo Go on device

### Install

```bash
git clone <your-repo-url>
cd lms
npm install
```

### Install native dependencies

```bash
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-webview
npx expo install @react-native-community/netinfo
npx expo install expo-notifications
```

### Run

```bash
# clear cache on first run
npx expo start --clear

# android
npx expo start --android

# ios
npx expo start --ios
```

### Build APK (development build)

```bash
npx expo run:android
```

Or with EAS Build:
```bash
npm install -g eas-cli
eas build --platform android --profile preview
```

## Environment Variables

No `.env` needed — the API base (`https://api.freeapi.app`) is hardcoded in `lib/api.ts`. If you want to swap it out:

```ts
// lib/api.ts
const BASE_URL = "https://api.freeapi.app"; // change this
```

## Project Structure

```
app/
  _layout.tsx          root layout, auth guard, context providers
  (auth)/              login + register screens
  (tabs)/              bottom tab screens (courses, bookmarks, profile)
  course/[id].tsx      course detail
  webview.tsx          embedded WebView content viewer
context/
  AuthContext.tsx      auth state + SecureStore token management
  CourseContext.tsx    courses, bookmarks, enrolled — AsyncStorage persistence
lib/
  api.ts               fetch wrapper with retry logic + token refresh
  notifications.ts     expo-notifications helpers
hooks/
  useNetworkStatus.ts  NetInfo-based offline detection
components/
  CourseCard.tsx       memoized course list item
  OfflineBanner.tsx    red banner shown when offline
types/
  index.ts             all TypeScript interfaces
```

## Key Architectural Decisions

**Auth guard in root layout** — `useSegments()` + `useEffect` redirect. Runs after every auth state change. Loading spinner shown while token is validated on startup so there's no flash to login screen for already-authenticated users.

**SecureStore for tokens, AsyncStorage for app data** — tokens need encryption so they go in SecureStore. Bookmarks and enrolled courses are not sensitive so AsyncStorage is fine there. Both are loaded on context init.

**useReducer over useState for context** — auth and course state have enough interdependent fields that reducer actions are cleaner than a pile of individual setters. Also makes the state transitions predictable.

**Memoized course cards** — `React.memo` on CourseCard prevents re-renders when the list scrolls and parent re-renders. Combined with FlatList's `removeClippedSubviews`, `maxToRenderPerBatch: 8`, and `windowSize: 10` for smooth scrolling on large lists.

**API retry logic** — `apiCall()` retries up to 2 times with 1s/2s backoff before throwing. Handles 401 by attempting token refresh first. AbortController gives a 10s timeout per request.

**WebView bidirectional communication** — Native injects course data via `injectedJavaScriptBeforeContentLoaded`. WebView sends lesson completion events back via `window.ReactNativeWebView.postMessage()`. Handled in `onMessage`.

**Notification scheduling** — Bookmark notification fires immediately when bookmarks reach 5+. Reminder notification schedules 24h out on every app open, cancelling any previous one so it always counts from last visit.

## Known Issues / Limitations

- Profile picture update UI exists but the actual upload API call is not implemented (freeapi's multipart upload requires additional handling)
- `loadMore` pagination: freeapi's `/randomproducts` doesn't have true pagination — it returns the same data each page, so `hasMore` will stay false after first load in practice
- Notifications on Android 13+ require explicit permission granted by user — handled via `requestNotificationPermissions()` before scheduling
- No deep linking configured
- No landscape-specific layout adjustments (the app works in landscape but wasn't specifically designed for it)
