import { Stack } from "expo-router";

export default function CourseLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
          headerBackTitle: "",
          headerTintColor: "#374151",
        }}
      />
    </Stack>
  );
}
