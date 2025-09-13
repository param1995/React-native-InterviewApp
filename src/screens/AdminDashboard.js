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
import { storage } from "../services/storage";

const { width, height } = Dimensions.get("window");

// Responsive helper functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isSmallPhone = width < 375;

export default function AdminDashboard({ navigation }) {
  const [interviews, setInterviews] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const data = await storage.getInterviews();
        setInterviews(data || []);
      } catch (e) {
        console.error("Failed to load interviews:", e);
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleDeleteInterview = async (interviewId) => {
    Alert.alert(
      "Delete Interview",
      "Are you sure you want to delete this interview?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedInterviews = interviews.filter(
                (item) => item.id !== interviewId
              );
              await storage.saveInterviews(updatedInterviews);
              setInterviews(updatedInterviews);
              Alert.alert("Success", "Interview deleted successfully!");
            } catch (e) {
              Alert.alert("Error", "Failed to delete interview");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.interviewCard, responsiveStyles.interviewCard]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.title, responsiveStyles.title]}>{item.title}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteInterview(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.description, responsiveStyles.description]}>
        {item.description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.questionsCount, responsiveStyles.questionsCount]}>
          📋 {item.questions ? item.questions.length : 0} Questions
        </Text>
        <TouchableOpacity
          style={[styles.editButton, responsiveStyles.editButton]}
          onPress={() => navigation.navigate("CreateInterview", { interview: item })}
          activeOpacity={0.8}
        >
          <Text style={[styles.editButtonText, responsiveStyles.editButtonText]}>
            Edit
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const responsiveStyles = getResponsiveStyles();

  return (
    <SafeAreaView style={[styles.container, responsiveStyles.container]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            responsiveStyles.scrollContent,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background Gradient Effect */}
          <View
            style={[
              styles.backgroundGradient,
              responsiveStyles.backgroundGradient,
            ]}
          />

          {/* Main Content */}
          <Animated.View style={[
            styles.content,
            responsiveStyles.content,
            { opacity: fadeAnim }
          ]}>
            {/* Header Section */}
            <View style={[styles.header, responsiveStyles.header]}>
              <Text style={[styles.welcomeTitle, responsiveStyles.welcomeTitle]}>
                👑 Admin Dashboard
              </Text>
              <Text style={[styles.welcomeSubtitle, responsiveStyles.welcomeSubtitle]}>
                Manage and create interview assessments
              </Text>
            </View>

            {/* Create Interview Button */}
            <TouchableOpacity
              style={[styles.createButton, responsiveStyles.createButton]}
              onPress={() => navigation.navigate("CreateInterview")}
              activeOpacity={0.8}
            >
              <Text style={[styles.createButtonText, responsiveStyles.createButtonText]}>
                ➕ Create New Interview
              </Text>
            </TouchableOpacity>

            {/* Interviews List */}
            {interviews.length === 0 ? (
              <View style={[styles.emptyState, responsiveStyles.emptyState]}>
                <Text style={[styles.emptyStateEmoji, responsiveStyles.emptyStateEmoji]}>
                  📝
                </Text>
                <Text style={[styles.emptyStateTitle, responsiveStyles.emptyStateTitle]}>
                  No Interviews Yet
                </Text>
                <Text style={[styles.emptyStateText, responsiveStyles.emptyStateText]}>
                  Create your first interview to get started with candidate assessments.
                </Text>
              </View>
            ) : (
              <View style={[styles.listContainer, responsiveStyles.listContainer]}>
                <Text style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>
                  Your Interviews ({interviews.length})
                </Text>
                <FlatList
                  data={interviews}
                  keyExtractor={(i) => i.id.toString()}
                  renderItem={renderItem}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.flatListContent}
                />
              </View>
            )}
          </Animated.View>
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
      minHeight: isDesktop ? "100%" : hp(100),
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
      marginBottom: isTablet ? 40 : 32,
      alignItems: "center",
    },
    welcomeTitle: {
      fontSize: isDesktop ? 38 : isTablet ? 32 : isSmallPhone ? 26 : 28,
      marginBottom: isTablet ? 12 : 8,
    },
    welcomeSubtitle: {
      fontSize: isDesktop ? 18 : isTablet ? 17 : isSmallPhone ? 14 : 16,
    },
    createButton: {
      paddingVertical: isDesktop ? 18 : isTablet ? 16 : 14,
      marginBottom: isTablet ? 32 : 24,
    },
    createButtonText: {
      fontSize: isDesktop ? 18 : isTablet ? 17 : 16,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: isTablet ? hp(10) : hp(8),
    },
    emptyStateEmoji: {
      fontSize: isDesktop ? 64 : isTablet ? 56 : 48,
      marginBottom: isTablet ? 20 : 16,
    },
    emptyStateTitle: {
      fontSize: isDesktop ? 24 : isTablet ? 22 : 20,
      marginBottom: isTablet ? 12 : 8,
    },
    emptyStateText: {
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
      textAlign: "center",
      lineHeight: isDesktop ? 24 : isTablet ? 22 : 20,
    },
    listContainer: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: isDesktop ? 20 : isTablet ? 18 : 16,
      marginBottom: isTablet ? 20 : 16,
    },
    interviewCard: {
      paddingHorizontal: isDesktop ? 24 : isTablet ? 20 : 16,
      paddingVertical: isDesktop ? 20 : isTablet ? 18 : 16,
      marginBottom: isTablet ? 16 : 12,
    },
    title: {
      fontSize: isDesktop ? 18 : isTablet ? 17 : 16,
    },
    description: {
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
      marginBottom: isTablet ? 16 : 12,
    },
    questionsCount: {
      fontSize: isDesktop ? 14 : isTablet ? 13 : 12,
    },
    editButton: {
      paddingVertical: isDesktop ? 8 : isTablet ? 7 : 6,
      paddingHorizontal: isDesktop ? 16 : isTablet ? 14 : 12,
    },
    editButtonText: {
      fontSize: isDesktop ? 14 : isTablet ? 13 : 12,
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
    width: "100%",
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
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
  createButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: hp(8),
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  emptyStateText: {
    color: "#94A3B8",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "400",
    lineHeight: 20,
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  flatListContent: {
    paddingBottom: 20,
  },
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
  title: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  description: {
    color: "#94A3B8",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "400",
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  questionsCount: {
    color: "#64748B",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  editButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});
