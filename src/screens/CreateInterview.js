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
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native";
import { storage } from "../services/storage";
import { v4 as uuidv4 } from "uuid";

// Fallback id generator
const generateId = () => {
  try {
    return uuidv4();
  } catch (e) {
    return `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

const { width, height } = Dimensions.get("window");
// Responsive helper functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;
const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isSmallPhone = width < 375;

export default function CreateInterview({ navigation, route }) {
  const editing = route.params?.interview;
  const [title, setTitle] = useState(editing?.title || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [questions, setQuestions] = useState(editing?.questions || []);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const responsiveStyles = getResponsiveStyles();
  const addQuestion = () => {
    if (currentQuestion.trim()) {
      setQuestions([...questions, currentQuestion.trim()]);
      setCurrentQuestion("");
    }
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {
    console.log(
      "🎯 HandleSave called on",
      Platform.OS,
      ", editing:",
      !!editing
    );
    if (!title.trim()) return Alert.alert("Error", "Title is required");

    const interview = {
      id: editing?.id || generateId(),
      title,
      description,
      questions: questions.length > 0 ? questions : editing?.questions || [],
    };
    console.log("🎯 Saving interview:", interview);
    try {
      let updatedList;
      if (editing) {
        console.log("🎯 Editing existing interview");
        const list = await storage.getInterviews();
        updatedList = list.map((i) => (i.id === interview.id ? interview : i));
        await storage.saveInterviews(updatedList);
      } else {
        console.log("🎯 Creating new interview");
        updatedList = await storage.addInterview(interview);
      }
      console.log("🎯 Save successful, navigating to AdminDashboard");
      Alert.alert(
        "✅ Success",
        `Interview ${editing ? "updated" : "created"} successfully!`
      );
      console.log("🧭 Navigating to AdminDashboard with params:", {
        interviewCreated: !editing,
        newInterview: interview,
      });
      navigation.navigate("AdminDashboard", {
        interviewCreated: !editing,
        newInterview: interview,
      });
    } catch (e) {
      console.error("🎯 Save failed:", e);
      Alert.alert("Error", e.message || "Failed to save interview");
    }
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
          keyboardShouldPersistTaps="handled">
          <View
            style={[
              styles.backgroundGradient,
              responsiveStyles.backgroundGradient,
            ]}
          />
          <View style={[styles.content, responsiveStyles.content]}>
            <View style={[styles.header, responsiveStyles.header]}>
              <Text
                style={[styles.welcomeTitle, responsiveStyles.welcomeTitle]}>
                {editing ? "✏️ Edit Interview" : "➕ Create Interview"}
              </Text>
              <Text
                style={[
                  styles.welcomeSubtitle,
                  responsiveStyles.welcomeSubtitle,
                ]}>
                {editing
                  ? "Update interview details"
                  : "Design a new interview assessment"}
              </Text>
            </View>
            <View
              style={[styles.inputContainer, responsiveStyles.inputContainer]}>
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
            <View
              style={[styles.inputContainer, responsiveStyles.inputContainer]}>
              <Text style={[styles.inputLabel, responsiveStyles.inputLabel]}>
                Description
              </Text>
              <TextInput
                placeholder="Enter interview description"
                value={description}
                onChangeText={setDescription}
                style={[styles.textArea, responsiveStyles.textArea]}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View
              style={[
                styles.questionsSection,
                responsiveStyles.questionsSection,
              ]}>
              <Text
                style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>
                📝 Interview Questions
              </Text>
              <View
                style={[
                  styles.addQuestionContainer,
                  responsiveStyles.addQuestionContainer,
                ]}>
                <TextInput
                  placeholder="Enter a question"
                  value={currentQuestion}
                  onChangeText={setCurrentQuestion}
                  style={[styles.questionInput, responsiveStyles.questionInput]}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={2}
                />
                <TouchableOpacity
                  style={[styles.addButton, responsiveStyles.addButton]}
                  onPress={addQuestion}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.addButtonText,
                      responsiveStyles.addButtonText,
                    ]}>
                    ➕ Add
                  </Text>
                </TouchableOpacity>
              </View>
              {questions.length > 0 && (
                <View
                  style={[
                    styles.questionsList,
                    responsiveStyles.questionsList,
                  ]}>
                  <Text
                    style={[
                      styles.questionsListTitle,
                      responsiveStyles.questionsListTitle,
                    ]}>
                    Added Questions ({questions.length})
                  </Text>
                  {questions.map((question, index) => (
                    <View
                      key={index}
                      style={[
                        styles.questionItem,
                        responsiveStyles.questionItem,
                      ]}>
                      <Text
                        style={[
                          styles.questionText,
                          responsiveStyles.questionText,
                        ]}>
                        {index + 1}. {question}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.removeButton,
                          responsiveStyles.removeButton,
                        ]}
                        onPress={() => removeQuestion(index)}
                        activeOpacity={0.7}>
                        <Text
                          style={[
                            styles.removeButtonText,
                            responsiveStyles.removeButtonText,
                          ]}>
                          🗑️
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.saveButton, responsiveStyles.saveButton]}
              onPress={handleSave}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.saveButtonText,
                  responsiveStyles.saveButtonText,
                ]}>
                {editing ? "💾 Update Interview" : "💾 Create Interview"}
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
    saveButton: {
      paddingVertical: isDesktop ? 18 : isTablet ? 16 : 14,
      marginBottom: isTablet ? 20 : 16,
    },
    saveButtonText: {
      fontSize: isDesktop ? 18 : isTablet ? 17 : 16,
    },
    questionsSection: {
      marginBottom: isTablet ? 24 : 20,
    },
    sectionTitle: {
      fontSize: isDesktop ? 18 : isTablet ? 16 : 15,
      marginBottom: isTablet ? 16 : 12,
    },
    addQuestionContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: isTablet ? 16 : 12,
      textAlign: "center",
      alignItems: "center",
      justifyContent: "center",
    },
    questionInput: {
      flex: 1,
      paddingVertical: isDesktop ? 14 : isTablet ? 12 : 10,
      paddingHorizontal: isTablet ? 14 : 12,
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
      marginRight: isTablet ? 12 : 10,
      minHeight: isTablet ? 60 : 50,
    },
    addButton: {
      paddingVertical: isDesktop ? 14 : isTablet ? 12 : 10,
      paddingHorizontal: isTablet ? 16 : 14,
    },
    addButtonText: {
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
    },
    questionsList: {
      marginTop: isTablet ? 16 : 12,
    },
    questionsListTitle: {
      fontSize: isDesktop ? 16 : isTablet ? 15 : 14,
      marginBottom: isTablet ? 12 : 10,
    },
    questionItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: "#1E293B",
      borderRadius: 8,
      padding: isTablet ? 12 : 10,
      marginBottom: isTablet ? 8 : 6,
      borderWidth: 1,
      borderColor: "#334155",
    },
    questionText: {
      flex: 1,
      fontSize: isDesktop ? 15 : isTablet ? 14 : 13,
      lineHeight: isTablet ? 20 : 18,
      marginRight: isTablet ? 10 : 8,
    },
    removeButton: {
      padding: isTablet ? 6 : 4,
    },
    removeButtonText: {
      fontSize: isTablet ? 16 : 14,
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
  saveButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    ...Platform.select({
      web: {
        boxShadow: "0px 8px 16px rgba(59, 130, 246, 0.3)",
      },
    }),
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  questionsSection: {},
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
    textAlignVertical: "top",
  },
  addButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  questionsList: {},
  questionsListTitle: {
    color: "#F8FAFC",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  questionItem: {},
  questionText: {
    color: "#94A3B8",
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  removeButton: {},
  removeButtonText: {},
});
