// Task management service for interview submissions and reviews
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storage } from "./storage";
const TASK_STORAGE_KEY = "TASKS_v1";
export const taskManager = {
  async submitTask(taskType, taskData) {
    try {
      const tasks = await this.getTasks();
      const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: taskType,
        data: taskData,
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      tasks.push(newTask);
      await AsyncStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
      return newTask;
    } catch (error) {
      console.error("Error submitting task:", error);
      throw error;
    }
  },

  async getTasks() {
    try {
      const tasks = await AsyncStorage.getItem(TASK_STORAGE_KEY);
      return JSON.parse(tasks || "[]");
    } catch (error) {
      console.error("Error getting tasks:", error);
      return [];
    }
  },

  // Update task status
  async updateTaskStatus(taskId, status, additionalData = {}) {
    try {
      const tasks = await this.getTasks();
      const taskIndex = tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          status,
          updatedAt: Date.now(),
          ...additionalData,
        };
        await AsyncStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
        return tasks[taskIndex];
      }
      return null;
    } catch (error) {
      console.error("Error updating task status:", error);
      throw error;
    }
  },

  // Get tasks by type
  async getTasksByType(taskType) {
    const tasks = await this.getTasks();
    return tasks.filter((task) => task.type === taskType);
  },

  // Get tasks by status
  async getTasksByStatus(status) {
    const tasks = await this.getTasks();
    return tasks.filter((task) => task.status === status);
  },

  // Delete task
  async deleteTask(taskId) {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter((task) => task.id !== taskId);
      await AsyncStorage.setItem(
        TASK_STORAGE_KEY,
        JSON.stringify(filteredTasks)
      );
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  // Get task statistics
  async getTaskStats() {
    const tasks = await this.getTasks();
    const stats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      failed: tasks.filter((t) => t.status === "failed").length,
      interview_submissions: tasks.filter(
        (t) => t.type === "interview_submission"
      ).length,
      review_submissions: tasks.filter((t) => t.type === "review_submission")
        .length,
    };
    return stats;
  },
  async cleanupOldTasks() {
    try {
      const tasks = await this.getTasks();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      const activeTasks = tasks.filter(
        (task) => task.status !== "completed" || task.updatedAt > thirtyDaysAgo
      );

      await AsyncStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(activeTasks));
      return tasks.length - activeTasks.length; // Return number of cleaned tasks
    } catch (error) {
      console.error("Error cleaning up old tasks:", error);
      throw error;
    }
  },
};

// Task types constants
export const TASK_TYPES = {
  INTERVIEW_SUBMISSION: "interview_submission",
  REVIEW_SUBMISSION: "review_submission",
};

// Task status constants
export const TASK_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};
