import { create } from 'zustand';
import { User, Profile, Department, DepartmentStructure } from '@app/types';
import { employeeApi } from '@app/services/api';

interface EmployeeState {
  // State
  employees: User[];
  departments: Department[];
  selectedEmployee: Profile | null;
  departmentStructure: DepartmentStructure | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  searchQuery: string;
  selectedDepartment: string | null;

  // Actions
  fetchEmployees: (refresh?: boolean) => Promise<void>;
  fetchDepartments: () => Promise<void>;
  fetchEmployeeDetails: (id: string) => Promise<void>;
  fetchDepartmentStructure: (id: string) => Promise<void>;
  searchEmployees: (query: string) => void;
  filterByDepartment: (departmentId: string | null) => void;
  createEmployee: (data: any) => Promise<void>;
  onboardEmployee: (data: any) => Promise<void>;
  clearSearch: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  employees: [],
  departments: [],
  selectedEmployee: null,
  departmentStructure: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasMore: true,
  page: 1,
  searchQuery: '',
  selectedDepartment: null,
};

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  ...initialState,

  // Fetch employees
  fetchEmployees: async (refresh = false) => {
    try {
      const { page, employees, hasMore, selectedDepartment, searchQuery } = get();
      
      if (!refresh && !hasMore) return;
      
      set(refresh ? { isLoading: true, error: null } : { isLoadingMore: true, error: null });
      
      const currentPage = refresh ? 1 : page;
      
      const response = await employeeApi.getEmployees({
        departmentId: selectedDepartment || undefined,
        search: searchQuery || undefined,
        page: currentPage,
        limit: 20,
      });
      
      // Handle both paginated and non-paginated responses
      const newEmployees = Array.isArray(response) ? response : (response as any).data || [];
      const hasMoreData = Array.isArray(response) ? newEmployees.length === 20 : (response as any).hasMore;
      
      set({
        employees: refresh ? newEmployees : [...employees, ...newEmployees],
        page: currentPage + 1,
        hasMore: hasMoreData,
        isLoading: false,
        isLoadingMore: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        isLoadingMore: false,
        error: error instanceof Error ? error.message : 'Failed to fetch employees',
      });
    }
  },

  // Fetch departments
  fetchDepartments: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await employeeApi.getDepartments() as Department[];
      set({ departments: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch departments',
      });
    }
  },

  // Fetch employee details
  fetchEmployeeDetails: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await employeeApi.getEmployee(id) as Profile;
      set({ selectedEmployee: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch employee details',
      });
    }
  },

  // Fetch department structure
  fetchDepartmentStructure: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await employeeApi.getDepartmentStructure(id) as DepartmentStructure;
      set({ departmentStructure: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch department structure',
      });
    }
  },

  // Create employee
  createEmployee: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await employeeApi.createEmployee(data);
      set({ isLoading: false });
      get().fetchEmployees(true);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create employee',
      });
      throw error;
    }
  },

  // Onboard employee
  onboardEmployee: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await employeeApi.onboardEmployee(data);
      set({ isLoading: false });
      get().fetchEmployees(true);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to onboard employee',
      });
      throw error;
    }
  },

  // Search employees
  searchEmployees: (query) => {
    set({ searchQuery: query, page: 1, hasMore: true });
    get().fetchEmployees(true);
  },

  // Filter by department
  filterByDepartment: (departmentId) => {
    set({ selectedDepartment: departmentId, page: 1, hasMore: true });
    get().fetchEmployees(true);
  },

  // Clear search
  clearSearch: () => {
    set({ searchQuery: '', selectedDepartment: null, page: 1, hasMore: true });
    get().fetchEmployees(true);
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset state
  reset: () => set(initialState),
}));
