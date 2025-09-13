// Interview Task Manager - handles interview task creation, assignment, and tracking
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storage } from "./storage";
import { taskManager, TASK_TYPES, TASK_STATUS } from "./taskManager";

const INTERVIEW_TASKS_KEY = "INTERVIEW_TASKS_v1";

export const interviewTaskManager = {
  // Create a new interview task
  async createInterviewTask(interviewData) {
    try {
      const tasks = await this.getInterviewTasks();
      const newTask = {
        id: `interview_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: interviewData.title,
        description: interviewData.description,
        questions: interviewData.questions,
        assignedCandidates: [], // Array of candidate IDs
        status: 'active', // 'active', 'completed', 'archived'
        createdBy: interviewData.createdBy || 'admin@test.com',
        createdAt: Date.now(),
        deadline: interviewData.deadline,
        priority: interviewData.priority || 'medium', // 'low', 'medium', 'high'
        tags: interviewData.tags || [],
        submissions: [], // Array of submission IDs
        settings: {
          allowMultipleSubmissions: interviewData.allowMultipleSubmissions || false,
          requireAllQuestions: interviewData.requireAllQuestions || true,
          timeLimit: interviewData.timeLimit, // in minutes
          autoGrade: interviewData.autoGrade || false,
        },
      };

      tasks.push(newTask);
      await AsyncStorage.setItem(INTERVIEW_TASKS_KEY, JSON.stringify(tasks));

      // Also save to main interviews storage for backward compatibility
      const interviews = await storage.getInterviews();
      interviews.push({
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        questions: newTask.questions,
      });
      await storage.saveInterviews(interviews);

      return newTask;
    } catch (error) {
      console.error('Error creating interview task:', error);
      throw error;
    }
  },

  // Get all interview tasks
  async getInterviewTasks() {
    try {
      const tasks = await AsyncStorage.getItem(INTERVIEW_TASKS_KEY);
      return JSON.parse(tasks || '[]');
    } catch (error) {
      console.error('Error getting interview tasks:', error);
      return [];
    }
  },

  // Get interview task by ID
  async getInterviewTaskById(taskId) {
    const tasks = await this.getInterviewTasks();
    return tasks.find(task => task.id === taskId);
  },

  // Update interview task
  async updateInterviewTask(taskId, updates) {
    try {
      const tasks = await this.getInterviewTasks();
      const taskIndex = tasks.findIndex(task => task.id === taskId);

      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...updates,
          updatedAt: Date.now(),
        };
        await AsyncStorage.setItem(INTERVIEW_TASKS_KEY, JSON.stringify(tasks));
        return tasks[taskIndex];
      }
      return null;
    } catch (error) {
      console.error('Error updating interview task:', error);
      throw error;
    }
  },

  // Assign candidates to interview task
  async assignCandidates(taskId, candidateIds) {
    try {
      const task = await this.getInterviewTaskById(taskId);
      if (!task) throw new Error('Interview task not found');

      const updatedTask = await this.updateInterviewTask(taskId, {
        assignedCandidates: [...new Set([...task.assignedCandidates, ...candidateIds])],
      });

      // Create notification tasks for assigned candidates
      for (const candidateId of candidateIds) {
        await taskManager.submitTask(TASK_TYPES.INTERVIEW_SUBMISSION, {
          taskId,
          candidateId,
          type: 'assignment',
          message: `New interview task assigned: ${task.title}`,
        });
      }

      return updatedTask;
    } catch (error) {
      console.error('Error assigning candidates:', error);
      throw error;
    }
  },

  // Submit interview response
  async submitInterviewResponse(taskId, candidateId, answers) {
    try {
      const task = await this.getInterviewTaskById(taskId);
      if (!task) throw new Error('Interview task not found');

      // Create submission in main storage
      const submissions = await storage.getSubmissions();
      const newSubmission = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        interviewId: taskId,
        candidateId,
        submittedAt: Date.now(),
        answers,
      };
      submissions.push(newSubmission);
      await storage.saveSubmissions(submissions);

      // Update task with submission
      const updatedTask = await this.updateInterviewTask(taskId, {
        submissions: [...task.submissions, newSubmission.id],
      });

      // Create task notification
      await taskManager.submitTask(TASK_TYPES.INTERVIEW_SUBMISSION, {
        taskId,
        candidateId,
        submissionId: newSubmission.id,
        type: 'submission',
        message: `Interview submitted: ${task.title}`,
      });

      return newSubmission;
    } catch (error) {
      console.error('Error submitting interview response:', error);
      throw error;
    }
  },

  // Get tasks assigned to candidate
  async getTasksForCandidate(candidateId) {
    const tasks = await this.getInterviewTasks();
    return tasks.filter(task =>
      task.status === 'active' &&
      task.assignedCandidates.includes(candidateId)
    );
  },

  // Get submissions for task
  async getSubmissionsForTask(taskId) {
    const task = await this.getInterviewTaskById(taskId);
    if (!task) return [];

    const allSubmissions = await storage.getSubmissions();
    return allSubmissions.filter(sub => task.submissions.includes(sub.id));
  },

  // Archive completed task
  async archiveTask(taskId) {
    return await this.updateInterviewTask(taskId, { status: 'archived' });
  },

  // Get task statistics
  async getTaskStatistics() {
    const tasks = await this.getInterviewTasks();
    const stats = {
      total: tasks.length,
      active: tasks.filter(t => t.status === 'active').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      archived: tasks.filter(t => t.status === 'archived').length,
      highPriority: tasks.filter(t => t.priority === 'high').length,
      totalAssignments: tasks.reduce((sum, task) => sum + task.assignedCandidates.length, 0),
      totalSubmissions: tasks.reduce((sum, task) => sum + task.submissions.length, 0),
    };
    return stats;
  },

  // Search tasks by title or tags
  async searchTasks(query) {
    const tasks = await this.getInterviewTasks();
    const lowercaseQuery = query.toLowerCase();

    return tasks.filter(task =>
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery) ||
      task.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  },

  // Get overdue tasks
  async getOverdueTasks() {
    const tasks = await this.getInterviewTasks();
    const now = Date.now();

    return tasks.filter(task =>
      task.status === 'active' &&
      task.deadline &&
      task.deadline < now
    );
  },

  // Bulk operations
  async bulkAssignCandidates(taskIds, candidateIds) {
    const results = [];
    for (const taskId of taskIds) {
      try {
        const result = await this.assignCandidates(taskId, candidateIds);
        results.push({ taskId, success: true, data: result });
      } catch (error) {
        results.push({ taskId, success: false, error: error.message });
      }
    }
    return results;
  },

  async bulkArchiveTasks(taskIds) {
    const results = [];
    for (const taskId of taskIds) {
      try {
        const result = await this.archiveTask(taskId);
        results.push({ taskId, success: true, data: result });
      } catch (error) {
        results.push({ taskId, success: false, error: error.message });
      }
    }
    return results;
  },
};

// Interview task status constants
export const INTERVIEW_TASK_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Default task settings
export const DEFAULT_TASK_SETTINGS = {
  allowMultipleSubmissions: false,
  requireAllQuestions: true,
  autoGrade: false,
};