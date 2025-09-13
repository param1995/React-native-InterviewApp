// src/screens/Signup.js
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

// Responsive helper functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isSmallPhone = width < 375;

export default function Signup({ navigation }) {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState("candidate");

  async function handleSignup() {
    if (!id.trim() || !pw || !name.trim())
      return Alert.alert("Validation Error", "Please fill all fields");
    
    const users = await storage.getUsers();
    if (users.find((u) => u.id === id.trim()))
      return Alert.alert("User Exists", "This email is already registered");
    
    users.push({ id: id.trim(), name: name.trim(), password: pw, role });
    await storage.saveUsers(users);
    Alert.alert("Success", "Account created successfully!");
    navigation.goBack();
  }

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
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, responsiveStyles.scrollContent]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background Gradient Effect */}
          <View style={[styles.backgroundGradient, responsiveStyles.backgroundGradient]} />
          
          {/* Main Content */}
          <View style={[styles.content, responsiveStyles.content]}>
            {/* Header Section */}
          

            {/* Signup Card */}
            <View style={[styles.signupCard, responsiveStyles.signupCard]}>
              <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                style={[styles.input, responsiveStyles.input]}
                autoCapitalize="words"
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                placeholder="Email Address"
                value={id}
                onChangeText={setId}
                style={[styles.input, responsiveStyles.input]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                placeholder="Password"
                secureTextEntry
                value={pw}
                onChangeText={setPw}
                style={[styles.input, responsiveStyles.input]}
                placeholderTextColor="#9CA3AF"
              />

              {/* Role Selection */}
              <View style={[styles.roleSection, responsiveStyles.roleSection]}>
                <Text style={[styles.roleLabel, responsiveStyles.roleLabel]}>
                  Choose Your Role
                </Text>
                <View style={[styles.roleContainer, responsiveStyles.roleContainer]}>
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
                        }
                      ]}
                      onPress={() => setRole(option.key)}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        responsiveStyles.roleButtonText,
                        role === option.key && { color: '#FFFFFF' }
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
                activeOpacity={0.8}
              >
                <Text style={[styles.signupButtonText, responsiveStyles.signupButtonText]}>
                  Create Account
                </Text>
              </TouchableOpacity>

              <View style={[styles.divider, responsiveStyles.divider]}>
                <View style={styles.dividerLine} />
                <Text style={[styles.dividerText, responsiveStyles.dividerText]}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, responsiveStyles.loginButton]}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={[styles.loginButtonText, responsiveStyles.loginButtonText]}>
                  Already have an account? Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Features Section */}
            <View style={[styles.featuresSection, responsiveStyles.featuresSection]}>
              <Text style={[styles.featuresTitle, responsiveStyles.featuresTitle]}>
                🚀 What you'll get
              </Text>
              <View style={[styles.featuresList, responsiveStyles.featuresList]}>
                <Text style={[styles.featureItem, responsiveStyles.featureItem]}>
                  ✨ Professional interview management
                </Text>
                <Text style={[styles.featureItem, responsiveStyles.featureItem]}>
                  📊 Advanced analytics and insights  
                </Text>
                <Text style={[styles.featureItem, responsiveStyles.featureItem]}>
                  🎯 Role-based access control
                </Text>
                <Text style={[styles.featureItem, responsiveStyles.featureItem]}>
                  📱 Multi-device synchronization
                </Text>
              </View>
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
      minHeight: isDesktop ? '100%' : hp(100),
      paddingVertical: isTablet ? hp(3) : hp(2),
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
      marginBottom: isTablet ? 32 : 24,
    },
    logoContainer: {
      marginBottom: isTablet ? 20 : 16,
    },
    logo: {
      width: isDesktop ? 60 : isTablet ? 55 : 45,
      height: isDesktop ? 60 : isTablet ? 55 : 45,
      marginBottom: isTablet ? 12 : 10,
    },
    logoText: {
      fontSize: isDesktop ? 28 : isTablet ? 25 : 22,
    },
    appName: {
      fontSize: isDesktop ? 28 : isTablet ? 24 : isSmallPhone ? 20 : 22,
    },
    welcomeTitle: {
      fontSize: isDesktop ? 34 : isTablet ? 28 : isSmallPhone ? 24 : 26,
      marginBottom: isTablet ? 10 : 8,
    },
    welcomeSubtitle: {
      fontSize: isDesktop ? 17 : isTablet ? 16 : isSmallPhone ? 14 : 15,
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
    roleSection: {
      marginBottom: isTablet ? 24 : 20,
    },
    roleLabel: {
      fontSize: isDesktop ? 17 : isTablet ? 16 : 15,
      marginBottom: isTablet ? 16 : 12,
    },
    roleContainer: {
      flexDirection: isTablet ? 'row' : 'column',
      justifyContent: isTablet ? 'space-between' : 'stretch',
    },
    roleButton: {
      flex: isTablet ? 1 : undefined,
      paddingVertical: isDesktop ? 14 : isTablet ? 12 : 10,
      paddingHorizontal: isDesktop ? 16 : isTablet ? 12 : 10,
      marginBottom: isTablet ? 0 : 10,
      marginHorizontal: isTablet ? 4 : 0,
    },
    roleButtonText: {
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
    },
    signupButton: {
      paddingVertical: isDesktop ? 16 : isTablet ? 15 : 14,
      marginTop: isTablet ? 8 : 4,
    },
    signupButtonText: {
      fontSize: isDesktop ? 17 : isTablet ? 16 : 15,
    },
    divider: {
      marginVertical: isTablet ? 24 : 20,
    },
    dividerText: {
      fontSize: isTablet ? 14 : 13,
      paddingHorizontal: isTablet ? 18 : 14,
    },
    loginButton: {
      paddingVertical: isDesktop ? 14 : isTablet ? 13 : 12,
    },
    loginButtonText: {
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
    },
    featuresSection: {
      paddingHorizontal: isDesktop ? 20 : isTablet ? 16 : 12,
      paddingVertical: isDesktop ? 24 : isTablet ? 20 : 16,
    },
    featuresTitle: {
      fontSize: isDesktop ? 18 : isTablet ? 16 : 15,
      marginBottom: isTablet ? 16 : 12,
    },
    featuresList: {
      marginLeft: isTablet ? 8 : 4,
    },
    featureItem: {
      fontSize: isDesktop ? 14 : isTablet ? 13 : 12,
      marginBottom: isTablet ? 8 : 6,
      lineHeight: isDesktop ? 20 : isTablet ? 18 : 16,
    },
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    backgroundColor: '#1E293B',
    borderRadius: 200,
    opacity: 0.3,
    top: -100,
    right: -50,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    backgroundColor: '#10B981',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  appName: {
    color: '#10B981',
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  welcomeTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  welcomeSubtitle: {
    color: '#94A3B8',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '400',
  },
  signupCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '400',
  },
  roleSection: {
    marginBottom: 20,
  },
  roleLabel: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  roleContainer: {
    gap: 8,
  },
  roleButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  roleButtonText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  signupButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '400',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  loginButtonText: {
    color: '#3B82F6',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  featuresSection: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  featuresTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  featuresList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    color: '#94A3B8',
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});