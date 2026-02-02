import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export type ExportFormat = 'csv' | 'json' | 'pdf';
export type ExportDataType = 'employees' | 'attendance' | 'leaves' | 'tasks' | 'payroll' | 'analytics';

export interface ExportOptions {
  format: ExportFormat;
  dataType: ExportDataType;
  startDate?: Date;
  endDate?: Date;
  departmentId?: string;
  employeeId?: string;
  filters?: Record<string, any>;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

const getFileExtension = (format: ExportFormat): string => {
  switch (format) {
    case 'csv':
      return 'csv';
    case 'json':
      return 'json';
    case 'pdf':
      return 'pdf';
    default:
      return 'txt';
  }
};

const getMimeType = (format: ExportFormat): string => {
  switch (format) {
    case 'csv':
      return 'text/csv';
    case 'json':
      return 'application/json';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'text/plain';
  }
};

/**
 * Convert data to CSV format
 */
const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // Escape values containing commas, quotes, or newlines
      if (typeof value === 'string' && /[,"\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Convert data to JSON format
 */
const convertToJSON = (data: any[]): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Generate PDF content (simplified - in production, use a PDF library)
 */
const generatePDF = (data: any[], title: string): string => {
  // This is a simplified PDF generation
  // In production, use react-native-html-to-pdf or similar
  const rows = data.map((item) => 
    Object.entries(item).map(([key, value]) => `${key}: ${value}`).join('\n')
  ).join('\n\n---\n\n');

  return `${title}\n\n${'='.repeat(50)}\n\n${rows}`;
};

/**
 * Fetch data from Supabase based on type
 */
const fetchDataForExport = async (options: ExportOptions): Promise<any[]> => {
  const { dataType, startDate, endDate, departmentId, employeeId, filters } = options;

  let query;

  switch (dataType) {
    case 'employees':
      query = supabase.from('profiles').select('*');
      if (departmentId) query = query.eq('department_id', departmentId);
      break;

    case 'attendance':
      query = supabase.from('attendance').select('*, profiles(full_name)');
      if (startDate) query = query.gte('date', startDate.toISOString());
      if (endDate) query = query.lte('date', endDate.toISOString());
      if (employeeId) query = query.eq('employee_id', employeeId);
      break;

    case 'leaves':
      query = supabase.from('leaves').select('*, profiles(full_name)');
      if (startDate) query = query.gte('start_date', startDate.toISOString());
      if (endDate) query = query.lte('end_date', endDate.toISOString());
      if (employeeId) query = query.eq('employee_id', employeeId);
      if (filters?.status) query = query.eq('status', filters.status);
      break;

    case 'tasks':
      query = supabase.from('tasks').select('*, assignee:profiles!tasks_assignee_id_fkey(full_name)');
      if (startDate) query = query.gte('created_at', startDate.toISOString());
      if (endDate) query = query.lte('created_at', endDate.toISOString());
      if (employeeId) query = query.eq('assignee_id', employeeId);
      if (filters?.status) query = query.eq('status', filters.status);
      break;

    case 'payroll':
      query = supabase.from('payroll').select('*, profiles(full_name)');
      if (startDate) query = query.gte('pay_period_start', startDate.toISOString());
      if (endDate) query = query.lte('pay_period_end', endDate.toISOString());
      if (employeeId) query = query.eq('employee_id', employeeId);
      break;

    case 'analytics':
      // Analytics data would be aggregated from multiple tables
      query = supabase.rpc('get_analytics_summary', {
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
      });
      break;

    default:
      throw new Error(`Unknown data type: ${dataType}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }

  return data || [];
};

/**
 * Export data to file
 */
export const exportData = async (options: ExportOptions): Promise<ExportResult> => {
  try {
    // Fetch data
    const data = await fetchDataForExport(options);

    if (data.length === 0) {
      return { success: false, error: 'No data to export' };
    }

    // Convert to appropriate format
    let content: string;
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${options.dataType}_${timestamp}.${getFileExtension(options.format)}`;

    switch (options.format) {
      case 'csv':
        content = convertToCSV(data);
        break;
      case 'json':
        content = convertToJSON(data);
        break;
      case 'pdf':
        content = generatePDF(data, `Export: ${options.dataType}`);
        break;
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }

    // Write to file
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(filePath, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    return {
      success: true,
      filePath,
      fileName,
      fileSize: fileInfo.exists ? fileInfo.size : 0,
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
};

/**
 * Share exported file
 */
export const shareExportedFile = async (filePath: string): Promise<boolean> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.log('Sharing is not available on this device');
      return false;
    }

    await Sharing.shareAsync(filePath);
    return true;
  } catch (error) {
    console.error('Share error:', error);
    return false;
  }
};

/**
 * Export and share in one action
 */
export const exportAndShare = async (options: ExportOptions): Promise<ExportResult> => {
  const result = await exportData(options);
  
  if (result.success && result.filePath) {
    await shareExportedFile(result.filePath);
  }

  return result;
};

/**
 * Import data from file
 */
export const importData = async (
  dataType: ExportDataType,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; imported: number; errors: number; error?: string }> => {
  try {
    // Pick document
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'application/json'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return { success: false, imported: 0, errors: 0, error: 'Import cancelled' };
    }

    const file = result.assets[0];
    const content = await FileSystem.readAsStringAsync(file.uri);

    let data: any[];

    // Parse based on file extension
    if (file.name.endsWith('.json')) {
      data = JSON.parse(content);
    } else if (file.name.endsWith('.csv')) {
      // Simple CSV parsing (for production, use a proper CSV parser)
      const lines = content.split('\n');
      const headers = lines[0].split(',').map((h) => h.trim());
      data = lines.slice(1).filter((line) => line.trim()).map((line) => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index]?.trim() || '';
        });
        return obj;
      });
    } else {
      throw new Error('Unsupported file format');
    }

