// storage service code here
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USERS: "USERS_v1",
  INTERVIEWS: "INTERVIEWS_v1",
  SUBMISSIONS: "SUBMISSIONS_v1",
};

export async function initStorage() {
  // Seed with test accounts if not present
  const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
  if (!users) {
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
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seed));
  }
  const intv = await AsyncStorage.getItem(STORAGE_KEYS.INTERVIEWS);
  if (!intv)
    await AsyncStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify([]));
  const subs = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  if (!subs)
    await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
}

export const storage = {
  async getUsers() {
    const v = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return JSON.parse(v || "[]");
  },
  async saveUsers(users) {
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  async getInterviews() {
    const v = await AsyncStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    return JSON.parse(v || "[]");
  },
  async saveInterviews(data) {
    await AsyncStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(data));
  },
  async getSubmissions() {
    const v = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return JSON.parse(v || "[]");
  },
  async saveSubmissions(data) {
    await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(data));
  },
};
