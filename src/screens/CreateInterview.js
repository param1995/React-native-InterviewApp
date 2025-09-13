import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  FlatList,
} from "react-native";
import { storage } from "../services/storage";
import { v4 as uuidv4 } from "uuid";

const { width, height } = Dimensions.get("window");

// Responsive helper functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isSmallPhone = width < 375;

export default function CreateInterview({ navigation, route }) {
  const interview = route.params?.interview; // For editing
  const isEditing = !!interview;

  const [title, setTitle] = useState(interview?.title || "");
  const [desc, setDesc] = useState(interview?.description || "");
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState(interview?.questions || []);

  function addQuestion() {
    if (!question.trim()) return;
    setQuestions((prev) => [...prev, question.trim()]);
    setQuestion("");
  }

  function removeQuestion(index) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  async function save() {
    if (!title.trim()) return Alert.alert("Validation Error", "Title is required");
    if (questions.length === 0) return Alert.alert("Validation Error", "At least one question is required");

    try {
      const all = await storage.getInterviews();

      if (isEditing) {
        // Update existing interview
        const index = all.findIndex((i) => i.id === interview.id);
        if (index !== -1) {
          all[index] = {
            ...all[index],
            title: title.trim(),
            description: desc.trim(),
            questions,
          };
        }
      } else {
        // Create new interview
        all.push({
          id: uuidv4(),
          title: title.trim(),
          description: desc.trim(),
          questions,
        });
      }

      await storage.saveInterviews(all);
      Alert.alert("Success", `Interview ${isEditing ? 'updated' : 'created'} successfully!`);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Failed to save interview");
    }
  }

  const renderQuestion = ({ item, index }) => (
    <View style={[styles.questionItem, responsiveStyles.questionItem]}>
      <Text style={[styles.questionText, responsiveStyles.questionText]}>
        Q{index + 1}: {item}
      </Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeQuestion(index)}
        activeOpacity={0.7}
      >
        <Text style={styles.removeButtonText}>🗑️</Text>
      </TouchableOpacity>
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
          <View style={[styles.content, responsiveStyles.content]}>
            {/* Header Section */}
            <View style={[styles.header, responsiveStyles.header]}>
              <Text style={[styles.welcomeTitle, responsiveStyles.welcomeTitle]}>
                {isEditing ? "✏️ Edit Interview" : "➕ Create Interview"}
              </Text>
              <Text style={[styles.welcomeSubtitle, responsiveStyles.welcomeSubtitle]}>
                {isEditing ? "Update interview details and questions" : "Design a new interview assessment"}
              </Text>
            </View>

            {/* Title Input */}
            <View style={[styles.inputContainer, responsiveStyles.inputContainer]}>
              <Text style={[styles.inputLabel, responsiveStyles.inputLabel]}>
                Interview Title
              </Text>
              <TextInput
                placeholder="Enter interview title"
                value={title}
                onChangeText={setTitle}
                style={[styles.input, responsiveStyles.input]}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Description Input */}
            <View style={[styles.inputContainer, responsiveStyles.inputContainer]}>
              <Text style={[styles.inputLabel, responsiveStyles.inputLabel]}>
                Description
              </Text>
              <TextInput
                placeholder="Enter interview description"
                value={desc}
                onChangeText={setDesc}
                style={[styles.textArea, responsiveStyles.textArea]}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Add Question Section */}
            <View style={[styles.addQuestionSection, responsiveStyles.addQuestionSection]}>
              <Text style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>
                Questions ({questions.length})
              </Text>
              <View style={[styles.addQuestionContainer, responsiveStyles.addQuestionContainer]}>
                <TextInput
                  placeholder="Enter a question"
                  value={question}
                  onChangeText={setQuestion}
                  style={[styles.questionInput, responsiveStyles.questionInput]}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  style={[styles.addButton, responsiveStyles.addButton]}
                  onPress={addQuestion}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.addButtonText, responsiveStyles.addButtonText]}>
                    ➕ Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Questions List */}
            {questions.length > 0 && (
              <View style={[styles.questionsList, responsiveStyles.questionsList]}>
                <FlatList
                  data={questions}
                  keyExtractor={(item, index) => String(index)}
                  renderItem={renderQuestion}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.flatListContent}
                />
              </View>
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, responsiveStyles.saveButton]}
              onPress={save}
              activeOpacity={0.8}
            >
              <Text style={[styles.saveButtonText, responsiveStyles.saveButtonText]}>
                {isEditing ? "💾 Update Interview" : "💾 Create Interview"}
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
    inputContainer: {
      marginBottom: isTablet ? 24 : 20,
    },
    inputLabel: {
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
      marginBottom: isTablet ? 8 : 6,
    },
    input: {
      paddingVertical: isDesktop ? 16 : isTablet ? 14 : 12,
      paddingHorizontal: isTablet ? 16 : 14,
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
    },
    textArea: {
      paddingVertical: isDesktop ? 16 : isTablet ? 14 : 12,
      paddingHorizontal: isTablet ? 16 : 14,
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
      minHeight: isTablet ? 80 : 70,
    },
    addQuestionSection: {
      marginBottom: isTablet ? 24 : 20,
    },
    sectionTitle: {
      fontSize: isDesktop ? 18 : isTablet ? 16 : 15,
      marginBottom: isTablet ? 16 : 12,
    },
    addQuestionContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    questionInput: {
      flex: 1,
      paddingVertical: isDesktop ? 14 : isTablet ? 12 : 10,
      paddingHorizontal: isTablet ? 16 : 14,
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
      marginRight: isTablet ? 12 : 10,
    },
    addButton: {
      paddingVertical: isDesktop ? 14 : isTablet ? 12 : 10,
      paddingHorizontal: isDesktop ? 20 : isTablet ? 18 : 16,
    },
    addButtonText: {
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
    },
    questionsList: {
      marginBottom: isTablet ? 32 : 24,
    },
    questionItem: {
      paddingVertical: isDesktop ? 12 : isTablet ? 10 : 8,
      paddingHorizontal: isTablet ? 16 : 14,
      marginBottom: isTablet ? 8 : 6,
    },
    questionText: {
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
    },
    saveButton: {
      paddingVertical: isDesktop ? 18 : isTablet ? 16 : 14,
      marginBottom: isTablet ? 20 : 16,
    },
    saveButtonText: {
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
  inputContainer: {},
  inputLabel: {
    color: "#F8FAFC",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
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
  textArea: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "400",
    textAlignVertical: "top",
  },
  addQuestionSection: {},
  sectionTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  addQuestionContainer: {},
  questionInput: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "400",
  },
  addButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  questionsList: {},
  flatListContent: {
    paddingBottom: 10,
  },
  questionItem: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#334155",
  },
  questionText: {
    color: "#F8FAFC",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});
