import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  View,
  ActivityIndicator,
  LogBox,
  TouchableOpacity,
  Text,
} from "react-native";
import { initStorage } from "./src/services/storage";
import Login from "./src/screens/Login";
import Signup from "./src/screens/Signup";
import AdminDashboard from "./src/screens/AdminDashboard";
import CreateInterview from "./src/screens/CreateInterview";
import CandidateDashboard from "./src/screens/CandidateDashboard";
import RecordAnswer from "./src/screens/RecordAnswer";
import ReviewerDashboard from "./src/screens/ReviewerDashboard";
import ReviewSubmission from "./src/screens/ReviewSubmission";
import TaskDashboard from "./src/screens/TaskDashboard";
LogBox.ignoreLogs([
  "Image: style.resizeMode is deprecated",
  "Image: style.tintColor is deprecated",
  "props.pointerEvents is deprecated",
  "pointerEvents is deprecated",
  "shadow* style props are deprecated",
  "shadowOffset is deprecated",
  "shadowOpacity is deprecated",
  "shadowRadius is deprecated",
  "shadowColor is deprecated",
  "[expo-av]: Expo AV has been deprecated",
  "expo-av has been deprecated",
]);

const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args.join(" ");
  if (
    message.includes("pointerEvents is deprecated") ||
    message.includes("shadowOffset is deprecated") ||
    message.includes("shadowOpacity is deprecated") ||
    message.includes("shadowRadius is deprecated") ||
    message.includes("shadowColor is deprecated") ||
    message.includes("expo-av") ||
    message.includes("Image: style.resizeMode") ||
    message.includes("Image: style.tintColor")
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Custom back button component
const CustomBackButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 10 }}>
    <Text style={{ color: "#F8FAFC", fontSize: 16 }}>← Back</Text>
  </TouchableOpacity>
);

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        console.log("🚀 Starting app initialization");
        await initStorage();
        console.log("🚀 Storage initialized, app ready");
      } catch (e) {
        console.error("❌ Storage initialization failed", e);
      } finally {
        setReady(true);
      }
    };
    prepare();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: "#0F172A",
          },
          headerTintColor: "#F8FAFC",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerBackTitleVisible: false,
          headerLeft: () =>
            navigation.canGoBack() ? (
              <CustomBackButton onPress={() => navigation.goBack()} />
            ) : null,
        })}>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{ title: "Sign Up" }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{ title: "Admin Dashboard" }}
        />
        <Stack.Screen
          name="CreateInterview"
          component={CreateInterview}
          options={{ title: "Create Interview" }}
        />
        <Stack.Screen
          name="Candidate"
          component={CandidateDashboard}
          options={{ title: "Candidate Dashboard" }}
        />
        <Stack.Screen
          name="RecordAnswer"
          component={RecordAnswer}
          options={{ title: "Record Answer" }}
        />
        <Stack.Screen
          name="Reviewer"
          component={ReviewerDashboard}
          options={{ title: "Reviewer Dashboard" }}
        />
        <Stack.Screen
          name="ReviewSubmission"
          component={ReviewSubmission}
          options={{ title: "Review Submission" }}
        />
        <Stack.Screen
          name="TaskDashboard"
          component={TaskDashboard}
          options={{ title: "Task Dashboard" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
