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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  NotificationsActive as AlertIcon,
  Search,
  FilterList,
  Download,
  Refresh,
  Info,
  CheckCircle,
  Cancel,
  Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { ExportableDataGrid } from '../../components/ExportableDataGrid';
import * as api from '../../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 50,
    total_count: 0,
    total_pages: 0
  });
  
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    min_score: '',
    max_score: '',
    fraud_type: '',
    start_date: '',
    end_date: '',
    sort_by: 'created_at',
    sort_order: 'DESC'
  });

  const [statistics, setStatistics] = useState({
    total: 0,
    new: 0,
    processed: 0,
    reactivations: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    processed_today: 0
  });

  useEffect(() => {
    fetchAlerts();
    fetchStatistics();
    
    // Auto-refresh statistics every 30 seconds
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, [pagination.page, filters.sort_by, filters.sort_order]);

  const fetchAlerts = async () => {
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
      
      const response = await api.getAlerts(params);
      
      if (response.data?.data) {
        setAlerts(response.data.data.alerts || []);
        setPagination(prev => ({
          ...prev,
          ...response.data.data.pagination
        }));
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to fetch alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      console.log('Fetching alert statistics...');
      
      const response = await api.getAlertStatistics();
      console.log('Statistics response:', response.data);
      
      if (response.data?.data) {
        setStatistics(response.data.data);
        console.log('Statistics updated:', response.data.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      // Don't show error for statistics, just use default values
      setStatistics({
        total: 0,
        new: 0,
        processed: 0,
        reactivations: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        processed_today: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchAlerts();
    fetchStatistics(); // Refresh statistics when filters change
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      min_score: '',
      max_score: '',
      fraud_type: '',
      start_date: '',
      end_date: '',
      sort_by: 'created_at',
      sort_order: 'DESC'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => {
      fetchAlerts();
      fetchStatistics();
    }, 100);
  };

  const handleUpdateAlert = async (alertId, updates) => {
    try {
      await api.updateAlert(alertId, updates);
      // Refresh both alerts and statistics after update
      fetchAlerts();
      fetchStatistics();
      setDetailsOpen(false);
    } catch (err) {
      console.error('Error updating alert:', err);
      setError('Failed to update alert');
    }
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setDetailsOpen(true);
  };

  const getPriorityIcon = (priority) => {
    const priorityUpper = (priority || 'NORMALE').toUpperCase();
    switch (priorityUpper) {
      case 'CRITIQUE':
        return <ErrorIcon sx={{ fontSize: 16, color: '#FF3B30' }} />;
      case 'ÉLEVÉE':
        return <Warning sx={{ fontSize: 16, color: '#FF9500' }} />;
      default:
        return <CheckCircle sx={{ fontSize: 16, color: '#2FBF71' }} />;
    }
  };

  const getStatusChip = (status) => {
    const config = {
      'nouveau': { color: 'info', label: 'New' },
      'en_cours': { color: 'warning', label: 'In Progress' },
      'traité': { color: 'success', label: 'Processed' },
      'faux_positif': { color: 'default', label: 'False Positive' }
    };
    
    const statusConfig = config[status] || { color: 'default', label: status || 'Unknown' };
    
    return (
      <Chip
        label={statusConfig.label}
        size="small"
        color={statusConfig.color}
      />
    );
  };

  const columns = [
    { 
      field: 'alert_id', 
      headerName: 'Alert ID', 
      width: 90,
      renderCell: (params) => `#${params.value || 'N/A'}`
    },
    { 
      field: 'numero_compte', 
      headerName: 'Account', 
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {params.value || 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'nom_titulaire', 
      headerName: 'Account Holder', 
      width: 160
    },
    { 
      field: 'type_mouvement', 
      headerName: 'Transaction Type', 
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {params.value || 'Unknown'}
        </Typography>
      )
    },
    { 
      field: 'montant_recent', 
      headerName: 'Amount', 
      width: 110,
      renderCell: (params) => `${params.value?.toLocaleString() || 0} MAD`
    },
    { 
      field: 'duree_inactivite_jours', 
      headerName: 'Dormancy', 
      width: 100,
      renderCell: (params) => `${params.value || 0} days`
    },
    { 
      field: 'score_risque', 
      headerName: 'Risk Score', 
      width: 110,
      renderCell: (params) => {
        const score = params.value || 0;
        const color = score >= 80 ? '#FF3B30' : score >= 50 ? '#FF9500' : '#2FBF71';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 40,
              height: 6,
              borderRadius: 3,
              bgcolor: '#E5E8EA',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                width: `${score}%`,
                height: '100%',
                bgcolor: color,
                position: 'absolute',
                left: 0,
                top: 0
              }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {score}%
            </Typography>
          </Box>
        );
      }
    },
    { 
      field: 'priorite', 
      headerName: 'Priority', 
      width: 110,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getPriorityIcon(params.value)}
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {params.value || 'NORMALE'}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'statut_alerte', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => getStatusChip(params.value)
    },
    { 
      field: 'agency_name', 
      headerName: 'Agency', 
      width: 140
    },
    { 
      field: 'created_at', 
      headerName: 'Created', 
      width: 160,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Button
          size="small"
          startIcon={<Info />}
          onClick={() => handleViewDetails(params.row)}
        >
          Details
        </Button>
      )
    }
  ];

  // Statistics card component
  const StatCard = ({ title, value, color, bgcolor, loading }) => (
    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: bgcolor || '#F5F5F7' }}>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: color || '#000' }}>
        {loading ? <Skeleton width={60} sx={{ margin: '0 auto' }} /> : value}
      </Typography>
    </Paper>
  );

  return (
    <Layout title="Fraud Alerts" icon={AlertIcon}>
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="New Alerts"
              value={statistics.new}
              color="#007AFF"
              bgcolor="#F0F8FF"
              loading={statsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Critical Priority"
              value={statistics.critical}
              color="#FF3B30"
              bgcolor="#FFEBEB"
              loading={statsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="High Priority"
              value={statistics.high}
              color="#FF9500"
              bgcolor="#FFF4E6"
              loading={statsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Processed Today"
              value={statistics.processed_today}
              color="#2FBF71"
              bgcolor="#E8F5E9"
              loading={statsLoading}
            />
          </Grid>
        </Grid>
        
        {/* Filters Section */}
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Alert Filters
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
              select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="nouveau">New</MenuItem>
              <MenuItem value="en_cours">In Progress</MenuItem>
              <MenuItem value="traité">Processed</MenuItem>
              <MenuItem value="faux_positif">False Positive</MenuItem>
            </TextField>
            
            <TextField
              select
              label="Priority"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="CRITIQUE">Critical</MenuItem>
              <MenuItem value="ÉLEVÉE">High</MenuItem>
              <MenuItem value="NORMALE">Normal</MenuItem>
              <MenuItem value="BASSE">Low</MenuItem>
            </TextField>
            
            <TextField
              label="Min Risk Score"
              type="number"
              value={filters.min_score}
              onChange={(e) => handleFilterChange('min_score', e.target.value)}
              size="small"
              InputProps={{
                inputProps: { min: 0, max: 100 }
              }}
            />
            
            <TextField
              label="Max Risk Score"
              type="number"
              value={filters.max_score}
              onChange={(e) => handleFilterChange('max_score', e.target.value)}
              size="small"
              InputProps={{
                inputProps: { min: 0, max: 100 }
              }}
            />
            
            <TextField
              select
              label="Fraud Type"
              value={filters.fraud_type}
              onChange={(e) => handleFilterChange('fraud_type', e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="fraude_montant">Amount Fraud</MenuItem>
              <MenuItem value="fraude_geographique">Geographic Fraud</MenuItem>
              <MenuItem value="fraude_temporelle">Temporal Fraud</MenuItem>
              <MenuItem value="reactivation_suspecte">Suspicious Reactivation</MenuItem>
            </TextField>
            
            <TextField
              label="Start Date"
              type="datetime-local"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="End Date"
              type="datetime-local"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              select
              label="Sort By"
              value={filters.sort_by}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              size="small"
            >
              <MenuItem value="created_at">Creation Date</MenuItem>
              <MenuItem value="score_risque">Risk Score</MenuItem>
              <MenuItem value="montant_recent">Amount</MenuItem>
              <MenuItem value="duree_inactivite_jours">Dormancy Days</MenuItem>
              <MenuItem value="priorite">Priority</MenuItem>
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
        
        {/* Alerts Table */}
        <Paper sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Fraud Alerts ({pagination.total_count.toLocaleString()} total)
            </Typography>
            <Box>
              <IconButton onClick={() => { fetchAlerts(); fetchStatistics(); }} color="primary">
                <Refresh />
              </IconButton>
              <Button
                startIcon={<Download />}
                variant="outlined"
                size="small"
                onClick={() => {
                  if (alerts && alerts.length > 0) {
                    // Create export data with formatted values
                    const exportData = alerts.map(row => ({
                      'Alert ID': `#${row.alert_id || 'N/A'}`,
                      'Account': row.numero_compte || 'N/A',
                      'Account Holder': row.nom_titulaire || '',
                      'Transaction Type': row.type_mouvement || 'Unknown',
                      'Amount': `${row.montant_recent?.toLocaleString() || 0} MAD`,
                      'Dormancy': `${row.duree_inactivite_jours || 0} days`,
                      'Risk Score': `${row.score_risque || 0}%`,
                      'Priority': row.priorite || 'NORMALE',
                      'Status': row.statut_alerte || '',
                      'Agency': row.agency_name || '',
                      'Created': row.created_at ? new Date(row.created_at).toLocaleString() : 'N/A'
                    }));
                    api.exportToCSV(exportData, `fraud_alerts_${new Date().toISOString().split('T')[0]}.csv`);
                  } else {
                    alert('No data to export');
                  }
                }}
              >
                Export CSV
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ height: 600 }}>
            <ExportableDataGrid
              rows={alerts}
              columns={columns}
              filename="fraud_alerts"
              pageSize={pagination.per_page}
              rowCount={pagination.total_count}
              paginationMode="server"
              page={pagination.page - 1}
              onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage + 1 }))}
              loading={loading}
              disableSelectionOnClick
              getRowId={(row) => row.alert_id || Math.random()}
              sx={{
                '& .MuiDataGrid-cell': {
                  borderColor: '#E5E8EA',
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#F5F5F7',
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: '#F8F9FA',
                },
              }}
            />
          </Box>
        </Paper>
        
        {/* Alert Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Alert Details #{selectedAlert?.alert_id}
              </Typography>
              <IconButton onClick={() => setDetailsOpen(false)}>
                <Cancel />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedAlert && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account Information
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Account: {selectedAlert.numero_compte}<br />
                    Holder: {selectedAlert.nom_titulaire}<br />
                    Phone: {selectedAlert.telephone_client}<br />
                    Balance: {selectedAlert.account_balance?.toLocaleString() || 0} MAD
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Transaction Details
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Type: {selectedAlert.type_mouvement}<br />
                    Amount: {selectedAlert.montant_recent?.toLocaleString() || 0} MAD<br />
                    Last Activity: {selectedAlert.date_dernier_mouvement ? 
                      new Date(selectedAlert.date_dernier_mouvement).toLocaleDateString() : 'N/A'}<br />
                    Dormancy: {selectedAlert.duree_inactivite_jours} days
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Risk Assessment
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Risk Score: {selectedAlert.score_risque}%<br />
                    Fraud Type: {selectedAlert.type_fraude_detecte}<br />
                    Priority: {selectedAlert.priorite}<br />
                    Status: {selectedAlert.statut_alerte}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location Information
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Agency: {selectedAlert.agency_name}<br />
                    City: {selectedAlert.ville_agence}<br />
                    Operator: {selectedAlert.nom_operateur}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fraud Scenario
                  </Typography>
                  <Typography variant="body1">
                    {selectedAlert.scenario_fraude || 'No scenario description available'}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleUpdateAlert(selectedAlert?.alert_id, { 
                statut_alerte: 'faux_positif',
                processed_by: 'admin'
              })}
              color="warning"
            >
              Mark as False Positive
            </Button>
            <Button
              onClick={() => handleUpdateAlert(selectedAlert?.alert_id, { 
                statut_alerte: 'traité',
                processed_by: 'admin'
              })}
              variant="contained"
              color="success"
            >
              Mark as Processed
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Alerts;