    // Import to Supabase
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < data.length; i++) {
      try {
        const { error } = await supabase.from(dataType).insert(data[i]);
        if (error) {
          errors++;
          console.error(`Import error for row ${i}:`, error);
        } else {
          imported++;
        }

        if (onProgress) {
          onProgress(Math.round(((i + 1) / data.length) * 100));
        }
      } catch (err) {
        errors++;
        console.error(`Import error for row ${i}:`, err);
      }
    }

    return { success: true, imported, errors };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      imported: 0,
      errors: 0,
      error: error instanceof Error ? error.message : 'Import failed',
    };
  }
};

/**
 * Delete exported file
 */
export const deleteExportedFile = async (filePath: string): Promise<boolean> => {
  try {
    await FileSystem.deleteAsync(filePath);
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

/**
 * List exported files
 */
export const listExportedFiles = async (): Promise<Array<{ name: string; path: string; size: number; date: Date }>> => {
  try {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory || '');
    const fileDetails: Array<{ name: string; path: string; size: number; date: Date }> = [];

    for (const fileName of files) {
      if (fileName.endsWith('.csv') || fileName.endsWith('.json') || fileName.endsWith('.pdf')) {
        const filePath = `${FileSystem.documentDirectory}${fileName}`;
        const info = await FileSystem.getInfoAsync(filePath);
        if (info.exists) {
          fileDetails.push({
            name: fileName,
            path: filePath,
            size: info.size,
            date: new Date(info.modificationTime ? info.modificationTime * 1000 : Date.now()),
          });
        }
      }
    }

    return fileDetails.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
};

/**
 * Clear all exported files
 */
export const clearExportedFiles = async (): Promise<number> => {
  try {
    const files = await listExportedFiles();
    let deletedCount = 0;

    for (const file of files) {
      if (await deleteExportedFile(file.path)) {
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Clear files error:', error);
    return 0;
  }
};
