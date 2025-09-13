import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import { initStorage } from "./src/services/storage";

import Login from "./src/screens/Login";
import Signup from "./src/screens/Signup";
import AdminDashboard from "./src/screens/AdminDashboard";
import CreateInterview from "./src/screens/CreateInterview";
import CandidateDashboard from "./src/screens/CandidateDashboard";
import RecordAnswer from "./src/screens/RecordAnswer";
import ReviewerDashboard from "./src/screens/ReviewerDashboard";
import ReviewSubmission from "./src/screens/ReviewSubmission";

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await initStorage();
      } catch (e) {
        console.error("Storage initialization failed", e);
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
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Admin" component={AdminDashboard} />
        <Stack.Screen name="CreateInterview" component={CreateInterview} />
        <Stack.Screen name="Candidate" component={CandidateDashboard} />
        <Stack.Screen name="RecordAnswer" component={RecordAnswer} />
        <Stack.Screen name="Reviewer" component={ReviewerDashboard} />
        <Stack.Screen name="ReviewSubmission" component={ReviewSubmission} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
