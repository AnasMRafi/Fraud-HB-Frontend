import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Receipt as TransactionsIcon,
  Search,
  FilterList,
  Download,
  Refresh,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Layout from '../../components/Layout/Layout';
import { ExportableDataGrid } from '../../components/ExportableDataGrid';
import * as api from '../../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 50,
    total_count: 0,
    total_pages: 0
  });
  
  const [filters, setFilters] = useState({
    account_number: '',
    transaction_type: '',
    min_amount: '',
    max_amount: '',
    start_date: null,
    end_date: null,
    risk_level: '',
    sort_by: 'opr_lib_date',
    sort_order: 'DESC'
  });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, filters.sort_by, filters.sort_order]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v != null && v !== '')
        )
      };
      
      const response = await api.getTransactions(params);
      
      if (response.data?.data) {
        setTransactions(response.data.data.transactions);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setFilters({
      account_number: '',
      transaction_type: '',
      min_amount: '',
      max_amount: '',
      start_date: null,
      end_date: null,
      risk_level: '',
      sort_by: 'opr_lib_date',
      sort_order: 'DESC'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getRiskChip = (riskLevel) => {
    const config = {
      High: { color: 'error', bgcolor: '#FFEBEB' },
      Medium: { color: 'warning', bgcolor: '#FFF4E6' },
      Low: { color: 'success', bgcolor: '#E8F5E9' }
    };
    
    return (
      <Chip
        label={riskLevel}
        size="small"
        sx={{
          bgcolor: config[riskLevel]?.bgcolor || '#F5F5F7',
          color: config[riskLevel]?.color || 'default',
          fontWeight: 'medium'
        }}
      />
    );
  };

  const columns = [
    { 
      field: 'id', 
      headerName: 'Transaction ID', 
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      )
    },
    { field: 'account_number', headerName: 'Account Number', width: 150 },
    { field: 'account_holder', headerName: 'Account Holder', width: 180 },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 180,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      renderCell: (params) => `${params.value?.toLocaleString() || 0} MAD`
    },
    { 
      field: 'risk_level', 
      headerName: 'Risk Level', 
      width: 120,
      renderCell: (params) => getRiskChip(params.value)
    },
    { 
      field: 'risk_score', 
      headerName: 'Risk Score', 
      width: 100,
      renderCell: (params) => `${params.value}%`
    },
    { field: 'operator_name', headerName: 'Operator', width: 150 },
    { field: 'agency_name', headerName: 'Agency', width: 150 },
    { field: 'agency_city', headerName: 'City', width: 120 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'validée' ? 'success' : 'default'}
        />
      )
    }
  ];

  return (
    <Layout title="Transactions" icon={TransactionsIcon}>
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Filters Section */}
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Transaction Filters
            </Typography>
            <Box>
              <Button
                startIcon={<FilterList />}
                onClick={handleApplyFilters}
                variant="contained"
                sx={{ mr: 1 }}
              >
                Apply Filters
              </Button>
              <Button
                startIcon={<Refresh />}
                onClick={handleResetFilters}
                variant="outlined"
              >
                Reset
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <TextField
              label="Account Number"
              value={filters.account_number}
              onChange={(e) => handleFilterChange('account_number', e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              select
              label="Transaction Type"
              value={filters.transaction_type}
              onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="retrait">Withdrawal</MenuItem>
              <MenuItem value="depot">Deposit</MenuItem>
              <MenuItem value="virement">Transfer</MenuItem>
              <MenuItem value="virement_national">National Transfer</MenuItem>
              <MenuItem value="virement_international">International Transfer</MenuItem>
              <MenuItem value="paiement_facture">Bill Payment</MenuItem>
              <MenuItem value="recharge_mobile">Mobile Recharge</MenuItem>
            </TextField>
            
            <TextField
              label="Min Amount"
              type="number"
              value={filters.min_amount}
              onChange={(e) => handleFilterChange('min_amount', e.target.value)}
              size="small"
            />
            
            <TextField
              label="Max Amount"
              type="number"
              value={filters.max_amount}
              onChange={(e) => handleFilterChange('max_amount', e.target.value)}
              size="small"
            />
            
            <TextField
              select
              label="Risk Level"
              value={filters.risk_level}
              onChange={(e) => handleFilterChange('risk_level', e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="High">High Risk</MenuItem>
              <MenuItem value="Medium">Medium Risk</MenuItem>
              <MenuItem value="Low">Low Risk</MenuItem>
            </TextField>
            
            <TextField
              select
              label="Sort By"
              value={filters.sort_by}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              size="small"
            >
              <MenuItem value="opr_lib_date">Date</MenuItem>
              <MenuItem value="opr_lib_montant">Amount</MenuItem>
              <MenuItem value="risk_score">Risk Score</MenuItem>
            </TextField>
            
            <TextField
              select
              label="Sort Order"
              value={filters.sort_order}
              onChange={(e) => handleFilterChange('sort_order', e.target.value)}
              size="small"
            >
              <MenuItem value="DESC">Descending</MenuItem>
              <MenuItem value="ASC">Ascending</MenuItem>
            </TextField>
          </Box>
        </Paper>
        
        {/* Transactions Table */}
        <Paper sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Transaction History ({pagination.total_count.toLocaleString()} total)
            </Typography>
            <Button
              startIcon={<Download />}
              variant="outlined"
              size="small"
              onClick={() => {
                if (transactions && transactions.length > 0) {
                  // Create export data with formatted values
                  const exportData = transactions.map(row => ({
                    'Transaction ID': row.id || '',
                    'Account Number': row.account_number || '',
                    'Account Holder': row.account_holder || '',
                    'Date': row.date ? new Date(row.date).toLocaleString() : 'N/A',
                    'Type': row.type || '',
                    'Amount': `${row.amount?.toLocaleString() || 0} MAD`,
                    'Risk Level': row.risk_level || '',
                    'Risk Score': `${row.risk_score || 0}%`,
                    'Operator': row.operator_name || '',
                    'Agency': row.agency_name || '',
                    'City': row.agency_city || '',
                    'Status': row.status || ''
                  }));
                  api.exportToCSV(exportData, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
                } else {
                  alert('No data to export');
                }
              }}
            >
              Export CSV
            </Button>
          </Box>
          
          <Box sx={{ height: 600 }}>
            <ExportableDataGrid
              rows={transactions}
              columns={columns}
              filename="transactions"
              pageSize={pagination.per_page}
              rowCount={pagination.total_count}
              paginationMode="server"
              page={pagination.page - 1}
              onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage + 1 }))}
              loading={loading}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  borderColor: '#E5E8EA',
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#F5F5F7',
                  fontWeight: 'bold',
                },
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Transactions;