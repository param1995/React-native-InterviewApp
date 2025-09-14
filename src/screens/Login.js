// src/screens/Login.js
// src/screens/Login.js
// src/screens/Login.js
// src/screens/Login.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from "react-native";
import { storage } from "../services/storage";
const { width, height } = Dimensions.get("window");
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;
const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isSmallPhone = width < 375;

export default function Login({ navigation }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  async function handleLogin() {
    console.log("Login attempt with id:", id, "pw length:", pw.length);
    let hasError = false;
    if (!id.trim()) {
      console.log("Validation failed: Email is empty");
      setEmailError("Please enter your email");
      hasError = true;
    } else if (!validateEmail(id.trim())) {
      console.log("Validation failed: Invalid email format");
      setEmailError("Please enter a valid email address");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!pw) {
      console.log("Validation failed: Password is empty");
      setPasswordError("Please enter your password");
      hasError = true;
    } else {
      setPasswordError("");
    }
    if (hasError) return;
    const users = await storage.getUsers();
    const u = users.find((x) => x.id === id.trim() && x.password === pw);
    if (!u) {
      console.log("Validation failed: Invalid credentials");
      setPasswordError("Invalid email or password");
      return;
    }
    console.log("Login successful for user:", u.id, "role:", u.role);
    setEmailError("");
    setPasswordError("");
    if (u.role === "admin") navigation.replace("AdminDashboard");
    else if (u.role === "candidate") navigation.replace("Candidate");
    else navigation.replace("Reviewer");
  }
  const responsiveStyles = getResponsiveStyles();
  return (
    <SafeAreaView style={[styles.container, responsiveStyles.container]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            responsiveStyles.scrollContent,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          alwaysBounceVertical={false}
          scrollEnabled={true}
          nestedScrollEnabled={true}>
          <View
            style={[
              styles.backgroundGradient,
              responsiveStyles.backgroundGradient,
            ]}
          />
          <View style={[styles.content, responsiveStyles.content]}>
            <View style={[styles.loginCard, responsiveStyles.loginCard]}>
              <TextInput
                placeholder="Email or Username"
                value={id}
                onChangeText={(text) => {
                  setId(text);
                  setEmailError("");
                  setPasswordError("");
                }}
                style={[styles.input, responsiveStyles.input]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#9CA3AF"
              />
              {emailError ? (
                <Text
                  style={[
                    styles.fieldError,
                    responsiveStyles.fieldError,
                    { marginBottom: 10 },
                  ]}>
                  {emailError}
                </Text>
              ) : null}

              {/* Password Input */}
              <TextInput
                placeholder="Password"
                secureTextEntry
                value={pw}
                onChangeText={(text) => {
                  setPw(text);
                  setEmailError("");
                  setPasswordError("");
                }}
                style={[styles.input, responsiveStyles.input]}
                placeholderTextColor="#9CA3AF"
              />
              {passwordError ? (
                <Text
                  style={[
                    styles.fieldError,
                    responsiveStyles.fieldError,
                    { marginBottom: 8 },
                  ]}>
                  {passwordError}
                </Text>
              ) : null}

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, responsiveStyles.loginButton]}
                onPress={handleLogin}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.loginButtonText,
                    responsiveStyles.loginButtonText,
                  ]}>
                  Sign In
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={[styles.divider, responsiveStyles.divider]}>
                <View style={styles.dividerLine} />
                <Text
                  style={[styles.dividerText, responsiveStyles.dividerText]}>
                  or
                </Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Sign Up */}
              <TouchableOpacity
                style={[styles.signupButton, responsiveStyles.signupButton]}
                onPress={() => navigation.navigate("Signup")}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.signupButtonText,
                    responsiveStyles.signupButtonText,
                  ]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
              {/* Forgot Password */}
              <TouchableOpacity
                style={[styles.forgotButton, responsiveStyles.forgotButton]}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.forgotButtonText,
                    responsiveStyles.forgotButtonText,
                  ]}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Responsive styles function
