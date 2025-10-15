import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import { Download } from 'lucide-react';
import * as api from '../services/api';

// Custom toolbar component with CSV export
const CustomToolbar = ({ onExport }) => {
  return (
    <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
      <Button
        size="small"
        startIcon={<Download size={16} />}
        onClick={onExport}
        variant="outlined"
      >
        Export CSV
      </Button>
    </div>
  );
};

// Exportable DataGrid wrapper component
export const ExportableDataGrid = ({ 
  rows, 
  columns, 
  filename = 'data_export',
  pageSize = 10,
  ...otherProps 
}) => {
  
  const handleExport = () => {
    if (!rows || rows.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare data for export
    const exportData = rows.map(row => {
      const exportRow = {};
      columns.forEach(col => {
        // Skip actions columns
        if (col.field === 'actions') return;
        
        // Get the value, applying any formatting
        let value = row[col.field];
        
        // Apply valueFormatter if exists
        if (col.valueFormatter && value !== undefined) {
          value = col.valueFormatter({ value });
        }
        
        // Apply renderCell text extraction if needed
        if (!col.valueFormatter && col.renderCell) {
          // For simple text renders, try to extract the text
          const rendered = col.renderCell({ value: value, row: row });
          if (typeof rendered === 'string') {
            value = rendered;
          }
        }
        
        exportRow[col.headerName || col.field] = value;
      });
      return exportRow;
    });

    // Use the API service export function
    api.exportToCSV(exportData, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSize={pageSize}
      rowsPerPageOptions={[5, 10, 25, 50, 100]}
      slots={{
        toolbar: () => <CustomToolbar onExport={handleExport} />
      }}
      sx={{
        '& .MuiDataGrid-toolbarContainer': {
          padding: '8px',
          backgroundColor: '#f5f5f5',
        },
        ...otherProps.sx
      }}
      {...otherProps}
    />
  );
};

// Export utility for manual CSV generation from any data
export const exportDataToCSV = (data, columns, filename = 'export') => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Create CSV header
  const headers = columns
    .filter(col => col.field !== 'actions')
    .map(col => col.headerName || col.field);
  
  // Create CSV rows
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = columns
      .filter(col => col.field !== 'actions')
      .map(col => {
        let value = row[col.field];
        
        // Apply formatting if available
        if (col.valueFormatter && value !== undefined) {
          value = col.valueFormatter({ value });
        }
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          return '';
        }
        
        // Escape special characters
        value = String(value);
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
      });
    
    csvRows.push(values.join(','));
  });

  // Create blob and download
  const csvContent = '\ufeff' + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default ExportableDataGrid;