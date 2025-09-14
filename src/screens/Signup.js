import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { storage } from "../services/storage";

const { width, height } = Dimensions.get("window");
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isSmallPhone = width < 375;

export default function Signup({ navigation }) {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [role, setRole] = useState("candidate");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password);

  const handleSignup = async () => {
    let hasError = false;

    if (!name.trim()) {
      setNameError("Please enter your full name");
      hasError = true;
    } else setNameError("");
    if (!id.trim()) {
      setEmailError("Please enter your email");
      hasError = true;
    } else if (!validateEmail(id.trim())) {
      setEmailError("Invalid email address");
      hasError = true;
    } else setEmailError("");
    if (!pw) {
      setPasswordError("Please enter a password");
      hasError = true;
    } else if (!validatePassword(pw)) {
      setPasswordError(
        "Password must be 8+ chars with uppercase, lowercase, number"
      );
      hasError = true;
    } else setPasswordError("");
    if (!confirmPw) {
      setConfirmPasswordError("Please confirm your password");
      hasError = true;
    } else if (pw !== confirmPw) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    } else setConfirmPasswordError("");

    if (hasError) return;

    const users = await storage.getUsers();
    if (users.find((u) => u.id === id.trim())) {
      setEmailError("This email is already registered");
      return;
    }

    users.push({ id: id.trim(), name: name.trim(), password: pw, role });
    await storage.saveUsers(users);
    Alert.alert("Success", "Account created successfully!");
    navigation.goBack();
  };

  const responsiveStyles = getResponsiveStyles();
  const roleOptions = [
    { key: "candidate", label: "🎯 Candidate", color: "#10B981" },
    { key: "reviewer", label: "👨‍💼 Reviewer", color: "#F59E0B" },
    { key: "admin", label: "👑 Admin", color: "#EF4444" },
  ];

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
          keyboardShouldPersistTaps="handled">
          <View
            style={[
              styles.backgroundGradient,
              responsiveStyles.backgroundGradient,
            ]}
          />

          <View style={[styles.content, responsiveStyles.content]}>
            <View style={[styles.signupCard, responsiveStyles.signupCard]}>
              <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setNameError("");
                }}
                style={[styles.input, responsiveStyles.input]}
                autoCapitalize="words"
                placeholderTextColor="#9CA3AF"
              />
              {nameError ? (
                <Text
                  style={[
                    styles.fieldError,
                    { marginBottom: 6 },
                    responsiveStyles.fieldError,
                  ]}>
                  {nameError}
                </Text>
              ) : null}

              <TextInput
                placeholder="Email Address"
                value={id}
                onChangeText={(text) => {
                  setId(text);
                  setEmailError("");
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
                    { marginBottom: 6 },
                    responsiveStyles.fieldError,
                  ]}>
                  {emailError}
                </Text>
              ) : null}

              <TextInput
                placeholder="Password"
                secureTextEntry
                value={pw}
                onChangeText={(text) => {
                  setPw(text);
                  setPasswordError("");
                }}
                style={[styles.input, responsiveStyles.input]}
                placeholderTextColor="#9CA3AF"
              />
              {passwordError ? (
                <Text
                  style={[
                    styles.fieldError,
                    { marginBottom: 6 },
                    responsiveStyles.fieldError,
                  ]}>
                  {passwordError}
                </Text>
              ) : null}

              <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPw}
                onChangeText={(text) => {
                  setConfirmPw(text);
                  setConfirmPasswordError("");
                }}
                style={[styles.input, responsiveStyles.input]}
                placeholderTextColor="#9CA3AF"
              />
              {confirmPasswordError ? (
                <Text
                  style={[
                    styles.fieldError,
                    { marginBottom: 6 },
                    responsiveStyles.fieldError,
                  ]}>
                  {confirmPasswordError}
                </Text>
              ) : null}

              <View style={[styles.roleSection, responsiveStyles.roleSection]}>
                <Text style={[styles.roleLabel, responsiveStyles.roleLabel]}>
                  Choose Your Role
                </Text>
                <View
                  style={[
                    styles.roleContainer,
                    responsiveStyles.roleContainer,
                  ]}>
                  {roleOptions.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.roleButton,
                        responsiveStyles.roleButton,
                        role === option.key && {
                          backgroundColor: option.color,
                          shadowColor: option.color,
                          shadowOpacity: 0.3,
                          ...Platform.select({
                            web: {
                              boxShadow: `0px 4px 8px rgba(${option.color === "#10B981" ? "16, 185, 129" : option.color === "#F59E0B" ? "245, 158, 11" : "239, 68, 68"}, 0.3)`,
                            },
                          }),
                        },
                      ]}
                      onPress={() => setRole(option.key)}
                      activeOpacity={0.8}>
                      <Text
                        style={[
                          styles.roleButtonText,
                          responsiveStyles.roleButtonText,
                          role === option.key && { color: "#FFFFFF" },
                        ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.signupButton, responsiveStyles.signupButton]}
                onPress={handleSignup}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.signupButtonText,
                    responsiveStyles.signupButtonText,
                  ]}>
                  Create Account
                </Text>
              </TouchableOpacity>

              <View style={[styles.divider, responsiveStyles.divider]}>
                <View style={styles.dividerLine} />
                <Text
                  style={[styles.dividerText, responsiveStyles.dividerText]}>
                  or
                </Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, responsiveStyles.loginButton]}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.loginButtonText,
                    responsiveStyles.loginButtonText,
                  ]}>
                  Already have an account? Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Responsive Styles function
