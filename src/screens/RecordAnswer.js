import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  PermissionsAndroid,
  Platform,
  Linking,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { storage } from "../services/storage";
import { v4 as uuidv4 } from "uuid";

// Fallback id generator
const generateId = () => {
  try {
    return uuidv4();
  } catch (e) {
    return `recording-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isSmallPhone = width < 375;

export default function RecordAnswer({ route, navigation }) {
  const { interview } = route.params;

  const [recordings, setRecordings] = useState([]);
  const [currentRecording, setCurrentRecording] = useState(null);
  const [recordingStates, setRecordingStates] = useState({});

  // -------- Request Microphone Permission --------
  async function requestAudioPermission() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status === "granted") return true;

      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message:
              "This app needs access to your microphone to record interview answers.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return false;
    } catch (err) {
      console.warn("Permission error:", err);
      return false;
    }
  }

  // -------- Start Recording --------
  async function startRecording(questionIndex) {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission Denied",
        "Microphone access is required. Please enable it in settings."
      );
      if (Platform.OS === "android") {
        Linking.openSettings();
      }
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setCurrentRecording(recording);
      setRecordingStates((prev) => ({ ...prev, [questionIndex]: "recording" }));
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }

  // -------- Stop Recording --------
  async function stopRecording(questionIndex) {
    if (!currentRecording) return;

    try {
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();

      const newRecordings = [
        ...recordings,
        { id: generateId(), questionIndex, uri },
      ];
      setRecordings(newRecordings);
      setCurrentRecording(null);
      setRecordingStates((prev) => ({ ...prev, [questionIndex]: "recorded" }));
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  }

  // -------- Save Answer to Storage --------
  async function saveAnswers() {
    try {
      const submissions = await storage.getSubmissions();
      const newSubmission = {
        id: generateId(),
        interviewId: interview.id,
        answers: recordings,
        submittedAt: new Date().toISOString(),
      };
      await storage.saveSubmissions([...submissions, newSubmission]);
      Alert.alert("✅ Success", "Your answers have been saved.");
      navigation.goBack();
    } catch (err) {
      console.error("Error saving answers:", err);
      Alert.alert("❌ Error", "Failed to save answers.");
    }
  }

  const getRecordingStatus = (index) => {
    return recordingStates[index] || "not_recorded";
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{interview.title}</Text>
        <Text style={styles.description}>{interview.description}</Text>
      </View>

      <FlatList
        data={interview.questions || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          const status = getRecordingStatus(index);
          return (
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>
                Q{index + 1}: {item}
              </Text>

              <View style={styles.buttonContainer}>
                {status !== "recording" ? (
                  <TouchableOpacity
                    style={[styles.button, styles.startButton]}
                    onPress={() => startRecording(index)}>
                    <Text style={styles.buttonText}>🎤 Start Recording</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.button, styles.stopButton]}
                    onPress={() => stopRecording(index)}>
                    <Text style={styles.buttonText}>⏹ Stop Recording</Text>
                  </TouchableOpacity>
                )}
                {status === "recorded" && (
                  <Text style={styles.recordedText}>✅ Recorded</Text>
                )}
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity style={styles.saveButton} onPress={saveAnswers}>
        <Text style={styles.saveButtonText}>💾 Save Answers</Text>
      </TouchableOpacity>
    </View>
  );
}
const baseFontSize = isDesktop ? 18 : isTablet ? 16 : isSmallPhone ? 13 : 15;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1B2A",
    paddingHorizontal: isDesktop ? 50 : isTablet ? 30 : 20,
    paddingTop: isSmallPhone ? 15 : 20,
  },
  header: {
    marginBottom: isSmallPhone ? 15 : 20,
    alignItems: "center",
  },
  title: {
    fontSize: isDesktop ? 28 : isTablet ? 24 : isSmallPhone ? 20 : 22,
    fontWeight: "bold",
    color: "#E0E1DD",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: baseFontSize,
    color: "#A9A9A9",
    textAlign: "center",
  },

  // Questions List
  listContainer: {
    paddingBottom: isSmallPhone ? 70 : 100,
  },
  questionCard: {
    backgroundColor: "#1B263B",
    borderRadius: 12,
    padding: isDesktop ? 22 : isTablet ? 18 : isSmallPhone ? 14 : 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#415A77",
  },
  questionText: {
    fontSize: baseFontSize,
    color: "#E0E1DD",
    marginBottom: 15,
    lineHeight: 22,
  },

  // Buttons
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    paddingVertical: isSmallPhone ? 10 : 12,
    paddingHorizontal: isSmallPhone ? 15 : 20,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  startButton: {
    backgroundColor: "#E94560",
  },
  stopButton: {
    backgroundColor: "#1D3557",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: baseFontSize,
    fontWeight: "600",
  },
  recordedText: {
    color: "#06D6A0",
    fontSize: baseFontSize - 2,
    fontWeight: "600",
  },

  // Save Button
  saveButton: {
    backgroundColor: "#06D6A0",
    paddingVertical: isSmallPhone ? 12 : 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: isDesktop ? 20 : isTablet ? 18 : 16,
    fontWeight: "bold",
  },
});
