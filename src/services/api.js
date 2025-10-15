import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Dashboard endpoints
export const getDashboardOverview = () => api.get('/monitoring/dashboard-overview');
export const getModelPerformance = () => api.get('/monitoring/model-performance');

// Transaction endpoints  
export const getTransactions = (params) => api.get('/transactions', { params });
export const getTransactionStatistics = () => api.get('/transactions/statistics');
export const getChartData = (params) => api.get('/transactions/chart-data', { params });

// Alert endpoints - Fixed update functionality
export const getAlerts = (params) => api.get('/alerts', { params });
export const getAlertStatistics = () => api.get('/alerts/statistics');
export const updateAlert = async (alertId, data) => {
  try {
    const response = await api.put(`/alerts/${alertId}`, {
      ...data,
      processed_at: new Date().toISOString()
    });
    return response;
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
};

// Report endpoints - NEW
export const generateReport = async (reportData) => {
  try {
    const response = await api.post('/reports/cd01/generate', reportData, {
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

export const downloadAlertDetails = async (alertId) => {
  try {
    const response = await api.get(`/reports/cd01/download/${alertId}`, {
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    console.error('Error downloading alert details:', error);
    throw error;
  }
};

export const exportParameters = async () => {
  try {
    const response = await api.get('/reports/export/parameters', {
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    console.error('Error exporting parameters:', error);
    throw error;
  }
};

// Export CSV utility function
export const exportToCSV = (data, filename = 'export.csv') => {
  // Convert data to CSV format
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle special characters and commas in values
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
        ? `"${stringValue.replace(/"/g, '""')}"` 
        : stringValue;
    });
    csvContent += values.join(',') + '\n';
  });

  // Create Blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Monitoring endpoints
export const getStats = () => api.get('/monitoring/stats');
export const getRealTimeStatus = () => api.get('/monitoring/real-time/status');

// Parameters endpoints (for Settings page)
export const getAllParameters = () => api.get('/parameters');
export const getParameter = (category, name) => api.get(`/parameters/${category}/${name}`);
export const updateParameter = (data) => api.post('/parameters', data);
export const updateBatchParameters = (data) => api.post('/parameters/batch', data);
export const resetParametersToDefaults = (data) => api.post('/parameters/reset', data);
export const testEmailNotification = (data) => api.post('/parameters/test-email', data);

// Reactivation endpoints
export const getReactivations = (params) => api.get('/reactivations', { params });
export const getReactivationStatistics = () => api.get('/reactivations/statistics');

// Health & Info
export const healthCheck = () => api.get('/health');
export const getApiInfo = () => api.get('/info');

export default api;