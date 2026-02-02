import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { payrollApi } from '@app/services/api';
import { StorageKeys } from '@app/utils/constants';
import Toast from 'react-native-toast-message';

export interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  employeeAvatar?: string;
  month: number;
  year: number;
  grossPay: number;
  deductions: {
    tax: number;
    insurance: number;
    pension: number;
    other: number;
  };
  netPay: number;
  status: 'draft' | 'processed' | 'paid';
  paidAt?: Date;
  payslipUrl?: string;
}

interface PayrollState {
  payrollRecords: PayrollRecord[];
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  selectedMonth: number;
  selectedYear: number;
  
  // Actions
  fetchPayrollRecords: (month: number, year: number) => Promise<void>;
  getPayrollDetail: (id: string) => PayrollRecord | undefined;
  processPayroll: (month: number, year: number) => Promise<void>;
  exportPayroll: (month: number, year: number, format: 'csv' | 'pdf' | 'excel') => Promise<string>;
  setSelectedPeriod: (month: number, year: number) => void;
  getTotalGross: () => number;
  getTotalDeductions: () => number;
  getTotalNet: () => number;
  getPayrollStats: () => { total: number; processed: number; paid: number; draft: number };
}

export const usePayrollStore = create<PayrollState>()(
  persist(
    (set, get) => ({
      payrollRecords: [],
      isLoading: false,
      isProcessing: false,
      error: null,
      selectedMonth: new Date().getMonth(),
      selectedYear: new Date().getFullYear(),

      fetchPayrollRecords: async (month, year) => {
        set({ isLoading: true, error: null });
        try {
          const records = await payrollApi.getPayrollRecords(month, year);
          set({
            payrollRecords: records.map((r: any) => ({
              ...r,
              deductions: r.deductions || { tax: 0, insurance: 0, pension: 0, other: 0 },
              paidAt: r.paid_at ? new Date(r.paid_at) : undefined,
            })),
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch payroll', isLoading: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load payroll data',
          });
        }
      },

      getPayrollDetail: (id) => {
        return get().payrollRecords.find((r) => r.id === id);
      },

      processPayroll: async (month, year) => {
        set({ isProcessing: true });
        try {
          await payrollApi.processPayroll(month, year);
          
          set((state) => ({
            payrollRecords: state.payrollRecords.map((r) =>
              r.month === month && r.year === year
                ? { ...r, status: 'processed' as const }
                : r
            ),
            isProcessing: false,
          }));

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Payroll processed successfully',
          });
        } catch (error: any) {
          set({ error: error.message, isProcessing: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to process payroll',
          });
          throw error;
        }
      },

      exportPayroll: async (month, year, format) => {
        try {
          const downloadUrl = await payrollApi.exportPayroll(month, year, format);
          
          Toast.show({
            type: 'success',
            text1: 'Export Ready',
            text2: 'Payroll report is being downloaded',
          });
          
          return downloadUrl;
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to export payroll',
          });
          throw error;
        }
      },

      setSelectedPeriod: (month, year) => {
        set({ selectedMonth: month, selectedYear: year });
        get().fetchPayrollRecords(month, year);
      },

      getTotalGross: () => {
        return get().payrollRecords.reduce((sum, r) => sum + r.grossPay, 0);
      },

      getTotalDeductions: () => {
        return get().payrollRecords.reduce(
          (sum, r) => sum + r.deductions.tax + r.deductions.insurance + r.deductions.pension + r.deductions.other,
          0
        );
      },

      getTotalNet: () => {
        return get().payrollRecords.reduce((sum, r) => sum + r.netPay, 0);
      },

      getPayrollStats: () => {
        const { payrollRecords } = get();
        return {
          total: payrollRecords.length,
          processed: payrollRecords.filter((r) => r.status === 'processed').length,
          paid: payrollRecords.filter((r) => r.status === 'paid').length,
          draft: payrollRecords.filter((r) => r.status === 'draft').length,
        };
      },
    }),
    {
      name: StorageKeys.authUser + '_payroll',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ payrollRecords: state.payrollRecords }),
    }
  )
);
