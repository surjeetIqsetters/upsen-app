import { create } from 'zustand';
import { Task, CreateTaskData } from '@app/types';
import { taskApi } from '@app/services/api';

interface TaskState {
  // State
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  isSubmitting: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  selectedDate: string | null;

  // Actions
  fetchTasks: (refresh?: boolean, params?: { status?: string; priority?: string; date?: string }) => Promise<void>;
  fetchTaskDetails: (id: string) => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  setSelectedDate: (date: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  tasks: [],
  selectedTask: null,
  isLoading: false,
  isLoadingMore: false,
  isSubmitting: false,
  error: null,
  hasMore: true,
  page: 1,
  selectedDate: null,
};

export const useTaskStore = create<TaskState>((set, get) => ({
  ...initialState,

  // Fetch tasks
  fetchTasks: async (refresh = false, params = {}) => {
    try {
      const { page, tasks, hasMore, selectedDate } = get();
      
      if (!refresh && !hasMore) return;
      
      set({ isLoading: true, error: null, isLoadingMore: !refresh }); // Set isLoadingMore based on refresh
      
      const currentPage = refresh ? 1 : page;
      
      // Assuming 'status' from params is the 'activeFilter' mentioned in the instruction
      const activeFilter = params.status;

      const response = await taskApi.getTasks({
        status: activeFilter !== 'all' ? activeFilter : undefined,
        date: selectedDate || params.date, // Keep existing date filter logic
        page: currentPage,
        limit: 20,
      });
      
      const newTasks = Array.isArray(response) ? response : (response as any).data || [];
      const hasMoreData = Array.isArray(response) ? false : (response as any).hasMore;
      
      set({
        tasks: refresh ? newTasks : [...tasks, ...newTasks],
        page: currentPage + 1,
        hasMore: hasMoreData,
        isLoading: false,
        isLoadingMore: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        isLoadingMore: false, // Ensure isLoadingMore is reset on error
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      });
    }
  },

  // Fetch task details
  fetchTaskDetails: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await taskApi.getTask(id) as Task;
      set({ selectedTask: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch task details',
      });
    }
  },

  // Create task
  createTask: async (data) => {
    try {
      set({ isSubmitting: true, error: null });
      
      const taskData = {
        ...data,
        estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : undefined,
      };
      
      await taskApi.createTask(taskData);
      
      // Refresh tasks
      await get().fetchTasks(true);
      
      set({ isSubmitting: false });
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to create task',
      });
      throw error;
    }
  },

  // Update task
  updateTask: async (id, data) => {
    try {
      set({ isSubmitting: true, error: null });
      
      const updatedTask = await taskApi.updateTask(id, data) as Task;
      
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
        isSubmitting: false,
      }));
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to update task',
      });
      throw error;
    }
  },

  // Delete task
  deleteTask: async (id) => {
    try {
      set({ isSubmitting: true, error: null });
      await taskApi.deleteTask(id);
      
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        isSubmitting: false,
      }));
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to delete task',
      });
      throw error;
    }
  },

  // Update task status
  updateTaskStatus: async (id, status) => {
    try {
      set({ isSubmitting: true, error: null });
      
      const updatedTask = await taskApi.updateStatus(id, status) as Task;
      
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
        isSubmitting: false,
      }));
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to update task status',
      });
      throw error;
    }
  },

  // Set selected date
  setSelectedDate: (date) => {
    set({ selectedDate: date, page: 1, hasMore: true });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset state
  reset: () => set(initialState),
}));
