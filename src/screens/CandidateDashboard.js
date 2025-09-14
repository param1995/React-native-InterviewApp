import React, { useEffect, useState } from "react";
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
} from "react-native";
import { storage } from "../services/storage";

const { width, height } = Dimensions.get("window");

// Responsive helper functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isSmallPhone = width < 375;

export default function CandidateDashboard({ navigation }) {
  const [interviews, setInterviews] = useState([]);
  const [completedInterviews, setCompletedInterviews] = useState(new Set());

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const data = await storage.getInterviews();
        setInterviews(data || []);
        const submissions = await storage.getSubmissions();
        const userId = "candidate@test.com";
        const completed = new Set(
          submissions
            .filter((sub) => sub.candidateId === userId)
            .map((sub) => sub.interviewId)
        );
        setCompletedInterviews(completed);
      } catch (e) {
        console.error("Failed to load interviews:", e);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => {
    const isCompleted = completedInterviews.has(item.id);
    return (
      <View style={[styles.interviewCard, responsiveStyles.interviewCard]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.title, responsiveStyles.title]}>
            {item.title}
          </Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✅ Completed</Text>
            </View>
          )}
        </View>
        <Text style={[styles.description, responsiveStyles.description]}>
          {item.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text
            style={[styles.questionsCount, responsiveStyles.questionsCount]}>
            📋 {item.questions ? item.questions.length : 0} Questions
          </Text>
          <TouchableOpacity
            style={[
              styles.actionButton,
              responsiveStyles.actionButton,
              isCompleted && styles.completedButton,
            ]}
            onPress={() => {
              console.log("Navigating to RecordAnswer with interview:", item);
              console.log("Interview questions:", item.questions);
              navigation.navigate("RecordAnswer", { interview: item });
            }}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.actionButtonText,
                responsiveStyles.actionButtonText,
                isCompleted && styles.completedButtonText,
              ]}>
              {isCompleted ? "🎤 Re-record" : "🎤 Start Interview"}
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
      <View style={[styles.content, responsiveStyles.content]}>
        <View style={[styles.header, responsiveStyles.header]}>
          <Text style={[styles.welcomeTitle, responsiveStyles.welcomeTitle]}>
            🎯 Candidate Dashboard
          </Text>
          <Text
            style={[styles.welcomeSubtitle, responsiveStyles.welcomeSubtitle]}>
            Take interviews and showcase your skills
          </Text>
        </View>
        {interviews.length > 0 && (
          <View style={[styles.listContainer, responsiveStyles.listContainer]}>
            <Text style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>
              Available Interviews ({interviews.length})
            </Text>
          </View>
        )}
      </View>
    </>
  );

  const renderEmpty = () => (
    <View style={[styles.emptyState, responsiveStyles.emptyState]}>
      <Text style={[styles.emptyStateEmoji, responsiveStyles.emptyStateEmoji]}>
        📝
      </Text>
      <Text style={[styles.emptyStateTitle, responsiveStyles.emptyStateTitle]}>
        No Interviews Available
      </Text>
      <Text style={[styles.emptyStateText, responsiveStyles.emptyStateText]}>
        Check back later for new interview opportunities.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, responsiveStyles.container]}>
      <FlatList
        data={interviews}
        keyExtractor={(i) => i.id.toString()}
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
      fontSize: isDesktop ? 38 : isTablet ? 20 : isSmallPhone ? 20 : 20,
      marginBottom: isTablet ? 12 : 8,
      display: "flex",
    },
    welcomeSubtitle: {
      fontSize: isDesktop ? 18 : isTablet ? 17 : isSmallPhone ? 14 : 16,
      textAlign: "center",
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
      textAlign: "center",
    },
    interviewCard: {
      paddingHorizontal: isDesktop ? 24 : isTablet ? 20 : 16,
      paddingVertical: isDesktop ? 20 : isTablet ? 18 : 16,
      marginBottom: isTablet ? 16 : 12,
      width: "270",
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
    actionButton: {
      paddingVertical: isDesktop ? 10 : isTablet ? 9 : 8,
      paddingHorizontal: isDesktop ? 20 : isTablet ? 18 : 16,
    },
    actionButtonText: {
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
    right: -50,
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
    paddingBottom: 100,
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
  completedBadge: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completedBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
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
  actionButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  completedButton: {
    backgroundColor: "#F59E0B",
  },
  completedButtonText: {
    color: "#FFFFFF",
  },
});
