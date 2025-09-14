import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { storage } from "../services/storage";

const { width, height } = Dimensions.get("window");

// Responsive helper functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isSmallPhone = width < 375;

export default function ReviewSubmission({ route, navigation }) {
  const { submission } = route.params;
  const [score, setScore] = useState(submission?.review?.score || "");
  const [comments, setComments] = useState(submission?.review?.comments || "");
  const [sound, setSound] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const loadInterviewData = async () => {
      try {
        const ints = await storage.getInterviews();
        setInterviews(ints);
      } catch (e) {
        console.error("Failed to load interviews:", e);
      }
    };
    loadInterviewData();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  if (!submission) {
    return (
      <SafeAreaView style={[styles.container, responsiveStyles.container]}>
        <View style={styles.center}>
          <Text style={styles.errorText}>No submission data found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const interview = interviews.find((i) => i.id === submission.interviewId);
  const responsiveStyles = getResponsiveStyles();

  async function play(uri, index) {
    try {
      if (sound) {
        await sound.unloadAsync();
        setPlayingIndex(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      setPlayingIndex(index);
      await newSound.playAsync();
      // Reset playing state when finished
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingIndex(null);
        }
      });
    } catch (e) {
      Alert.alert("Playback Error", "Failed to play the recording.");
      console.error(e);
    }
  }

  async function stopPlayback() {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setPlayingIndex(null);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function saveReview() {
    console.log("Save review attempt:", { score, comments: comments.length });
    const scoreStr = String(score || "").trim();
    const numScore = parseFloat(scoreStr);
    const isScoreValid =
      scoreStr && !isNaN(numScore) && numScore >= 0 && numScore <= 10;
    const isCommentsValid = String(comments || "").trim().length > 0;
    if (!isScoreValid || !isCommentsValid) {
      console.log("Validation failed: Missing required fields");
      Alert.alert("Validation Error", "Please fill up all details");
      return;
    }
    try {
      const all = await storage.getSubmissions();
      const idx = all.findIndex((s) => s.id === submission.id);
      if (idx === -1) {
        console.log("Error: Submission not found");
        Alert.alert("Error", "Submission not found");
        return;
      }
      all[idx] = {
        ...all[idx],
        review: {
          score: numScore,
          comments: comments.trim(),
          reviewedAt: Date.now(),
          reviewerId: "reviewer@test.com",
        },
      };
      await storage.saveSubmissions(all);
      console.log("Review saved successfully:", {
        submissionId: submission.id,
        score: numScore,
        commentsLength: comments.trim().length,
      });
      Alert.alert("ReviewSubmission", "Review submitted successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Reviewer") },
      ]);
    } catch (e) {
      console.log("Save error:", e);
      Alert.alert("Save Error", "Failed to save review. Please try again.");
      console.error(e);
    }
  }

  const renderAnswer = (answer, index) => {
    const questionText =
      interview?.questions?.[answer.qIndex] || `Question ${answer.qIndex + 1}`;
    const isPlaying = playingIndex === index;
    return (
      <View
        key={answer.id}
        style={[styles.answerCard, responsiveStyles.answerCard]}>
        <View style={styles.answerHeader}>
          <Text style={[styles.questionLabel, responsiveStyles.questionLabel]}>
            Question {answer.qIndex + 1}
          </Text>
          <Text style={[styles.recordedTime, responsiveStyles.recordedTime]}>
            📅{" "}
            {new Date(
              answer.recordedAt || submission.submittedAt
            ).toLocaleString()}
          </Text>
        </View>
        <Text style={[styles.questionText, responsiveStyles.questionText]}>
          {questionText}
        </Text>
        <View style={styles.audioControls}>
          <TouchableOpacity
            style={[
              styles.playButton,
              responsiveStyles.playButton,
              isPlaying && styles.playingButton,
            ]}
            onPress={() =>
              isPlaying ? stopPlayback() : play(answer.uri, index)
            }
            activeOpacity={0.8}>
            <Text
              style={[
                styles.playButtonText,
                responsiveStyles.playButtonText,
                isPlaying && styles.playingButtonText,
              ]}>
              {isPlaying ? "⏹️ Stop" : "▶️ Play Recording"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTextAnswer = (qIndex, text) => {
    const questionText =
      interview?.questions?.[parseInt(qIndex)] ||
      `Question ${parseInt(qIndex) + 1}`;
    return (
      <View
        key={`text-${qIndex}`}
        style={[styles.answerCard, responsiveStyles.answerCard]}>
        <View style={styles.answerHeader}>
          <Text style={[styles.questionLabel, responsiveStyles.questionLabel]}>
            Question {parseInt(qIndex) + 1} (Text Answer)
          </Text>
          <Text style={[styles.recordedTime, responsiveStyles.recordedTime]}>
            📝 Text Response
          </Text>
        </View>

        <Text style={[styles.questionText, responsiveStyles.questionText]}>
          {questionText}
        </Text>
        <View style={styles.textAnswerContainer}>
          <Text style={styles.textAnswerText}>{text}</Text>
        </View>
      </View>
    );
  };

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

          {/* Main Content */}
          <View style={[styles.content, responsiveStyles.content]}>
            <View style={[styles.header, responsiveStyles.header]}>
              <Text
                style={[
                  styles.submissionTitle,
                  responsiveStyles.submissionTitle,
                ]}>
                📋 Review Submission
              </Text>
              <Text
                style={[styles.submissionId, responsiveStyles.submissionId]}>
                ID: {submission.id.slice(0, 8)}...
              </Text>
              <Text style={[styles.submittedAt, responsiveStyles.submittedAt]}>
                Submitted: {new Date(submission.submittedAt).toLocaleString()}
              </Text>
            </View>

            {/* Interview Info */}
            <View
              style={[styles.interviewInfo, responsiveStyles.interviewInfo]}>
              <Text
                style={[
                  styles.interviewTitle,
                  responsiveStyles.interviewTitle,
                ]}>
                {interview?.title || "Interview"}
              </Text>
              <Text
                style={[styles.interviewDesc, responsiveStyles.interviewDesc]}>
                {interview?.description || ""}
              </Text>
            </View>

            {/* Answers Section */}
            <View
              style={[styles.answersSection, responsiveStyles.answersSection]}>
              <Text
                style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>
                Candidate Answers (
                {(submission.answers?.length || 0) +
                  (Object.keys(submission.textAnswers || {}).length || 0)}
                )
              </Text>
              {(submission.answers && submission.answers.length > 0) ||
              (submission.textAnswers &&
                Object.keys(submission.textAnswers).length > 0) ? (
                <>
                  {submission.answers &&
                    submission.answers.map((answer, index) =>
                      renderAnswer(answer, index)
                    )}
                  {submission.textAnswers &&
                    Object.keys(submission.textAnswers).map((qIndex) =>
                      renderTextAnswer(qIndex, submission.textAnswers[qIndex])
                    )}
                </>
              ) : (
                <View style={[styles.noAnswers, responsiveStyles.noAnswers]}>
                  <Text
                    style={[
                      styles.noAnswersText,
                      responsiveStyles.noAnswersText,
                    ]}>
                    No answers found for this submission.
                  </Text>
                </View>
              )}
            </View>

            {/* Review Form */}
            <View style={[styles.reviewForm, responsiveStyles.reviewForm]}>
              <Text style={[styles.formTitle, responsiveStyles.formTitle]}>
                📝 Your Review
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  responsiveStyles.inputContainer,
                ]}>
                <Text style={[styles.inputLabel, responsiveStyles.inputLabel]}>
                  Score (0-10)
                </Text>
                <TextInput
                  placeholder="Enter score (e.g., 8.5)"
                  value={score}
                  onChangeText={setScore}
                  keyboardType="decimal-pad"
                  style={[styles.scoreInput, responsiveStyles.scoreInput]}
                  placeholderTextColor="#9CA3AF"
                  maxLength={4}
                />
              </View>

              <View
                style={[
                  styles.inputContainer,
                  responsiveStyles.inputContainer,
                ]}>
                <Text style={[styles.inputLabel, responsiveStyles.inputLabel]}>
                  Comments
                </Text>
                <TextInput
                  placeholder="Provide detailed feedback..."
                  value={comments}
                  onChangeText={setComments}
                  multiline
                  numberOfLines={4}
                  style={[styles.commentsInput, responsiveStyles.commentsInput]}
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, responsiveStyles.saveButton]}
                onPress={saveReview}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.saveButtonText,
                    responsiveStyles.saveButtonText,
                  ]}>
                  💾 Save Review
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
      marginBottom: isTablet ? 32 : 24,
      alignItems: "center",
    },
    submissionTitle: {
      fontSize: isDesktop ? 32 : isTablet ? 28 : isSmallPhone ? 24 : 26,
      marginBottom: isTablet ? 8 : 6,
    },
    submissionId: {
      fontSize: isDesktop ? 14 : isTablet ? 13 : 12,
      marginBottom: isTablet ? 4 : 2,
    },
    submittedAt: {
      fontSize: isDesktop ? 14 : isTablet ? 13 : 12,
    },
    interviewInfo: {
      paddingVertical: isDesktop ? 16 : isTablet ? 14 : 12,
      paddingHorizontal: isDesktop ? 20 : isTablet ? 18 : 16,
      marginBottom: isTablet ? 24 : 20,
    },
    interviewTitle: {
      fontSize: isDesktop ? 18 : isTablet ? 17 : 16,
      marginBottom: isTablet ? 4 : 2,
    },
    interviewDesc: {
      fontSize: isDesktop ? 14 : isTablet ? 13 : 12,
    },
    answersSection: {
      marginBottom: isTablet ? 32 : 24,
    },
    sectionTitle: {
      fontSize: isDesktop ? 18 : isTablet ? 16 : 15,
      marginBottom: isTablet ? 16 : 12,
    },
    answerCard: {
      paddingHorizontal: isDesktop ? 20 : isTablet ? 18 : 16,
      paddingVertical: isDesktop ? 16 : isTablet ? 14 : 12,
      marginBottom: isTablet ? 12 : 10,
    },
    questionLabel: {
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
    },
    recordedTime: {
      fontSize: isDesktop ? 12 : isTablet ? 11 : 10,
    },
    questionText: {
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
      marginBottom: isTablet ? 12 : 10,
    },
    playButton: {
      paddingVertical: isDesktop ? 10 : isTablet ? 9 : 8,
      paddingHorizontal: isDesktop ? 16 : isTablet ? 14 : 12,
    },
    playButtonText: {
      fontSize: isDesktop ? 14 : isTablet ? 13 : 12,
    },
    reviewForm: {
      marginBottom: isTablet ? 20 : 16,
    },
    formTitle: {
      fontSize: isDesktop ? 20 : isTablet ? 18 : 16,
      marginBottom: isTablet ? 16 : 12,
    },
    inputContainer: {
      marginBottom: isTablet ? 16 : 12,
    },
    inputLabel: {
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
      marginBottom: isTablet ? 6 : 4,
    },
    scoreInput: {
      paddingVertical: isDesktop ? 12 : isTablet ? 10 : 8,
      paddingHorizontal: isTablet ? 14 : 12,
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
    },
    commentsInput: {
      paddingVertical: isDesktop ? 12 : isTablet ? 10 : 8,
      paddingHorizontal: isTablet ? 14 : 12,
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
      minHeight: isTablet ? 100 : 80,
    },
    saveButton: {
      paddingVertical: isDesktop ? 16 : isTablet ? 14 : 12,
      marginTop: isTablet ? 8 : 4,
    },
    saveButtonText: {
      fontSize: isDesktop ? 17 : isTablet ? 16 : 15,
    },
    noAnswers: {
      paddingVertical: isTablet ? 20 : 16,
      alignItems: "center",
    },
    noAnswersText: {
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
  header: {
    alignItems: "center",
  },
  submissionTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  submissionId: {
    color: "#64748B",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  submittedAt: {
    color: "#94A3B8",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  interviewInfo: {
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
  interviewTitle: {
    color: "#F8FAFC",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  interviewDesc: {
    color: "#94A3B8",
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  answersSection: {},
  sectionTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  answerCard: {
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
  answerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  questionLabel: {
    color: "#3B82F6",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  recordedTime: {
    color: "#64748B",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  questionText: {
    color: "#F8FAFC",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    lineHeight: 20,
  },
  audioControls: {
    marginTop: 8,
  },
  playButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "flex-start",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  playButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  playingButton: {
    backgroundColor: "#EF4444",
  },
  playingButtonText: {
    color: "#FFFFFF",
  },
  textAnswerContainer: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  textAnswerText: {
    color: "#F8FAFC",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  reviewForm: {},
  formTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  inputContainer: {},
  inputLabel: {
    color: "#F8FAFC",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  scoreInput: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "400",
  },
  commentsInput: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "400",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#F8FAFC",
    fontSize: 16,
    textAlign: "center",
  },
  noAnswers: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noAnswersText: {
    color: "#94A3B8",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});
