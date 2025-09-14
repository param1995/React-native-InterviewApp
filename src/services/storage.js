import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Robust cross-platform storage wrapper:
 * - Uses window.localStorage on web
 * - Uses AsyncStorage on native (Android / iOS)
 *
 * Notes:
 * - Make sure @react-native-async-storage/async-storage is installed & native pods are up-to-date.
 * - This file logs helpful debug messages so you can see when get/set runs.
 */

const STORAGE_KEYS = {
  USERS: "USERS_v1",
  INTERVIEWS: "INTERVIEWS_v1",
  SUBMISSIONS: "SUBMISSIONS_v1",
};
const isWeb =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const sampleInterviews = [
  {
    id: "sample-interview-1",
    title: "React Native Developer Interview",
    description: "Test your React Native skills with this interview.",
    questions: [
      "What are the main components of React Native?",
      "How does state management work in React Native?",
      "Explain the difference between useState and useEffect.",
      "How do you handle navigation in React Native apps?",
      "What are performance optimization techniques in React Native?",
    ],
  },
  {
    id: "sample-interview-2",
    title: "JavaScript Fundamentals",
    description: "Basic JavaScript concepts and programming questions.",
    questions: [
      "What is the difference between var, let, and const?",
      "Explain closures in JavaScript.",
      "How does the 'this' keyword work?",
      "What are promises and how do they work?",
      "Describe the event loop in JavaScript.",
    ],
  },
];

async function setItem(key, value) {
  try {
    if (isWeb) {
      window.localStorage.setItem(key, value);
      console.log(`✅ Web: localStorage.setItem(${key})`);
    } else {
      await AsyncStorage.setItem(key, value);
      console.log(`✅ Mobile: AsyncStorage.setItem(${key})`);
    }
  } catch (e) {
    console.error(`❌ setItem(${key}) failed:`, e);
    throw e;
  }
}

async function getItem(key) {
  try {
    if (isWeb) {
      const v = window.localStorage.getItem(key);
      console.log(
        `📖 Web: localStorage.getItem(${key}) ->`,
        v ? "exists" : "null"
      );
      return v;
    } else {
      const v = await AsyncStorage.getItem(key);
      console.log(
        `📖 Mobile: AsyncStorage.getItem(${key}) ->`,
        v ? "exists" : "null"
      );
      return v;
    }
  } catch (e) {
    console.error(`❌ getItem(${key}) failed:`, e);
    throw e;
  }
}

async function removeItem(key) {
  try {
    if (isWeb) {
      window.localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
    console.log(`🗑 removeItem(${key})`);
  } catch (e) {
    console.error(`❌ removeItem(${key}) failed:`, e);
    throw e;
  }
}

export async function initStorage() {
  console.log("🔧 initStorage — platform:", Platform.OS, "isWeb:", isWeb);
  try {
    const usersRaw = await getItem(STORAGE_KEYS.USERS);
    if (usersRaw === null) {
      const seed = [
        {
          id: "admin@test.com",
          name: "Admin User",
          role: "admin",
          password: "admin123",
        },
        {
          id: "reviewer@test.com",
          name: "Reviewer User",
          role: "reviewer",
          password: "reviewer123",
        },
        {
          id: "candidate@test.com",
          name: "Candidate User",
          role: "candidate",
          password: "candidate123",
        },
      ];
      await setItem(STORAGE_KEYS.USERS, JSON.stringify(seed));
      console.log("🔧 Seeded default users");
    }

    // seed interviews (only on first run)
    const intvRaw = await getItem(STORAGE_KEYS.INTERVIEWS);
    if (intvRaw === null) {
      await setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(sampleInterviews));
      console.log("🔧 Seeded sample interviews (first run only)");
    } else {
      console.log("✅ Interviews exist - skipping seed");
    }

    // seed submissions
    const subsRaw = await getItem(STORAGE_KEYS.SUBMISSIONS);
    if (subsRaw === null) {
      await setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
      console.log("🔧 Initialized submissions");
    }

    console.log("✅ Storage initialization completed");
  } catch (e) {
    console.error("❌ Storage initialization error:", e);
  }
}

export const storage = {
  /* users */
  async getUsers() {
    const raw = await getItem(STORAGE_KEYS.USERS);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("❌ parse users failed:", e);
      return [];
    }
  },
  async saveUsers(users) {
    await setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  /* interviews */
  async getInterviews() {
    try {
      const raw = await getItem(STORAGE_KEYS.INTERVIEWS);
      const parsed = raw ? JSON.parse(raw) : [];
      console.log("📖 getInterviews ->", parsed.length, "items");
      return parsed;
    } catch (e) {
      console.error("❌ Error getting interviews:", e);
      return [];
    }
  },

  async saveInterviews(list) {
    try {
      await setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(list));
      console.log("💾 saveInterviews ->", list.length);
      return list;
    } catch (e) {
      console.error("❌ Error saving interviews:", e);
      throw e;
    }
  },

  async addInterview(interview) {
    const list = await storage.getInterviews();
    const updated = [...list, interview];
    await storage.saveInterviews(updated);
    console.log("➕ addInterview -> newCount:", updated.length);
    return updated;
  },

  async deleteInterview(interviewId) {
    const list = await storage.getInterviews();
    const updated = list.filter((i) => i.id !== interviewId);
    await storage.saveInterviews(updated);
    console.log("🗑 deleteInterview -> newCount:", updated.length);
    return updated;
  },

  /* submissions */
  async getSubmissions() {
    const raw = await getItem(STORAGE_KEYS.SUBMISSIONS);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("❌ parse submissions failed:", e);
      return [];
    }
  },
  async saveSubmissions(data) {
    await setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(data));
  },
  async clearInterviews() {
    await removeItem(STORAGE_KEYS.INTERVIEWS);
    return [];
  },
  async clearAll() {
    if (isWeb) {
      window.localStorage.clear();
      console.log("🧹 localStorage cleared");
    } else {
      await AsyncStorage.clear();
      console.log("🧹 AsyncStorage cleared");
    }
  },
};
