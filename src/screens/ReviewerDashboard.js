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

export default function ReviewerDashboard({ navigation }) {
  const [submissions, setSubmissions] = useState([]);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const subs = await storage.getSubmissions();
        const ints = await storage.getInterviews();

        // Enrich submissions with interview data
        const enrichedSubs = subs.map((sub) => {
          const interview = ints.find((i) => i.id === sub.interviewId);
          return {
            ...sub,
            interviewTitle: interview?.title || "Unknown Interview",
            interviewDescription: interview?.description || "",
            questionsCount: interview?.questions?.length || 0,
          };
        });

        setSubmissions(enrichedSubs || []);
        setInterviews(ints || []);
      } catch (e) {
        console.error("Failed to load submissions:", e);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const getStatusColor = (submission) => {
    if (submission.review) {
      return "#10B981"; // Green for reviewed
    }
    return "#F59E0B"; // Orange for pending
  };

  const getStatusText = (submission) => {
    if (submission.review) {
      return `✅ Reviewed (${submission.review.score}/10)`;
    }
    return "⏳ Pending Review";
  };

  const renderItem = ({ item }) => (
    <View style={[styles.submissionCard, responsiveStyles.submissionCard]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.interviewTitle, responsiveStyles.interviewTitle]}>
          {item.interviewTitle}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item) },
          ]}
        >
          <Text style={styles.statusBadgeText}>{getStatusText(item)}</Text>
        </View>
      </View>
      <Text style={[styles.interviewDescription, responsiveStyles.interviewDescription]}>
        {item.interviewDescription}
      </Text>
      <View style={styles.cardDetails}>
        <Text style={[styles.detailText, responsiveStyles.detailText]}>
          📅 Submitted: {new Date(item.submittedAt).toLocaleDateString()}
        </Text>
        <Text style={[styles.detailText, responsiveStyles.detailText]}>
          🎤 Answers: {item.answers?.length || 0} / {item.questionsCount}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.reviewButton,
          responsiveStyles.reviewButton,
          item.review && styles.reviewedButton,
        ]}
        onPress={() => navigation.navigate("ReviewSubmission", { submission: item })}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.reviewButtonText,
            responsiveStyles.reviewButtonText,
            item.review && styles.reviewedButtonText,
          ]}
        >
          {item.review ? "👁️ View Review" : "📝 Review Submission"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const responsiveStyles = getResponsiveStyles();

  const pendingCount = submissions.filter((s) => !s.review).length;
  const reviewedCount = submissions.filter((s) => s.review).length;

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
          <View style={[styles.content, responsiveStyles.content]}>
            {/* Header Section */}
            <View style={[styles.header, responsiveStyles.header]}>
              <Text style={[styles.welcomeTitle, responsiveStyles.welcomeTitle]}>
                👨‍💼 Reviewer Dashboard
              </Text>
              <Text style={[styles.welcomeSubtitle, responsiveStyles.welcomeSubtitle]}>
                Evaluate candidate submissions and provide feedback
              </Text>
            </View>

            {/* Stats Section */}
            <View style={[styles.statsContainer, responsiveStyles.statsContainer]}>
              <View style={[styles.statCard, responsiveStyles.statCard]}>
                <Text style={[styles.statNumber, responsiveStyles.statNumber]}>
                  {pendingCount}
                </Text>
                <Text style={[styles.statLabel, responsiveStyles.statLabel]}>
                  Pending Reviews
                </Text>
              </View>
              <View style={[styles.statCard, responsiveStyles.statCard]}>
                <Text style={[styles.statNumber, responsiveStyles.statNumber]}>
                  {reviewedCount}
                </Text>
                <Text style={[styles.statLabel, responsiveStyles.statLabel]}>
                  Completed Reviews
                </Text>
              </View>
            </View>

            {/* Submissions List */}
            {submissions.length === 0 ? (
              <View style={[styles.emptyState, responsiveStyles.emptyState]}>
                <Text style={[styles.emptyStateEmoji, responsiveStyles.emptyStateEmoji]}>
                  📋
                </Text>
                <Text style={[styles.emptyStateTitle, responsiveStyles.emptyStateTitle]}>
                  No Submissions Yet
                </Text>
                <Text style={[styles.emptyStateText, responsiveStyles.emptyStateText]}>
                  Submissions will appear here once candidates complete interviews.
                </Text>
              </View>
            ) : (
              <View style={[styles.listContainer, responsiveStyles.listContainer]}>
                <Text style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>
                  All Submissions ({submissions.length})
                </Text>
                <FlatList
                  data={submissions}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderItem}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.flatListContent}
                />
              </View>
            )}
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
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: isTablet ? 32 : 24,
    },
    statCard: {
      flex: 1,
      paddingVertical: isDesktop ? 20 : isTablet ? 18 : 16,
      paddingHorizontal: isDesktop ? 16 : isTablet ? 14 : 12,
      marginHorizontal: isTablet ? 8 : 4,
    },
    statNumber: {
      fontSize: isDesktop ? 32 : isTablet ? 28 : 24,
    },
    statLabel: {
      fontSize: isDesktop ? 14 : isTablet ? 13 : 12,
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
    submissionCard: {
      paddingHorizontal: isDesktop ? 24 : isTablet ? 20 : 16,
      paddingVertical: isDesktop ? 20 : isTablet ? 18 : 16,
      marginBottom: isTablet ? 16 : 12,
    },
    interviewTitle: {
      fontSize: isDesktop ? 18 : isTablet ? 17 : 16,
    },
    interviewDescription: {
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
      marginBottom: isTablet ? 12 : 10,
    },
    detailText: {
      fontSize: isDesktop ? 13 : isTablet ? 12 : 11,
      marginBottom: isTablet ? 4 : 2,
    },
    reviewButton: {
      paddingVertical: isDesktop ? 12 : isTablet ? 11 : 10,
      paddingHorizontal: isDesktop ? 24 : isTablet ? 22 : 20,
      marginTop: isTablet ? 12 : 10,
    },
    reviewButtonText: {
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statNumber: {
    color: "#3B82F6",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  statLabel: {
    color: "#94A3B8",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    textAlign: "center",
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
  submissionCard: {
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
  interviewTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  interviewDescription: {
    color: "#94A3B8",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "400",
    lineHeight: 20,
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailText: {
    color: "#64748B",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  reviewButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  reviewedButton: {
    backgroundColor: "#10B981",
  },
  reviewedButtonText: {
    color: "#FFFFFF",
  },
});
