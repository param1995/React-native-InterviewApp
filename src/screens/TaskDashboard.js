import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { taskManager, TASK_TYPES, TASK_STATUS } from "../services/taskManager";
import {
  interviewTaskManager,
  INTERVIEW_TASK_STATUS,
} from "../services/interviewTaskManager";

const { width, height } = Dimensions.get("window");

// Responsive helper functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isSmallPhone = width < 375;

export default function TaskDashboard({ navigation }) {
  const [taskStats, setTaskStats] = useState({});
  const [interviewTaskStats, setInterviewTaskStats] = useState({});
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskData();
  }, []);

  const loadTaskData = async () => {
    try {
      setLoading(true);
      const [stats, interviewStats, tasks] = await Promise.all([
        taskManager.getTaskStats(),
        interviewTaskManager.getTaskStatistics(),
        taskManager.getTasks(),
      ]);

      setTaskStats(stats);
      setInterviewTaskStats(interviewStats);
      const recent = tasks
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);
      setRecentTasks(recent);
    } catch (error) {
      console.error("Error loading task data:", error);
      Alert.alert("Error", "Failed to load task data");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupTasks = async () => {
    Alert.alert(
      "Cleanup Tasks",
      "This will remove completed tasks older than 30 days. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Cleanup",
          onPress: async () => {
            try {
              const cleanedCount = await taskManager.cleanupOldTasks();
              Alert.alert("Success", `Cleaned up ${cleanedCount} old tasks`);
              loadTaskData();
            } catch (error) {
              Alert.alert("Error", "Failed to cleanup tasks");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case TASK_STATUS.COMPLETED:
        return "#10B981";
      case TASK_STATUS.PENDING:
        return "#F59E0B";
      case TASK_STATUS.FAILED:
        return "#EF4444";
      default:
        return "#64748B";
    }
  };

  const getTaskTypeLabel = (type) => {
    switch (type) {
      case TASK_TYPES.INTERVIEW_SUBMISSION:
        return "Interview Submission";
      case TASK_TYPES.REVIEW_SUBMISSION:
        return "Review Submission";
      default:
        return type;
    }
  };

  const responsiveStyles = getResponsiveStyles();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, responsiveStyles.container]}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading task data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, responsiveStyles.container]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
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

          {/* Main Content */}
          <View style={[styles.content, responsiveStyles.content]}>
            <View style={[styles.header, responsiveStyles.header]}>
              <Text
                style={[styles.welcomeTitle, responsiveStyles.welcomeTitle]}>
                📊 Task Dashboard
              </Text>
              <Text
                style={[
                  styles.welcomeSubtitle,
                  responsiveStyles.welcomeSubtitle,
                ]}>
                Monitor and manage all interview tasks and submissions
              </Text>
            </View>

            {/* Task Statistics */}
            <View style={[styles.statsSection, responsiveStyles.statsSection]}>
              <Text
                style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>
                📈 Task Statistics
              </Text>

              <View style={[styles.statsGrid, responsiveStyles.statsGrid]}>
                <View style={[styles.statCard, responsiveStyles.statCard]}>
                  <Text
                    style={[styles.statNumber, responsiveStyles.statNumber]}>
                    {taskStats.total || 0}
                  </Text>
                  <Text style={[styles.statLabel, responsiveStyles.statLabel]}>
                    Total Tasks
                  </Text>
                </View>

                <View style={[styles.statCard, responsiveStyles.statCard]}>
                  <Text
                    style={[styles.statNumber, responsiveStyles.statNumber]}>
                    {taskStats.pending || 0}
                  </Text>
                  <Text style={[styles.statLabel, responsiveStyles.statLabel]}>
                    Pending
                  </Text>
                </View>

                <View style={[styles.statCard, responsiveStyles.statCard]}>
                  <Text
                    style={[styles.statNumber, responsiveStyles.statNumber]}>
                    {taskStats.completed || 0}
                  </Text>
                  <Text style={[styles.statLabel, responsiveStyles.statLabel]}>
                    Completed
                  </Text>
                </View>

                <View style={[styles.statCard, responsiveStyles.statCard]}>
                  <Text
                    style={[styles.statNumber, responsiveStyles.statNumber]}>
                    {taskStats.failed || 0}
                  </Text>
                  <Text style={[styles.statLabel, responsiveStyles.statLabel]}>
                    Failed
                  </Text>
                </View>
              </View>
            </View>

            {/* Interview Task Statistics */}
            <View style={[styles.statsSection, responsiveStyles.statsSection]}>
              <Text
                style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>
                🎯 Interview Tasks
              </Text>

              <View style={[styles.statsGrid, responsiveStyles.statsGrid]}>
                <View style={[styles.statCard, responsiveStyles.statCard]}>
                  <Text
                    style={[styles.statNumber, responsiveStyles.statNumber]}>
                    {interviewTaskStats.total || 0}
                  </Text>
                  <Text style={[styles.statLabel, responsiveStyles.statLabel]}>
                    Total Tasks
                  </Text>
                </View>

                <View style={[styles.statCard, responsiveStyles.statCard]}>
                  <Text
                    style={[styles.statNumber, responsiveStyles.statNumber]}>
                    {interviewTaskStats.active || 0}
                  </Text>
                  <Text style={[styles.statLabel, responsiveStyles.statLabel]}>
                    Active
                  </Text>
                </View>

                <View style={[styles.statCard, responsiveStyles.statCard]}>
                  <Text
                    style={[styles.statNumber, responsiveStyles.statNumber]}>
                    {interviewTaskStats.totalAssignments || 0}
                  </Text>
                  <Text style={[styles.statLabel, responsiveStyles.statLabel]}>
                    Assignments
                  </Text>
                </View>

                <View style={[styles.statCard, responsiveStyles.statCard]}>
                  <Text
                    style={[styles.statNumber, responsiveStyles.statNumber]}>
                    {interviewTaskStats.totalSubmissions || 0}
                  </Text>
                  <Text style={[styles.statLabel, responsiveStyles.statLabel]}>
                    Submissions
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Tasks */}
            <View
              style={[
                styles.recentTasksSection,
                responsiveStyles.recentTasksSection,
              ]}>
              <Text
                style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>
                🕒 Recent Tasks
              </Text>

              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <View
                    key={task.id}
                    style={[styles.taskCard, responsiveStyles.taskCard]}>
                    <View style={styles.taskHeader}>
                      <Text
                        style={[styles.taskType, responsiveStyles.taskType]}>
                        {getTaskTypeLabel(task.type)}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(task.status) },
                        ]}>
                        <Text style={styles.statusBadgeText}>
                          {task.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.taskMessage,
                        responsiveStyles.taskMessage,
                      ]}>
                      {task.data?.message || "Task created"}
                    </Text>
                    <Text style={[styles.taskTime, responsiveStyles.taskTime]}>
                      {new Date(task.createdAt).toLocaleString()}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={[styles.emptyState, responsiveStyles.emptyState]}>
                  <Text
                    style={[
                      styles.emptyStateText,
                      responsiveStyles.emptyStateText,
                    ]}>
                    No recent tasks found
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View
              style={[styles.actionsSection, responsiveStyles.actionsSection]}>
              <TouchableOpacity
                style={[styles.actionButton, responsiveStyles.actionButton]}
                onPress={handleCleanupTasks}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.actionButtonText,
                    responsiveStyles.actionButtonText,
                  ]}>
                  🧹 Cleanup Old Tasks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, responsiveStyles.actionButton]}
                onPress={loadTaskData}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.actionButtonText,
                    responsiveStyles.actionButtonText,
                  ]}>
                  🔄 Refresh Data
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
    statsSection: {
      marginBottom: isTablet ? 32 : 24,
    },
    sectionTitle: {
      fontSize: isDesktop ? 20 : isTablet ? 18 : 16,
      marginBottom: isTablet ? 16 : 12,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    statCard: {
      width: isTablet ? "48%" : "48%",
      paddingVertical: isDesktop ? 20 : isTablet ? 18 : 16,
      paddingHorizontal: isDesktop ? 16 : isTablet ? 14 : 12,
      marginBottom: isTablet ? 12 : 10,
    },
    statNumber: {
      fontSize: isDesktop ? 32 : isTablet ? 28 : 24,
    },
    statLabel: {
      fontSize: isDesktop ? 14 : isTablet ? 13 : 12,
    },
    recentTasksSection: {
      marginBottom: isTablet ? 32 : 24,
    },
    taskCard: {
      paddingHorizontal: isDesktop ? 20 : isTablet ? 18 : 16,
      paddingVertical: isDesktop ? 16 : isTablet ? 14 : 12,
      marginBottom: isTablet ? 12 : 10,
    },
    taskType: {
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
    },
    taskMessage: {
      fontSize: isDesktop ? 14 : isTablet ? 13 : 12,
      marginTop: 4,
    },
    taskTime: {
      fontSize: isDesktop ? 12 : isTablet ? 11 : 10,
      marginTop: 2,
    },
    actionsSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: isTablet ? 20 : 16,
    },
    actionButton: {
      flex: 1,
      paddingVertical: isDesktop ? 14 : isTablet ? 12 : 10,
      paddingHorizontal: isDesktop ? 16 : isTablet ? 14 : 12,
      marginHorizontal: 4,
    },
    actionButtonText: {
      fontSize: isDesktop ? 14 : isTablet ? 13 : 12,
    },
    emptyState: {
      paddingVertical: isTablet ? 20 : 16,
      alignItems: "center",
    },
    emptyStateText: {
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
  statsSection: {},
  sectionTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  statsGrid: {},
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
  recentTasksSection: {},
  taskCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskType: {
    color: "#F8FAFC",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  taskMessage: {
    color: "#94A3B8",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "400",
  },
  taskTime: {
    color: "#64748B",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  actionsSection: {},
  actionButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#10B981",
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#F8FAFC",
    fontSize: 16,
  },
  emptyState: {},
  emptyStateText: {
    color: "#94A3B8",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});