const getResponsiveStyles = () => {
  return StyleSheet.create({
    container: {
      paddingHorizontal: isDesktop ? wp(15) : isTablet ? wp(10) : wp(5),
    },
    scrollContent: {
      paddingVertical: isTablet ? hp(3) : hp(2),
      paddingBottom: hp(5),
    },
    backgroundGradient: {
      width: isDesktop ? wp(70) : wp(90),
      height: isDesktop ? hp(80) : hp(70),
    },
    content: {
      maxWidth: isDesktop ? 500 : isTablet ? 450 : wp(90),
      paddingHorizontal: isDesktop ? 40 : isTablet ? 32 : 24,
    },
    header: {
      marginBottom: isTablet ? 40 : 32,
    },
    logoContainer: {
      marginBottom: isTablet ? 24 : 20,
    },
    logo: {
      width: isDesktop ? 70 : isTablet ? 60 : 50,
      height: isDesktop ? 70 : isTablet ? 60 : 50,
      marginBottom: isTablet ? 16 : 12,
    },
    logoText: {
      fontSize: isDesktop ? 32 : isTablet ? 28 : 24,
    },
    appName: {
      fontSize: isDesktop ? 32 : isTablet ? 28 : isSmallPhone ? 22 : 24,
    },
    welcomeTitle: {
      fontSize: isDesktop ? 38 : isTablet ? 32 : isSmallPhone ? 26 : 28,
      marginBottom: isTablet ? 12 : 8,
    },
    welcomeSubtitle: {
      fontSize: isDesktop ? 18 : isTablet ? 17 : isSmallPhone ? 14 : 16,
    },
    loginCard: {
      paddingHorizontal: isDesktop ? 40 : isTablet ? 36 : 28,
      paddingVertical: isDesktop ? 40 : isTablet ? 36 : 32,
      marginBottom: isTablet ? 32 : 24,
      width: isDesktop ? 400 : wp(85),
    },
    input: {
      paddingVertical: isDesktop ? 18 : isTablet ? 16 : 14,
      paddingHorizontal: isTablet ? 20 : 18,
      fontSize: isDesktop ? 17 : isTablet ? 16 : isSmallPhone ? 14 : 15,
      marginBottom: isTablet ? 20 : 16,
    },
    loginButton: {
      paddingVertical: isDesktop ? 18 : isTablet ? 16 : 14,
      marginTop: isTablet ? 10 : 8,
    },
    loginButtonText: {
      fontSize: isDesktop ? 18 : isTablet ? 17 : 16,
    },
    divider: {
      marginVertical: isTablet ? 28 : 24,
    },
    dividerText: {
      fontSize: isTablet ? 15 : 14,
      paddingHorizontal: isTablet ? 20 : 16,
    },
    signupButton: {
      paddingVertical: isDesktop ? 16 : isTablet ? 15 : 14,
    },
    signupButtonText: {
      fontSize: isDesktop ? 17 : isTablet ? 16 : 15,
    },
    forgotButton: {
      marginTop: isTablet ? 24 : 20,
    },
    forgotButtonText: {
      fontSize: isTablet ? 15 : 14,
    },
    fieldError: {
      fontSize: isTablet ? 13 : 12,
      marginTop: 4,
    },
    email: {
      fontSize: isTablet ? 13 : 12,
    },
    testSection: {
      paddingHorizontal: isDesktop ? 24 : isTablet ? 20 : 16,
      paddingVertical: isDesktop ? 28 : isTablet ? 24 : 20,
    },
    testTitle: {
      fontSize: isDesktop ? 20 : isTablet ? 18 : 16,
      marginBottom: isTablet ? 20 : 16,
    },
    testCard: {
      flex: isDesktop ? 1 : isTablet ? 1 : undefined,
      width: isTablet ? undefined : "100%",
      paddingHorizontal: isDesktop ? 20 : isTablet ? 16 : 14,
      paddingVertical: isDesktop ? 16 : isTablet ? 14 : 12,
      marginBottom: isTablet ? 0 : 12,
      marginHorizontal: isDesktop ? 8 : isTablet ? 6 : 0,
    },
    testRole: {
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
    },
    testCredentials: {
      fontSize: isDesktop ? 13 : isTablet ? 12 : 11,
      lineHeight: isDesktop ? 18 : isTablet ? 16 : 15,
    },
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  backgroundGradient: {
    position: "absolute",
    backgroundColor: "#1E293B",
    borderRadius: 200,
    opacity: 0.3,
    top: -100,
    left: -50,
  },
  content: {
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    backgroundColor: "#3B82F6",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  appName: {
    color: "#3B82F6",
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  welcomeTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  welcomeSubtitle: {
    color: "#94A3B8",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "400",
  },
  loginCard: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: "#334155",
    ...Platform.select({
      web: {
        boxShadow: "0px 20px 25px rgba(0, 0, 0, 0.25)",
      },
    }),
  },
  input: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "400",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  loginButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    ...Platform.select({
      web: {
        boxShadow: "0px 8px 16px rgba(59, 130, 246, 0.3)",
      },
    }),
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#334155",
  },
  dividerText: {
    color: "#64748B",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "400",
  },
  signupButton: {
    backgroundColor: "transparent",
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#10B981",
    ...Platform.select({
      web: {
        boxShadow: "none",
      },
    }),
  },
  signupButtonText: {
    color: "#10B981",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  forgotButton: {
    alignItems: "center",
  },
  forgotButtonText: {
    color: "#3B82F6",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  testSection: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  testTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  testGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  testCard: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  testRole: {
    color: "#3B82F6",
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  testCredentials: {
    color: "#94A3B8",
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
