import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { timeTrackingApi } from '@app/services/api';
import { StorageKeys } from '@app/utils/constants';
import Toast from 'react-native-toast-message';
import { differenceInMinutes, format, startOfDay, startOfWeek } from 'date-fns';

export interface TimeEntry {
  id: string;
  project: string;
  task: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  notes: string;
  billable: boolean;
}

export interface CurrentSession {
  project: string;
  task: string;
  startTime: Date;
  notes: string;
}

interface TimeTrackingState {
  timeEntries: TimeEntry[];
  isTracking: boolean;
  currentSession: CurrentSession | null;
  currentDuration: number; // in minutes
  isLoading: boolean;
  error: string | null;
  selectedProject: string | null;
  projects: string[];
  
  // Actions
  fetchTimeEntries: (startDate?: Date, endDate?: Date) => Promise<void>;
  startTracking: (project: string, task: string, notes?: string) => Promise<void>;
  stopTracking: () => Promise<void>;
  getCurrentSession: () => Promise<void>;
  getTimeReport: (period: 'day' | 'week' | 'month') => Promise<any>;
  addManualEntry: (entry: Omit<TimeEntry, 'id'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, data: Partial<TimeEntry>) => Promise<void>;
  setSelectedProject: (project: string | null) => void;
  getTodayTotal: () => number;
  getWeekTotal: () => number;
  getMonthTotal: () => number;
  getProjectTotals: () => { project: string; duration: number }[];
  getFilteredEntries: () => TimeEntry[];
}

export const useTimeTrackingStore = create<TimeTrackingState>()(
  persist(
    (set, get) => ({
      timeEntries: [],
      isTracking: false,
      currentSession: null,
      currentDuration: 0,
      isLoading: false,
      error: null,
      selectedProject: null,
      projects: [],

      fetchTimeEntries: async (startDate, endDate) => {
        set({ isLoading: true, error: null });
        try {
          const entries = await timeTrackingApi.getTimeEntries(
            startDate?.toISOString(),
            endDate?.toISOString()
          );
          
          const formattedEntries = entries.map((e: any) => ({
            ...e,
            startTime: new Date(e.start_time),
            endTime: e.end_time ? new Date(e.end_time) : undefined,
          }));

          // Extract unique projects
          const uniqueProjects = [...new Set(formattedEntries.map((e) => e.project))];

          set({
            timeEntries: formattedEntries,
            projects: uniqueProjects,
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch time entries', isLoading: false });
        }
      },

      startTracking: async (project, task, notes = '') => {
        try {
          await timeTrackingApi.startTimer(project, task, notes);
          
          const session: CurrentSession = {
            project,
            task,
            startTime: new Date(),
            notes,
          };

          set({
            isTracking: true,
            currentSession: session,
            currentDuration: 0,
          });

          Toast.show({
            type: 'success',
            text1: 'Timer Started',
            text2: `Tracking: ${project} - ${task}`,
          });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to start timer',
          });
          throw error;
        }
      },

      stopTracking: async () => {
        try {
          const { currentSession, timeEntries } = get();
          
          if (!currentSession) return;

          const result = await timeTrackingApi.stopTimer();
          
          const endTime = new Date();
          const duration = differenceInMinutes(endTime, currentSession.startTime);

          const newEntry: TimeEntry = {
            id: Date.now().toString(),
            project: currentSession.project,
            task: currentSession.task,
            startTime: currentSession.startTime,
            endTime,
            duration,
            notes: currentSession.notes,
            billable: true,
          };

          set({
            timeEntries: [newEntry, ...timeEntries],
            isTracking: false,
            currentSession: null,
            currentDuration: 0,
          });

          Toast.show({
            type: 'success',
            text1: 'Timer Stopped',
            text2: `Logged ${Math.floor(duration / 60)}h ${duration % 60}m`,
          });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to stop timer',
          });
          throw error;
        }
      },

      getCurrentSession: async () => {
        try {
          const session = await timeTrackingApi.getCurrentSession();
          if (session) {
            set({
              isTracking: true,
              currentSession: {
                project: session.project,
                task: session.task,
                startTime: new Date(session.start_time),
                notes: session.notes,
              },
            });
          }
        } catch (error) {
          console.error('Failed to get current session:', error);
        }
      },

      getTimeReport: async (period) => {
        try {
          return await timeTrackingApi.getTimeReport(period);
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to get time report',
          });
          throw error;
        }
      },

      addManualEntry: async (entry) => {
        try {
          // API call to add manual entry
          const newEntry: TimeEntry = {
            ...entry,
            id: Date.now().toString(),
          };

          set((state) => ({
            timeEntries: [newEntry, ...state.timeEntries],
          }));

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Time entry added',
          });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to add time entry',
          });
          throw error;
        }
      },

      deleteEntry: async (id) => {
        try {
          set((state) => ({
            timeEntries: state.timeEntries.filter((e) => e.id !== id),
          }));

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Time entry deleted',
          });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to delete time entry',
          });
        }
      },

      updateEntry: async (id, data) => {
        try {
          set((state) => ({
            timeEntries: state.timeEntries.map((e) =>
              e.id === id ? { ...e, ...data } : e
            ),
          }));

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Time entry updated',
          });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to update time entry',
          });
        }
      },

      setSelectedProject: (project) => {
        set({ selectedProject: project });
      },

      getTodayTotal: () => {
        const today = startOfDay(new Date());
        return get().timeEntries
          .filter((e) => new Date(e.startTime) >= today)
          .reduce((sum, e) => sum + e.duration, 0);
      },

      getWeekTotal: () => {
        const weekStart = startOfWeek(new Date());
        return get().timeEntries
          .filter((e) => new Date(e.startTime) >= weekStart)
          .reduce((sum, e) => sum + e.duration, 0);
      },

      getMonthTotal: () => {
        const now = new Date();
        return get().timeEntries
          .filter((e) => {
            const entryDate = new Date(e.startTime);
            return (
              entryDate.getMonth() === now.getMonth() &&
              entryDate.getFullYear() === now.getFullYear()
            );
          })
          .reduce((sum, e) => sum + e.duration, 0);
      },

      getProjectTotals: () => {
        const { timeEntries } = get();
        const totals: Record<string, number> = {};

        timeEntries.forEach((entry) => {
          if (!totals[entry.project]) {
            totals[entry.project] = 0;
          }
          totals[entry.project] += entry.duration;
        });

        return Object.entries(totals)
          .map(([project, duration]) => ({ project, duration }))
          .sort((a, b) => b.duration - a.duration);
      },

      getFilteredEntries: () => {
        const { timeEntries, selectedProject } = get();
        if (!selectedProject) return timeEntries;
        return timeEntries.filter((e) => e.project === selectedProject);
      },
    }),
    {
      name: StorageKeys.authUser + '_timetracking',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        timeEntries: state.timeEntries,
        isTracking: state.isTracking,
        currentSession: state.currentSession,
      }),
    }
  )
);
