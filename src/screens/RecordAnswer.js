import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { storage } from "../services/storage";
import { v4 as uuidv4 } from "uuid";

const { width, height } = Dimensions.get("window");

// Responsive helper functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isSmallPhone = width < 375;

export default function RecordAnswer({ route, navigation }) {
  const { interview } = route.params;
  const [recording, setRecording] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [recordingStates, setRecordingStates] = useState({});
  const [sound, setSound] = useState(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  async function startRecording(questionIndex) {
    try {
      // Stop any existing recording
      if (recording) {
        await stopRecording();
      }

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission Required", "Microphone access is required to record answers.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();

      setRecording(rec);
      setCurrentQuestionIndex(questionIndex);
      setRecordingStates(prev => ({ ...prev, [questionIndex]: 'recording' }));
    } catch (e) {
      Alert.alert("Recording Error", "Failed to start recording. Please try again.");
      console.error(e);
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setRecording(null);
      setRecordingStates(prev => ({ ...prev, [currentQuestionIndex]: 'recorded' }));

      // Check if we already have an answer for this question
      const existingAnswerIndex = answers.findIndex(a => a.qIndex === currentQuestionIndex);

      if (existingAnswerIndex !== -1) {
        // Update existing answer
        setAnswers(prev => prev.map((answer, index) =>
          index === existingAnswerIndex
            ? { ...answer, uri, recordedAt: Date.now() }
            : answer
        ));
      } else {
        // Add new answer
        setAnswers(prev => [...prev, {
          id: uuidv4(),
          qIndex: currentQuestionIndex,
          uri,
          recordedAt: Date.now()
        }]);
      }

      setCurrentQuestionIndex(null);
    } catch (e) {
      Alert.alert("Recording Error", "Failed to stop recording. Please try again.");
      console.error(e);
    }
  }

  async function playRecording(uri) {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
    } catch (e) {
      Alert.alert("Playback Error", "Failed to play recording.");
      console.error(e);
    }
  }

  async function submit() {
    if (answers.length === 0) {
      Alert.alert("No Answers", "Please record at least one answer before submitting.");
      return;
    }

    if (answers.length !== interview.questions.length) {
      Alert.alert(
        "Incomplete",
        `You've recorded ${answers.length} out of ${interview.questions.length} questions. Continue anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Submit",
            onPress: () => submitAnswers(),
          },
        ]
      );
      return;
    }

    submitAnswers();
  }

  async function submitAnswers() {
    try {
      const subs = await storage.getSubmissions();
      subs.push({
        id: uuidv4(),
        interviewId: interview.id,
        candidateId: "candidate@test.com", // In a real app, get from auth context
        submittedAt: Date.now(),
        answers,
      });
      await storage.saveSubmissions(subs);
      Alert.alert("Success!", "Your answers have been submitted successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert("Submission Error", "Failed to submit answers. Please try again.");
      console.error(e);
    }
  }

  const getAnswerStatus = (questionIndex) => {
    const answer = answers.find(a => a.qIndex === questionIndex);
    if (answer) return 'recorded';
    if (recordingStates[questionIndex] === 'recording') return 'recording';
    return 'not_recorded';
  };

  const renderQuestion = ({ item, index }) => {
    const status = getAnswerStatus(index);
    const isRecording = status === 'recording';
    const isRecorded = status === 'recorded';

    return (
      <View style={[styles.questionCard, responsiveStyles.questionCard]}>
        <View style={styles.questionHeader}>
          <Text style={[styles.questionNumber, responsiveStyles.questionNumber]}>
            Q{index + 1}
          </Text>
          <View style={[
            styles.statusIndicator,
            isRecorded && styles.recordedIndicator,
            isRecording && styles.recordingIndicator
          ]}>
            <Text style={[
              styles.statusText,
              isRecorded && styles.recordedText,
              isRecording && styles.recordingText
            ]}>
              {isRecording ? '🔴 REC' : isRecorded ? '✅ RECORDED' : '⏸️ READY'}
            </Text>
          </View>
        </View>

        <Text style={[styles.questionText, responsiveStyles.questionText]}>
          {item}
        </Text>

        <View style={styles.controlsContainer}>
          {!isRecording ? (
            <TouchableOpacity
              style={[
                styles.recordButton,
                responsiveStyles.recordButton,
                isRecorded && styles.reRecordButton
              ]}
              onPress={() => startRecording(index)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.recordButtonText,
                responsiveStyles.recordButtonText,
                isRecorded && styles.reRecordButtonText
              ]}>
                {isRecorded ? '🎤 Re-record' : '🎤 Record Answer'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.stopButton, responsiveStyles.stopButton]}
              onPress={stopRecording}
              activeOpacity={0.8}
            >
              <Text style={[styles.stopButtonText, responsiveStyles.stopButtonText]}>
                ⏹️ Stop Recording
              </Text>
            </TouchableOpacity>
          )}

          {isRecorded && (
            <TouchableOpacity
              style={[styles.playButton, responsiveStyles.playButton]}
              onPress={() => playRecording(answers.find(a => a.qIndex === index)?.uri)}
              activeOpacity={0.8}
            >
              <Text style={[styles.playButtonText, responsiveStyles.playButtonText]}>
                ▶️ Play
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const responsiveStyles = getResponsiveStyles();
  const recordedCount = answers.length;
  const totalQuestions = interview.questions.length;

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
              <Text style={[styles.interviewTitle, responsiveStyles.interviewTitle]}>
                🎤 {interview.title}
              </Text>
              <Text style={[styles.progressText, responsiveStyles.progressText]}>
                Progress: {recordedCount}/{totalQuestions} questions recorded
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressContainer, responsiveStyles.progressContainer]}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${(recordedCount / totalQuestions) * 100}%` }
                ]}
              />
            </View>

            {/* Questions List */}
            <View style={[styles.questionsContainer, responsiveStyles.questionsContainer]}>
              <FlatList
                data={interview.questions}
                keyExtractor={(q, i) => String(i)}
                renderItem={renderQuestion}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                responsiveStyles.submitButton,
                recordedCount === 0 && styles.disabledButton
              ]}
              onPress={submit}
              activeOpacity={0.8}
              disabled={recordedCount === 0}
            >
              <Text style={[
                styles.submitButtonText,
                responsiveStyles.submitButtonText,
                recordedCount === 0 && styles.disabledButtonText
              ]}>
                📤 Submit Answers ({recordedCount}/{totalQuestions})
              </Text>
            </TouchableOpacity>
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
      marginBottom: isTablet ? 24 : 20,
      alignItems: "center",
    },
    interviewTitle: {
      fontSize: isDesktop ? 32 : isTablet ? 28 : isSmallPhone ? 24 : 26,
      marginBottom: isTablet ? 8 : 6,
    },
    progressText: {
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
    },
    progressContainer: {
      height: isTablet ? 8 : 6,
      backgroundColor: "#334155",
      borderRadius: 4,
      marginBottom: isTablet ? 32 : 24,
    },
    questionsContainer: {
      flex: 1,
      marginBottom: isTablet ? 32 : 24,
    },
    questionCard: {
      paddingHorizontal: isDesktop ? 24 : isTablet ? 20 : 16,
      paddingVertical: isDesktop ? 20 : isTablet ? 18 : 16,
      marginBottom: isTablet ? 16 : 12,
    },
    questionNumber: {
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
    },
    questionText: {
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
      marginBottom: isTablet ? 16 : 12,
    },
    recordButton: {
      paddingVertical: isDesktop ? 12 : isTablet ? 11 : 10,
      paddingHorizontal: isDesktop ? 20 : isTablet ? 18 : 16,
      marginRight: isTablet ? 12 : 10,
    },
    recordButtonText: {
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
    },
    stopButton: {
      paddingVertical: isDesktop ? 12 : isTablet ? 11 : 10,
      paddingHorizontal: isDesktop ? 20 : isTablet ? 18 : 16,
    },
    stopButtonText: {
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
    },
    playButton: {
      paddingVertical: isDesktop ? 10 : isTablet ? 9 : 8,
      paddingHorizontal: isDesktop ? 16 : isTablet ? 14 : 12,
    },
    playButtonText: {
      fontSize: isDesktop ? 14 : isTablet ? 13 : 12,
    },
    submitButton: {
      paddingVertical: isDesktop ? 18 : isTablet ? 16 : 14,
      marginBottom: isTablet ? 20 : 16,
    },
    submitButtonText: {
      fontSize: isDesktop ? 18 : isTablet ? 17 : 16,
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
  interviewTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  progressText: {
    color: "#94A3B8",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  progressContainer: {
    backgroundColor: "#334155",
    borderRadius: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  questionsContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 10,
  },
  questionCard: {
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
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  questionNumber: {
    color: "#3B82F6",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  statusIndicator: {
    backgroundColor: "#64748B",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  recordedIndicator: {
    backgroundColor: "#10B981",
  },
  recordedText: {
    color: "#FFFFFF",
  },
  recordingIndicator: {
    backgroundColor: "#EF4444",
  },
  recordingText: {
    color: "#FFFFFF",
  },
  questionText: {
    color: "#F8FAFC",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    lineHeight: 24,
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  recordButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  recordButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  reRecordButton: {
    backgroundColor: "#F59E0B",
  },
  reRecordButtonText: {
    color: "#FFFFFF",
  },
  stopButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  stopButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  playButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  playButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  submitButton: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  disabledButton: {
    backgroundColor: "#64748B",
  },
  disabledButtonText: {
    color: "#94A3B8",
  },
});
