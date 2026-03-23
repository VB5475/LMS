import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, {
 createContext,
 useCallback,
 useContext,
 useEffect,
 useReducer,
} from "react";
import { authApi } from "../lib/api";
import { User } from "../types";

interface AuthState {
 user: User | null;
 isLoading: boolean;
 isLoggedIn: boolean;
 error: string | null;
}

type AuthAction =
 | { type: "SET_LOADING"; payload: boolean }
 | { type: "SET_USER"; payload: User }
 | { type: "LOGOUT" }
 | { type: "SET_ERROR"; payload: string | null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
 switch (action.type) {
  case "SET_LOADING":
   return { ...state, isLoading: action.payload };
  case "SET_USER":
   return {
    ...state,
    user: action.payload,
    isLoggedIn: true,
    isLoading: false,
    error: null,
   };
  case "LOGOUT":
   return {
    ...state,
    user: null,
    isLoggedIn: false,
    isLoading: false,
    error: null,
   };
  case "SET_ERROR":
   return { ...state, error: action.payload, isLoading: false };
  default:
   return state;
 }
}

interface AuthContextType extends AuthState {
 login: (email: string, password: string) => Promise<boolean>;
 register: (
  username: string,
  email: string,
  password: string,
 ) => Promise<boolean>;
 logout: () => Promise<void>;
 clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function safeStore(key: string, value: any) {
 if (!value) return;
 const str = typeof value === "string" ? value : String(value);
 if (!str || str === "undefined" || str === "null") return;
 await SecureStore.setItemAsync(key, str);
}

function extractToken(data: any, key: string): string | null {
 if (!data) return null;

 if (typeof data[key] === "string" && data[key]) return data[key];

 if (data.data && typeof data.data[key] === "string") return data.data[key];

 if (data.tokens && typeof data.tokens[key] === "string")
  return data.tokens[key];

 return null;
}

function extractUser(data: any): User | null {
 if (!data) return null;
 if (data.user) return data.user;
 if (data.data?.user) return data.data.user;
 if (data._id || data.email) return data;
 return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const [state, dispatch] = useReducer(authReducer, {
  user: null,
  isLoading: true,
  isLoggedIn: false,
  error: null,
 });

 useEffect(() => {
  checkSession();
 }, []);

 async function checkSession() {
  try {
   const token = await SecureStore.getItemAsync("accessToken");
   if (!token) {
    dispatch({ type: "SET_LOADING", payload: false });
    return;
   }
   const res = await authApi.getCurrentUser();
   const user = extractUser(res?.data);
   if (user) {
    dispatch({ type: "SET_USER", payload: user });
    await AsyncStorage.setItem("lastLogin", new Date().toISOString());
   } else {
    dispatch({ type: "SET_LOADING", payload: false });
   }
  } catch {
   await SecureStore.deleteItemAsync("accessToken").catch(() => {});
   await SecureStore.deleteItemAsync("refreshToken").catch(() => {});
   dispatch({ type: "SET_LOADING", payload: false });
  }
 }

 const login = useCallback(
  async (email: string, password: string): Promise<boolean> => {
   dispatch({ type: "SET_LOADING", payload: true });
   dispatch({ type: "SET_ERROR", payload: null });
   try {
    const res = await authApi.login(email, password);

    if (res?.data) {
     console.log("see the res data:", res.data);
     const accessToken = extractToken(res.data, "accessToken");
     const refreshToken = extractToken(res.data, "refreshToken");
     const user = extractUser(res.data);

     if (!accessToken) {
      dispatch({
       type: "SET_ERROR",
       payload: "Login failed: no token received",
      });
      return false;
     }

     await safeStore("accessToken", accessToken);
     await safeStore("refreshToken", refreshToken);

     if (user) {
      dispatch({ type: "SET_USER", payload: user });
     } else {
      const meRes = await authApi.getCurrentUser();
      const meUser = extractUser(meRes?.data);
      if (meUser) dispatch({ type: "SET_USER", payload: meUser });
      else dispatch({ type: "SET_LOADING", payload: false });
     }

     await AsyncStorage.setItem("lastLogin", new Date().toISOString());
     return true;
    }

    dispatch({ type: "SET_ERROR", payload: "Login failed" });
    return false;
   } catch (err: any) {
    dispatch({ type: "SET_ERROR", payload: err.message || "Login failed" });
    return false;
   }
  },
  [],
 );

 const register = useCallback(
  async (
   username: string,
   email: string,
   password: string,
  ): Promise<boolean> => {
   dispatch({ type: "SET_LOADING", payload: true });
   dispatch({ type: "SET_ERROR", payload: null });
   try {
    const res = await authApi.register(username, email, password);

    if (res?.data) {
     console.log("see the res.data:", res.data);
     const accessToken = extractToken(res.data, "accessToken");
     const refreshToken = extractToken(res.data, "refreshToken");
     const user = extractUser(res.data);

     if (!accessToken) {
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "SET_ERROR", payload: null });
      return true;
     }

     await safeStore("accessToken", accessToken);
     await safeStore("refreshToken", refreshToken);

     if (user) {
      dispatch({ type: "SET_USER", payload: user });
     } else {
      const meRes = await authApi.getCurrentUser();
      const meUser = extractUser(meRes?.data);
      if (meUser) dispatch({ type: "SET_USER", payload: meUser });
      else dispatch({ type: "SET_LOADING", payload: false });
     }

     await AsyncStorage.setItem("lastLogin", new Date().toISOString());
     return true;
    }

    dispatch({ type: "SET_ERROR", payload: "Registration failed" });
    return false;
   } catch (err: any) {
    dispatch({
     type: "SET_ERROR",
     payload: err.message || "Registration failed",
    });
    return false;
   }
  },
  [],
 );

 const logout = useCallback(async () => {
  try {
   await authApi.logout();
  } catch {}
  await SecureStore.deleteItemAsync("accessToken").catch(() => {});
  await SecureStore.deleteItemAsync("refreshToken").catch(() => {});
  dispatch({ type: "LOGOUT" });
 }, []);

 const clearError = useCallback(() => {
  dispatch({ type: "SET_ERROR", payload: null });
 }, []);

 return (
  <AuthContext.Provider
   value={{ ...state, login, register, logout, clearError }}>
   {children}
  </AuthContext.Provider>
 );
}

export function useAuth() {
 const ctx = useContext(AuthContext);
 if (!ctx) throw new Error("useAuth must be inside AuthProvider");
 return ctx;
}
