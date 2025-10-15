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
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  Replay as ReactivationIcon,
  Search,
  FilterList,
  Download,
  Refresh,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { ExportableDataGrid } from '../../components/ExportableDataGrid';
import * as api from '../../services/api';

const Reactivations = () => {
  const [reactivations, setReactivations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    high_risk: 0,
    medium_risk: 0,
    low_risk: 0,
    alerts_generated: 0,
    avg_dormancy: 0,
    today_count: 0
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 50,
    total_count: 0,
    total_pages: 0
  });
  
  const [filters, setFilters] = useState({
    account_id: '',
    risk_level: '',
    min_dormancy: '',
    max_dormancy: '',
    start_date: '',
    end_date: '',
    alert_generated: '',
    sort_by: 'created_at',
    sort_order: 'DESC'
  });

  useEffect(() => {
    fetchReactivations();
    fetchStatistics();
  }, [pagination.page, filters.sort_by, filters.sort_order]);

  const fetchReactivations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v != null && v !== '')
        )
      };
      
      const response = await api.getReactivations(params);
      
      if (response.data?.data) {
        setReactivations(response.data.data.reactivations || []);
        setPagination(response.data.data.pagination || pagination);
      }
    } catch (err) {
      console.error('Error fetching reactivations:', err);
      setError('Failed to fetch reactivations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.getReactivationStatistics();
      if (response.data?.data) {
        setStatistics(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchReactivations();
  };

  const handleResetFilters = () => {
    setFilters({
      account_id: '',
      risk_level: '',
      min_dormancy: '',
      max_dormancy: '',
      start_date: '',
      end_date: '',
      alert_generated: '',
      sort_by: 'created_at',
      sort_order: 'DESC'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getRiskChip = (riskLevel) => {
    const config = {
      'HIGH': { color: 'error', icon: <Warning />, bgcolor: '#FFEBEB' },
      'MEDIUM': { color: 'warning', icon: <TrendingUp />, bgcolor: '#FFF4E6' },
      'LOW': { color: 'success', icon: <CheckCircle />, bgcolor: '#E8F5E9' }
    };
    
    const levelConfig = config[riskLevel] || config['LOW'];
    
    return (
      <Chip
        label={riskLevel}
        size="small"
        icon={levelConfig.icon}
        sx={{
          bgcolor: levelConfig.bgcolor,
          color: levelConfig.color
        }}
      />
    );
  };

  const getDormancyChip = (days) => {
    let color = 'default';
    let label = `${days} days`;
    
    if (days >= 365) {
      color = 'error';
      label = `${Math.floor(days/365)}+ years`;
    } else if (days >= 180) {
      color = 'warning';
      label = `${Math.floor(days/30)} months`;
    }
    
    return <Chip label={label} size="small" color={color} />;
  };

  const columns = [
    { 
      field: 'reactivation_id', 
      headerName: 'ID', 
      width: 80,
      renderCell: (params) => `#${params.value}`
    },
    { 
      field: 'account_id', 
      headerName: 'Account', 
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      )
    },
    { field: 'client_name', headerName: 'Client Name', width: 160 },
    { 
      field: 'transaction_date', 
      headerName: 'Reactivation Date', 
      width: 160,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
    },
    { 
      field: 'transaction_type', 
      headerName: 'Transaction Type', 
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {params.value || 'Unknown'}
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
      field: 'days_dormant', 
      headerName: 'Dormancy Period', 
      width: 140,
      renderCell: (params) => getDormancyChip(params.value)
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
      renderCell: (params) => {
        const score = params.value || 0;
        const color = score >= 80 ? '#FF3B30' : score >= 50 ? '#FF9500' : '#AAFCB8';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{
              width: 30,
              height: 4,
              borderRadius: 2,
              bgcolor: color,
              opacity: score / 100
            }} />
            <Typography variant="body2">{score}%</Typography>
          </Box>
        );
      }
    },
    { 
      field: 'alert_generated', 
      headerName: 'Alert', 
      width: 100,
      renderCell: (params) => params.value ? (
        <Chip label="Generated" size="small" color="error" />
      ) : (
        <Chip label="No Alert" size="small" variant="outlined" />
      )
    },
    { field: 'agency_name', headerName: 'Agency', width: 140 },
    { field: 'operator_name', headerName: 'Operator', width: 140 }
  ];

  return (
    <Layout title="Account Reactivations" icon={ReactivationIcon}>
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Total Reactivations
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {statistics.total}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFEBEB' }}>
              <Typography variant="caption" color="text.secondary">
                High Risk
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF3B30' }}>
                {statistics.high_risk}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF4E6' }}>
              <Typography variant="caption" color="text.secondary">
                Alerts Generated
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9500' }}>
                {statistics.alerts_generated}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Avg Dormancy
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {Math.round(statistics.avg_dormancy)} days
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Filters */}
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Filters
            </Typography>
            <Box>
              <Button
                startIcon={<FilterList />}
                onClick={handleApplyFilters}
                variant="contained"
                sx={{ mr: 1 }}
              >
                Apply
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
              label="Account ID"
              value={filters.account_id}
              onChange={(e) => handleFilterChange('account_id', e.target.value)}
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
              label="Risk Level"
              value={filters.risk_level}
              onChange={(e) => handleFilterChange('risk_level', e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
            </TextField>
            
            <TextField
              label="Min Dormancy (days)"
              type="number"
              value={filters.min_dormancy}
              onChange={(e) => handleFilterChange('min_dormancy', e.target.value)}
              size="small"
            />
            
            <TextField
              label="Max Dormancy (days)"
              type="number"
              value={filters.max_dormancy}
              onChange={(e) => handleFilterChange('max_dormancy', e.target.value)}
              size="small"
            />
            
            <TextField
              select
              label="Alert Generated"
              value={filters.alert_generated}
              onChange={(e) => handleFilterChange('alert_generated', e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>
            
            <TextField
              select
              label="Sort By"
              value={filters.sort_by}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              size="small"
            >
              <MenuItem value="created_at">Date</MenuItem>
              <MenuItem value="days_dormant">Dormancy Period</MenuItem>
              <MenuItem value="risk_score">Risk Score</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
            </TextField>
          </Box>
        </Paper>
        
        {/* Data Table */}
        <Paper sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Reactivation History ({pagination.total_count.toLocaleString()} total)
            </Typography>
            <Button
              startIcon={<Download />}
              variant="outlined"
              size="small"
              onClick={() => {
                if (reactivations && reactivations.length > 0) {
                  // Create export data with formatted values
                  const exportData = reactivations.map(row => ({
                    'Account': row.numero_compte || '',
                    'Account Holder': row.nom_titulaire || '',
                    'Reactivation Date': row.date_reactivation ? new Date(row.date_reactivation).toLocaleString() : 'N/A',
                    'Last Activity': row.date_derniere_activite ? new Date(row.date_derniere_activite).toLocaleDateString() : 'N/A',
                    'Dormancy Period': `${row.duree_inactivite || 0} days`,
                    'First Transaction Amount': `${row.montant_premiere_operation?.toLocaleString() || 0} MAD`,
                    'Transaction Type': row.type_premiere_operation || '',
                    'Risk Level': row.niveau_risque || '',
                    'Risk Score': `${row.score_risque || 0}%`,
                    'Alert Generated': row.alerte_generee ? 'Yes' : 'No',
                    'Agency': row.nom_agence || '',
                    'City': row.ville || '',
                    'Operator': row.nom_operateur || ''
                  }));
                  api.exportToCSV(exportData, `reactivations_${new Date().toISOString().split('T')[0]}.csv`);
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
              filename="reactivations"
              rows={reactivations}
              columns={columns}
              pageSize={pagination.per_page}
              rowCount={pagination.total_count}
              paginationMode="server"
              page={pagination.page - 1}
              onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage + 1 }))}
              loading={loading}
              disableSelectionOnClick
              getRowId={(row) => row.reactivation_id}
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

export default Reactivations;