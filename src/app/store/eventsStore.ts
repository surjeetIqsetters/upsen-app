import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventsApi } from '@app/services/api';
import { StorageKeys } from '@app/utils/constants';
import Toast from 'react-native-toast-message';

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: 'office' | 'meeting' | 'training' | 'holiday';
  startTime: Date;
  endTime: Date;
  location?: string;
  attendeesCount?: number;
  isAttending?: boolean;
  createdBy?: string;
  createdAt?: Date;
}

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  selectedDate: Date;
  
  // Actions
  fetchEvents: (startDate?: Date, endDate?: Date) => Promise<void>;
  getEvent: (id: string) => Promise<Event | null>;
  createEvent: (data: {
    title: string;
    description?: string;
    eventType: 'office' | 'meeting' | 'training' | 'holiday';
    startTime: Date;
    endTime: Date;
    location?: string;
  }) => Promise<string>;
  updateEvent: (id: string, data: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  joinEvent: (id: string) => Promise<void>;
  leaveEvent: (id: string) => Promise<void>;
  getEventsForDate: (date: Date) => Event[];
  getEventsForMonth: (month: number, year: number) => Event[];
  setSelectedDate: (date: Date) => void;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: [],
      currentEvent: null,
      isLoading: false,
      isSaving: false,
      error: null,
      selectedDate: new Date(),

      fetchEvents: async (startDate, endDate) => {
        set({ isLoading: true, error: null });
        try {
          const events = await eventsApi.getEvents(
            startDate?.toISOString(),
            endDate?.toISOString()
          );
          set({
            events: events.map((e: any) => ({
              ...e,
              startTime: new Date(e.start_time),
              endTime: new Date(e.end_time),
              createdAt: e.created_at ? new Date(e.created_at) : undefined,
            })),
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch events', isLoading: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load events',
          });
        }
      },

      getEvent: async (id) => {
        const cached = get().events.find((e) => e.id === id);
        if (cached) {
          set({ currentEvent: cached });
          return cached;
        }
        
        try {
          const event = await eventsApi.getEvent(id);
          const formattedEvent = {
            ...event,
            startTime: new Date(event.start_time),
            endTime: new Date(event.end_time),
            createdAt: event.created_at ? new Date(event.created_at) : undefined,
          };
          set({ currentEvent: formattedEvent });
          return formattedEvent;
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load event',
          });
          return null;
        }
      },

      createEvent: async (data) => {
        set({ isSaving: true });
        try {
          const event = await eventsApi.createEvent(data);
          const formattedEvent = {
            ...event,
            startTime: new Date(event.start_time),
            endTime: new Date(event.end_time),
            createdAt: event.created_at ? new Date(event.created_at) : undefined,
          };
          set((state) => ({
            events: [...state.events, formattedEvent],
            isSaving: false,
          }));
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Event created successfully',
          });
          return event.id;
        } catch (error: any) {
          set({ error: error.message, isSaving: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to create event',
          });
          throw error;
        }
      },

      updateEvent: async (id, data) => {
        set({ isSaving: true });
        try {
          const updated = await eventsApi.updateEvent(id, data);
          const formattedEvent = {
            ...updated,
            startTime: new Date(updated.start_time),
            endTime: new Date(updated.end_time),
            createdAt: updated.created_at ? new Date(updated.created_at) : undefined,
          };
          set((state) => ({
            events: state.events.map((e) => (e.id === id ? formattedEvent : e)),
            currentEvent: state.currentEvent?.id === id ? formattedEvent : state.currentEvent,
            isSaving: false,
          }));
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Event updated successfully',
          });
        } catch (error: any) {
          set({ error: error.message, isSaving: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to update event',
          });
          throw error;
        }
      },

      deleteEvent: async (id) => {
        try {
          await eventsApi.deleteEvent(id);
          set((state) => ({
            events: state.events.filter((e) => e.id !== id),
            currentEvent: state.currentEvent?.id === id ? null : state.currentEvent,
          }));
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Event deleted successfully',
          });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to delete event',
          });
          throw error;
        }
      },

      joinEvent: async (id) => {
        try {
          await eventsApi.joinEvent(id);
          set((state) => ({
            events: state.events.map((e) =>
              e.id === id
                ? { ...e, isAttending: true, attendeesCount: (e.attendeesCount || 0) + 1 }
                : e
            ),
            currentEvent:
              state.currentEvent?.id === id
                ? { ...state.currentEvent, isAttending: true }
                : state.currentEvent,
          }));
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'You have joined the event',
          });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to join event',
          });
        }
      },

      leaveEvent: async (id) => {
        try {
          await eventsApi.leaveEvent(id);
          set((state) => ({
            events: state.events.map((e) =>
              e.id === id
                ? { ...e, isAttending: false, attendeesCount: Math.max(0, (e.attendeesCount || 0) - 1) }
                : e
            ),
            currentEvent:
              state.currentEvent?.id === id
                ? { ...state.currentEvent, isAttending: false }
                : state.currentEvent,
          }));
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'You have left the event',
          });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to leave event',
          });
        }
      },

      getEventsForDate: (date) => {
        return get().events.filter((event) => {
          const eventDate = new Date(event.startTime);
          return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
          );
        });
      },

      getEventsForMonth: (month, year) => {
        return get().events.filter((event) => {
          const eventDate = new Date(event.startTime);
          return (
            eventDate.getMonth() === month &&
            eventDate.getFullYear() === year
          );
        });
      },

      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },
    }),
    {
      name: StorageKeys.authUser + '_events',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ events: state.events }),
    }
  )
);
