// src/screens/AdminDashboard.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { storage } from "../services/storage";

const { width, height } = Dimensions.get("window");
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isSmallPhone = width < 375;

export default function AdminDashboard({ navigation, route }) {
  const [interviews, setInterviews] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadInterviews = React.useCallback(async () => {
    try {
      console.log("📥 Loading interviews on", Platform.OS, "...");
      let data = await storage.getInterviews();
      console.log("📋 Loaded interviews from storage:", data);
      if (route.params?.newInterview) {
        console.log(
          "➕ Adding new interview from params:",
          route.params.newInterview
        );
        const newInterview = route.params.newInterview;
        const exists = data.some(
          (interview) => interview.id === newInterview.id
        );
        if (!exists) {
          data = [...data, newInterview];
          await storage.saveInterviews(data);
          console.log("➕ New interview added and saved");
        } else {
          console.log("➕ Interview already exists, skipping");
        }
        navigation.setParams({ newInterview: null });
      }
      setInterviews(data || []);
      console.log("📋 Interviews state updated");
    } catch (e) {
      console.error("❌ Failed to load interviews:", e);
      Alert.alert(
        "Error",
        "Failed to load interviews. Please restart the app."
      );
      setInterviews([]);
    }
  }, [route.params, navigation]);

  // Load interviews when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      console.log("🎯 Screen focused, loading interviews");
      loadInterviews();

      // Check for interview creation param
      console.log("🔍 Checking route params on focus:", route.params);
      if (route.params?.interviewCreated) {
        console.log("🎉 Interview created param detected on focus");
        Alert.alert("✅ Success", "Interview created successfully!");
        navigation.setParams({ interviewCreated: false });
        console.log("🔄 Params reset on focus");
      }
    }, [loadInterviews, route.params, navigation])
  );

  // Initial load of interviews
  useEffect(() => {
    console.log("🔄 Interviews state updated:", interviews.length, "items");
    console.log(
      "📋 Current interviews full data:",
      JSON.stringify(interviews, null, 2)
    );
  }, [interviews]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim]);

  // Debug: Log when interviews state changes
  useEffect(() => {
    console.log("🔄 Interviews state updated:", interviews.length, "items");
    console.log(
      "📋 Current interviews:",
      interviews.map((i) => ({ id: i.id, title: i.title }))
    );
  }, [interviews]);

  const handleDeleteInterview = async (id) => {
    console.log("🗑️ Request to delete ID:", id);
    console.log(
      "⚡ Skipping confirmation for debugging - proceeding with delete"
    );

    try {
      console.log("🗑️ Starting delete process for ID:", id);
      const updatedList = await storage.deleteInterview(id);
      console.log("✅ Updated interview list after delete:", updatedList); // ✅ log result
      console.log(
        "🔄 Setting interviews state with:",
        updatedList.length,
        "items"
      );

      // Force state update
      setInterviews([...updatedList]);
      console.log(
        "✅ State updated, current interviews:",
        interviews.length,
        "->",
        updatedList.length
      );

      // Show success message
      Alert.alert("Success", "Interview deleted successfully!");
    } catch (error) {
      console.error("❌ Delete error:", error);
      Alert.alert("Error", "Failed to delete interview. Please try again.");
    }
  };

  const renderItem = ({ item }) => {
    console.log("🔎 Rendering interview item:", item);
    return (
      <View style={[styles.interviewCard, responsiveStyles.interviewCard]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.title, responsiveStyles.title]}>
            {item.title}
          </Text>
          <TouchableOpacity onPress={() => handleDeleteInterview(item.id)}>
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.description, responsiveStyles.description]}>
          {item.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text
            style={[styles.questionsCount, responsiveStyles.questionsCount]}>
            📋 {item.questions?.length || 0} Questions
          </Text>
          <TouchableOpacity
            style={[styles.editButton, responsiveStyles.editButton]}
            onPress={() =>
              navigation.navigate("CreateInterview", { interview: item })
            }>
            <Text
              style={[styles.editButtonText, responsiveStyles.editButtonText]}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const responsiveStyles = getResponsiveStyles();

  const renderHeader = () => (
    <>
      <View
        style={[styles.backgroundGradient, responsiveStyles.backgroundGradient]}
      />
      <Animated.View
        style={[
          styles.content,
          responsiveStyles.content,
          { opacity: fadeAnim },
        ]}>
        <View style={[styles.header, responsiveStyles.header]}>
          <Text style={[styles.welcomeTitle, responsiveStyles.welcomeTitle]}>
            👑 Admin Dashboard
          </Text>
          <Text
            style={[styles.welcomeSubtitle, responsiveStyles.welcomeSubtitle]}>
            Manage and create interview assessments
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createButton, responsiveStyles.createButton]}
          onPress={() => navigation.navigate("CreateInterview")}>
          <Text
            style={[
              styles.createButtonText,
              responsiveStyles.createButtonText,
            ]}>
            ➕ Create New Interview
          </Text>
        </TouchableOpacity>

        {interviews.length > 0 && (
          <View style={[styles.listContainer, responsiveStyles.listContainer]}>
            <Text style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>
              Your Interviews ({interviews.length})
            </Text>
          </View>
        )}
      </Animated.View>
    </>
  );

  const renderEmpty = () => (
    <View style={[styles.emptyState, responsiveStyles.emptyState]}>
      <Text style={[styles.emptyStateEmoji, responsiveStyles.emptyStateEmoji]}>
        📝
      </Text>
      <Text style={[styles.emptyStateTitle, responsiveStyles.emptyStateTitle]}>
        No Interviews Yet
      </Text>
      <Text style={[styles.emptyStateText, responsiveStyles.emptyStateText]}>
        Create your first interview to get started.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, responsiveStyles.container]}>
      <FlatList
        data={interviews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.scrollContent,
          responsiveStyles.scrollContent,
        ]}
        showsVerticalScrollIndicator={interviews.length > 2}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const getResponsiveStyles = () =>
  StyleSheet.create({
    container: {
      paddingHorizontal: isDesktop ? wp(15) : isTablet ? wp(10) : wp(5),
    },
    scrollContent: {
      minHeight: hp(100),
      paddingVertical: isTablet ? hp(3) : hp(2),
    },
    backgroundGradient: { width: wp(90), height: hp(70) },
    content: {
      maxWidth: isDesktop ? 500 : isTablet ? 450 : wp(90),
      paddingHorizontal: 24,
    },
    header: { marginBottom: 32, alignItems: "center" },
    welcomeTitle: { fontSize: 28, marginBottom: 8 },
    welcomeSubtitle: { fontSize: 16 },
    createButton: { paddingVertical: 14, marginBottom: 24 },
    createButtonText: { fontSize: 16 },
    emptyState: { alignItems: "center", paddingVertical: hp(8) },
    emptyStateEmoji: { fontSize: 48, marginBottom: 16 },
    emptyStateTitle: { fontSize: 20, marginBottom: 8 },
    emptyStateText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
    listContainer: { flex: 1 },
    sectionTitle: { fontSize: 16, marginBottom: 16, textAlign: "center" },
    interviewCard: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      marginBottom: 12,
      width: 278,
    },
    title: { fontSize: 16 },
    description: { fontSize: 14, marginBottom: 12 },
    questionsCount: { fontSize: 12 },
    editButton: { paddingVertical: 6, paddingHorizontal: 12 },
    editButtonText: { fontSize: 12 },
  });

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundGradient: {
    position: "absolute",
    backgroundColor: "#1E293B",
    borderRadius: 200,
    opacity: 0.3,
    top: -100,
    left: -50,
  },
  content: { alignSelf: "center" },
  header: { alignItems: "center" },
  welcomeTitle: { color: "#F8FAFC", fontWeight: "700", textAlign: "center" },
  welcomeSubtitle: { color: "#94A3B8", textAlign: "center", fontWeight: "400" },
  createButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    alignItems: "center",
    elevation: 8,
  },
  createButtonText: { color: "#FFFFFF", fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: hp(8) },
  emptyStateEmoji: { fontSize: 48, marginBottom: 16 },
  emptyStateTitle: { color: "#F8FAFC", fontWeight: "700", textAlign: "center" },
  emptyStateText: {
    color: "#94A3B8",
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 20,
  },
  listContainer: { flex: 1 },
  sectionTitle: { color: "#F8FAFC", fontWeight: "700", textAlign: "center" },
  flatListContent: { paddingBottom: 20 },
  interviewCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: { color: "#F8FAFC", fontWeight: "700", flex: 1, marginRight: 8 },
  deleteButtonText: { fontSize: 16, color: "#F87171" },
  description: { color: "#94A3B8", fontWeight: "400", lineHeight: 20 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  questionsCount: { color: "#64748B", fontWeight: "500" },
  editButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
  },
  editButtonText: { color: "#FFFFFF", fontWeight: "600" },
});
