import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { documentsApi } from '@app/services/api';
import { StorageKeys } from '@app/utils/constants';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'spreadsheet';
  size: string;
  uploadedAt: Date;
  category: string;
  url?: string;
  uploadedBy?: string;
}

interface DocumentsState {
  documents: Document[];
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  selectedCategory: string;
  searchQuery: string;
  
  // Actions
  fetchDocuments: () => Promise<void>;
  uploadDocument: (data: {
    file: any;
    name: string;
    category: string;
    description?: string;
  }) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  downloadDocument: (id: string, fileName: string) => Promise<string>;
  shareDocument: (id: string, fileName: string) => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  getFilteredDocuments: () => Document[];
  getDocumentsByCategory: (category: string) => Document[];
}

const categories = ['All', 'HR', 'Finance', 'Legal', 'Personal', 'Training'];

export const useDocumentsStore = create<DocumentsState>()(
  persist(
    (set, get) => ({
      documents: [],
      isLoading: false,
      isUploading: false,
      uploadProgress: 0,
      error: null,
      selectedCategory: 'All',
      searchQuery: '',

      fetchDocuments: async () => {
        set({ isLoading: true, error: null });
        try {
          const { selectedCategory } = get();
          const documents = await documentsApi.getDocuments(
            selectedCategory === 'All' ? undefined : selectedCategory
          );
          set({
            documents: documents.map((d: any) => ({
              ...d,
              uploadedAt: new Date(d.uploaded_at),
            })),
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch documents', isLoading: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load documents',
          });
        }
      },

      uploadDocument: async (data) => {
        set({ isUploading: true, uploadProgress: 0 });
        try {
          const formData = new FormData();
          formData.append('file', {
            uri: data.file.uri,
            name: data.file.name,
            type: data.file.mimeType || 'application/octet-stream',
          } as any);
          formData.append('name', data.name);
          formData.append('category', data.category);
          if (data.description) {
            formData.append('description', data.description);
          }

          const document = await documentsApi.uploadDocument(formData, (progress) => {
            set({ uploadProgress: progress });
          });

          const formattedDoc = {
            ...document,
            uploadedAt: new Date(document.uploaded_at),
          };

          set((state) => ({
            documents: [formattedDoc, ...state.documents],
            isUploading: false,
            uploadProgress: 0,
          }));

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Document uploaded successfully',
          });
        } catch (error: any) {
          set({ error: error.message, isUploading: false, uploadProgress: 0 });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to upload document',
          });
          throw error;
        }
      },

      deleteDocument: async (id) => {
        try {
          await documentsApi.deleteDocument(id);
          set((state) => ({
            documents: state.documents.filter((d) => d.id !== id),
          }));
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Document deleted successfully',
          });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to delete document',
          });
          throw error;
        }
      },

      downloadDocument: async (id, fileName) => {
        try {
          const downloadUrl = await documentsApi.downloadDocument(id);
          
          // Download file
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;
          const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri);
          
          Toast.show({
            type: 'success',
            text1: 'Downloaded',
            text2: 'Document saved to Downloads',
          });
          
          return uri;
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to download document',
          });
          throw error;
        }
      },

      shareDocument: async (id, fileName) => {
        try {
          const uri = await get().downloadDocument(id, fileName);
          
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
          } else {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Sharing is not available',
            });
          }
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to share document',
          });
        }
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
        get().fetchDocuments();
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      getFilteredDocuments: () => {
        const { documents, searchQuery, selectedCategory } = get();
        let filtered = documents;

        // Filter by category
        if (selectedCategory !== 'All') {
          filtered = filtered.filter((d) => d.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter((d) =>
            d.name.toLowerCase().includes(query)
          );
        }

        return filtered;
      },

      getDocumentsByCategory: (category) => {
        return get().documents.filter((d) => d.category === category);
      },
    }),
    {
      name: StorageKeys.authUser + '_documents',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ documents: state.documents }),
    }
  )
);
