import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { expenseApi } from '@app/services/api';
import { StorageKeys } from '@app/utils/constants';
import Toast from 'react-native-toast-message';

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';
export type ExpenseCategory = 'travel' | 'meals' | 'office' | 'training' | 'other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: Date;
  status: ExpenseStatus;
  receipt?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export const expenseCategories: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'travel', label: 'Travel', icon: 'airplane-outline' },
  { value: 'meals', label: 'Meals', icon: 'restaurant-outline' },
  { value: 'office', label: 'Office', icon: 'desktop-outline' },
  { value: 'training', label: 'Training', icon: 'school-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  activeFilter: ExpenseStatus | 'all';
  selectedCategory: ExpenseCategory | null;
  
  // Actions
  fetchExpenses: (status?: ExpenseStatus) => Promise<void>;
  submitExpense: (data: {
    category: ExpenseCategory;
    amount: number;
    description: string;
    date: Date;
    receipt?: any;
  }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setActiveFilter: (filter: ExpenseStatus | 'all') => void;
  setSelectedCategory: (category: ExpenseCategory | null) => void;
  getFilteredExpenses: () => Expense[];
  getTotalByStatus: (status: ExpenseStatus) => number;
  getTotalAmount: () => number;
  getCategoryTotals: () => { category: ExpenseCategory; amount: number; count: number }[];
  getMonthlyTotals: () => { month: string; amount: number }[];
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
      activeFilter: 'all',
      selectedCategory: null,

      fetchExpenses: async (status) => {
        set({ isLoading: true, error: null });
        try {
          const expenses = await expenseApi.getExpenses(status);
          set({
            expenses: expenses.map((e: any) => ({
              ...e,
              date: new Date(e.date),
              submittedAt: new Date(e.submitted_at),
              reviewedAt: e.reviewed_at ? new Date(e.reviewed_at) : undefined,
            })),
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch expenses', isLoading: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load expenses',
          });
        }
      },

      submitExpense: async (data) => {
        set({ isSubmitting: true });
        try {
          await expenseApi.submitExpense(data);
          
          const newExpense: Expense = {
            id: Date.now().toString(),
            category: data.category,
            amount: data.amount,
            description: data.description,
            date: data.date,
            status: 'pending',
            receipt: data.receipt?.uri,
            submittedAt: new Date(),
          };

          set((state) => ({
            expenses: [newExpense, ...state.expenses],
            isSubmitting: false,
          }));

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Expense submitted for approval',
          });
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to submit expense',
          });
          throw error;
        }
      },

      deleteExpense: async (id) => {
        try {
          await expenseApi.deleteExpense(id);
          set((state) => ({
            expenses: state.expenses.filter((e) => e.id !== id),
          }));
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Expense deleted',
          });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to delete expense',
          });
          throw error;
        }
      },

      setActiveFilter: (filter) => {
        set({ activeFilter: filter });
        if (filter !== 'all') {
          get().fetchExpenses(filter);
        } else {
          get().fetchExpenses();
        }
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
      },

      getFilteredExpenses: () => {
        const { expenses, activeFilter, selectedCategory } = get();
        let filtered = expenses;

        if (activeFilter !== 'all') {
          filtered = filtered.filter((e) => e.status === activeFilter);
        }

        if (selectedCategory) {
          filtered = filtered.filter((e) => e.category === selectedCategory);
        }

        return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
      },

      getTotalByStatus: (status) => {
        return get()
          .expenses.filter((e) => e.status === status)
          .reduce((sum, e) => sum + e.amount, 0);
      },

      getTotalAmount: () => {
        return get().expenses.reduce((sum, e) => sum + e.amount, 0);
      },

      getCategoryTotals: () => {
        const { expenses } = get();
        const totals: Record<ExpenseCategory, { amount: number; count: number }> = {
          travel: { amount: 0, count: 0 },
          meals: { amount: 0, count: 0 },
          office: { amount: 0, count: 0 },
          training: { amount: 0, count: 0 },
          other: { amount: 0, count: 0 },
        };

        expenses.forEach((e) => {
          totals[e.category].amount += e.amount;
          totals[e.category].count += 1;
        });

        return Object.entries(totals)
          .map(([category, data]) => ({
            category: category as ExpenseCategory,
            ...data,
          }))
          .filter((c) => c.count > 0)
          .sort((a, b) => b.amount - a.amount);
      },

      getMonthlyTotals: () => {
        const { expenses } = get();
        const monthlyData: Record<string, number> = {};

        expenses.forEach((e) => {
          const monthKey = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          monthlyData[monthKey] += e.amount;
        });

        return Object.entries(monthlyData)
          .map(([month, amount]) => ({ month, amount }))
          .sort((a, b) => b.month.localeCompare(a.month))
          .slice(0, 12);
      },
    }),
    {
      name: StorageKeys.authUser + '_expenses',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ expenses: state.expenses }),
    }
  )
);