const getResponsiveStyles = () =>
  StyleSheet.create({
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
    signupCard: {
      paddingHorizontal: isDesktop ? 36 : isTablet ? 32 : 24,
      paddingVertical: isDesktop ? 36 : isTablet ? 32 : 28,
      marginBottom: isTablet ? 24 : 20,
    },
    input: {
      paddingVertical: isDesktop ? 16 : isTablet ? 15 : 12,
      paddingHorizontal: isTablet ? 18 : 16,
      fontSize: isDesktop ? 16 : isTablet ? 15 : isSmallPhone ? 13 : 14,
      marginBottom: isTablet ? 18 : 14,
    },
    roleSection: { marginBottom: isTablet ? 24 : 20 },
    roleLabel: {
      fontSize: isDesktop ? 17 : isTablet ? 16 : 15,
      marginBottom: isTablet ? 16 : 12,
    },
    roleContainer: {
      flexDirection: isTablet ? "row" : "column",
      justifyContent: isTablet ? "space-between" : "stretch",
    },
    roleButton: {
      flex: isTablet ? 1 : undefined,
      paddingVertical: isDesktop ? 14 : isTablet ? 12 : 10,
      paddingHorizontal: isDesktop ? 16 : isTablet ? 12 : 10,
      marginBottom: isTablet ? 0 : 10,
      marginHorizontal: isTablet ? 4 : 0,
    },
    roleButtonText: { fontSize: isDesktop ? 15 : isTablet ? 14 : 13 },
    signupButton: {
      paddingVertical: isDesktop ? 16 : isTablet ? 15 : 14,
      marginTop: isTablet ? 8 : 4,
    },
    signupButtonText: { fontSize: isDesktop ? 17 : isTablet ? 16 : 15 },
    divider: { marginVertical: isTablet ? 24 : 20 },
    dividerText: {
      fontSize: isTablet ? 14 : 13,
      paddingHorizontal: isTablet ? 18 : 14,
    },
    loginButton: { paddingVertical: isDesktop ? 14 : isTablet ? 13 : 12 },
    loginButtonText: { fontSize: isDesktop ? 15 : isTablet ? 14 : 13 },
    fieldError: { fontSize: isTablet ? 13 : 12 },
  });

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
    right: -50,
  },
  content: {
    width: "100%",
    alignSelf: "center",
  },
  signupCard: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: "#334155",
    // For web compatibility
    ...Platform.select({
      web: {
        boxShadow: "0px 20px 25px rgba(0, 0, 0, 0.25)",
      },
    }),
  },
  input: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "400",
  },
  roleSection: {
    marginBottom: 20,
  },
  roleLabel: {
    color: "#F8FAFC",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  roleContainer: {
    gap: 8,
  },
  roleButton: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  roleButtonText: {
    color: "#94A3B8",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  signupButton: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    // For web compatibility
    ...Platform.select({
      web: {
        boxShadow: "0px 8px 16px rgba(16, 185, 129, 0.3)",
      },
    }),
  },
  signupButtonText: {
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
  loginButton: {
    backgroundColor: "transparent",
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  loginButtonText: {
    color: "#3B82F6",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 0,
    marginLeft: 4,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});
