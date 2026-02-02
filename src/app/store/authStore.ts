import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthSession, SignInCredentials, SignUpData } from '@app/types';
import * as supabaseService from '@app/services/supabase';
import { StorageKeys } from '@app/utils/constants';

interface AuthState {
  // State
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signInWithPhone: (phone: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<void>;
  resendOTP: (phone: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Initialize auth state
      initialize: async () => {
        try {
          set({ isLoading: true });
          
          // Get current session
          const session = await supabaseService.getSession();
          
          if (session?.user) {
            // Fetch full profile
            const profile = await supabaseService.fetchProfile(session.user.id);
            
            set({
              user: profile as User,
              session: {
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                expiresAt: session.expires_at || 0,
                user: profile as User,
              },
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
            });
          } else {
            set({
              isInitialized: true,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            isInitialized: true,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to initialize auth',
          });
        }
      },

      // Sign in with email
      signIn: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const data = await supabaseService.signInWithEmail(
            credentials.email!,
            credentials.password
          );
          
          if (data.user) {
            const profile = await supabaseService.fetchProfile(data.user.id);
            
            set({
              user: profile as User,
              session: {
                accessToken: data.session!.access_token,
                refreshToken: data.session!.refresh_token,
                expiresAt: data.session!.expires_at || 0,
                user: profile as User,
              },
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to sign in',
          });
          throw error;
        }
      },

      // Sign in with phone
      signInWithPhone: async (phone, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const data = await supabaseService.signInWithPhone(phone, password);
          
          if (data.user) {
            const profile = await supabaseService.fetchProfile(data.user.id);
            
            set({
              user: profile as User,
              session: {
                accessToken: data.session!.access_token,
                refreshToken: data.session!.refresh_token,
                expiresAt: data.session!.expires_at || 0,
                user: profile as User,
              },
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to sign in',
          });
          throw error;
        }
      },

      // Sign up
      signUp: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          const result = await supabaseService.signUp(
            data.email,
            data.password,
            `${data.countryCode}${data.phone}`,
            {
              full_name: data.fullName,
              phone_number: data.phone,
              country_code: data.countryCode,
            }
          );
          
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to sign up',
          });
          throw error;
        }
      },

      // Sign out
      signOut: async () => {
        try {
          set({ isLoading: true });
          await supabaseService.signOut();
          
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Verify OTP
      verifyOTP: async (phone, code) => {
        try {
          set({ isLoading: true, error: null });
          await supabaseService.verifyOTP(phone, code);
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Invalid verification code',
          });
          throw error;
        }
      },

      // Resend OTP
      resendOTP: async (phone) => {
        try {
          set({ isLoading: true, error: null });
          await supabaseService.resendOTP(phone);
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to resend code',
          });
          throw error;
        }
      },

      // Reset password
      resetPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });
          await supabaseService.resetPassword(email);
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to send reset email',
          });
          throw error;
        }
      },

      // Update password
      updatePassword: async (newPassword) => {
        try {
          set({ isLoading: true, error: null });
          await supabaseService.updatePassword(newPassword);
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update password',
          });
          throw error;
        }
      },

      // Refresh session
      refreshSession: async () => {
        try {
          const data = await supabaseService.refreshSession();
          
          if (data.session) {
            set((state) => ({
              session: {
                ...state.session!,
                accessToken: data.session!.access_token,
                refreshToken: data.session!.refresh_token,
                expiresAt: data.session!.expires_at || 0,
              },
            }));
          }
        } catch (error) {
          // Session refresh failed, sign out
          get().signOut();
        }
      },

      // Update user in state
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: StorageKeys.authUser,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, session: state.session, isAuthenticated: state.isAuthenticated }),
    }
  )
);
