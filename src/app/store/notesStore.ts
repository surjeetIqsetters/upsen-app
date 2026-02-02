import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notesApi } from '@app/services/api';
import { StorageKeys } from '@app/utils/constants';
import Toast from 'react-native-toast-message';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isShared: boolean;
  sharedWith?: string[];
  reminderTime?: Date | null;
  userId: string;
}

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  fetchNotes: () => Promise<void>;
  getNote: (id: string) => Promise<Note | null>;
  createNote: (data: { title: string; content?: string; reminderTime?: Date }) => Promise<string>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  shareNote: (id: string, userIds: string[]) => Promise<void>;
  setSearchQuery: (query: string) => void;
  getFilteredNotes: () => Note[];
  setReminder: (id: string, reminderTime: Date | null) => Promise<void>;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      currentNote: null,
      isLoading: false,
      isSaving: false,
      error: null,
      searchQuery: '',

      fetchNotes: async () => {
        set({ isLoading: true, error: null });
        try {
          const notes = await notesApi.getNotes();
          set({ 
            notes: notes.map((n: any) => ({
              ...n,
              createdAt: new Date(n.created_at),
              updatedAt: new Date(n.updated_at),
              reminderTime: n.reminder_time ? new Date(n.reminder_time) : null,
            })),
            isLoading: false 
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch notes', isLoading: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load notes',
          });
        }
      },

      getNote: async (id) => {
        // Check cache first
        const cached = get().notes.find((n) => n.id === id);
        if (cached) {
          set({ currentNote: cached });
          return cached;
        }
        
        try {
          const note = await notesApi.getNote(id);
          const formattedNote = {
            ...note,
            createdAt: new Date(note.created_at),
            updatedAt: new Date(note.updated_at),
            reminderTime: note.reminder_time ? new Date(note.reminder_time) : null,
          };
          set({ currentNote: formattedNote });
          return formattedNote;
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load note',
          });
          return null;
        }
      },

      createNote: async (data) => {
        set({ isSaving: true });
        try {
          const note = await notesApi.createNote(data);
          const formattedNote = {
            ...note,
            createdAt: new Date(note.created_at),
            updatedAt: new Date(note.updated_at),
            reminderTime: note.reminder_time ? new Date(note.reminder_time) : null,
          };
          set((state) => ({
            notes: [formattedNote, ...state.notes],
            isSaving: false,
          }));
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Note created successfully',
          });
          return note.id;
        } catch (error: any) {
          set({ error: error.message, isSaving: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to create note',
          });
          throw error;
        }
      },

      updateNote: async (id, data) => {
        set({ isSaving: true });
        try {
          const updated = await notesApi.updateNote(id, data);
          const formattedNote = {
            ...updated,
            createdAt: new Date(updated.created_at),
            updatedAt: new Date(updated.updated_at),
            reminderTime: updated.reminder_time ? new Date(updated.reminder_time) : null,
          };
          set((state) => ({
            notes: state.notes.map((n) => (n.id === id ? formattedNote : n)),
            currentNote: state.currentNote?.id === id ? formattedNote : state.currentNote,
            isSaving: false,
          }));
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Note updated successfully',
          });
        } catch (error: any) {
          set({ error: error.message, isSaving: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to update note',
          });
          throw error;
        }
      },

      deleteNote: async (id) => {
        try {
          await notesApi.deleteNote(id);
          set((state) => ({
            notes: state.notes.filter((n) => n.id !== id),
            currentNote: state.currentNote?.id === id ? null : state.currentNote,
          }));
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Note deleted successfully',
          });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to delete note',
          });
          throw error;
        }
      },

      shareNote: async (id, userIds) => {
        try {
          await notesApi.shareNote(id, userIds);
          set((state) => ({
            notes: state.notes.map((n) =>
              n.id === id ? { ...n, isShared: true, sharedWith: userIds } : n
            ),
          }));
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Note shared successfully',
          });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to share note',
          });
          throw error;
        }
      },

      setReminder: async (id, reminderTime) => {
        try {
          await notesApi.updateNote(id, { reminderTime });
          set((state) => ({
            notes: state.notes.map((n) =>
              n.id === id ? { ...n, reminderTime } : n
            ),
          }));
          if (reminderTime) {
            Toast.show({
              type: 'success',
              text1: 'Reminder Set',
              text2: `You'll be notified on ${reminderTime.toLocaleString()}`,
            });
          }
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to set reminder',
          });
        }
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      getFilteredNotes: () => {
        const { notes, searchQuery } = get();
        if (!searchQuery.trim()) return notes;
        
        const query = searchQuery.toLowerCase();
        return notes.filter(
          (note) =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
        );
      },
    }),
    {
      name: StorageKeys.authUser + '_notes',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ notes: state.notes }),
    }
  )
);
