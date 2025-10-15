import React, { useState } from 'react';
import { 
  Box, 
  Stack, 
  Typography, 
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { FileText, Download, TrendingUp, PieChart, BarChart, AlertCircle, Calendar } from 'lucide-react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Layout from '../../components/Layout/Layout';
import * as api from '../../services/api';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Report parameters
  const [reportParams, setReportParams] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    type: 'alerts'
  });

  const reportTypes = [
    {
      id: 'alerts',
      title: 'Alerts Report',
      description: 'Comprehensive report of all fraud alerts within the selected period',
      icon: <AlertCircle size={24} />,
      apiType: 'alerts',
      color: '#FF6B6B'
    },
    {
      id: 'transactions',
      title: 'Transactions Report',
      description: 'Detailed analysis of all transactions and patterns',
      icon: <TrendingUp size={24} />,
      apiType: 'transactions',
      color: '#4ECDC4'
    },
    {
      id: 'summary',
      title: 'Executive Summary',
      description: 'High-level overview with key metrics and insights',
      icon: <FileText size={24} />,
      apiType: 'summary',
      color: '#45B7D1'
    },
    {
      id: 'operators',
      title: 'Operators Report',
      description: 'Performance analysis of operators and their activities',
      icon: <BarChart size={24} />,
      apiType: 'operators',
      color: '#96CEB4'
    }
  ];

  const generateReport = async (reportType) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Check if backend is available, if not generate mock data
      try {
        const response = await api.generateReport({
          ...reportParams,
          type: reportType
        });

        // Create download link for the blob
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cd01_${reportType}_${reportParams.start_date}_${reportParams.end_date}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setSuccess(`${reportType} report generated and downloaded successfully!`);
      } catch (apiError) {
        // Fallback to mock data if backend is not available
        console.log('Backend not available, generating mock data...');
        generateMockReport(reportType);
        setSuccess(`${reportType} report (mock data) generated and downloaded successfully!`);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(`Failed to generate ${reportType} report. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const generateMockReport = (reportType) => {
    let mockData = [];
    
    // Generate mock data based on report type
    switch (reportType) {
      case 'alerts':
        mockData = Array.from({ length: 50 }, (_, i) => ({
          alert_id: `AL${1000 + i}`,
          numero_compte: `ACC${Math.floor(Math.random() * 10000)}`,
          nom_titulaire: `Account Holder ${i + 1}`,
          montant_recent: Math.floor(Math.random() * 50000) + 1000,
          score_risque: Math.floor(Math.random() * 100),
          priorite: ['CRITIQUE', 'ÉLEVÉE', 'NORMALE'][Math.floor(Math.random() * 3)],
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
        break;
      case 'transactions':
        mockData = Array.from({ length: 100 }, (_, i) => ({
          transaction_id: `TX${10000 + i}`,
          numero_compte: `ACC${Math.floor(Math.random() * 10000)}`,
          montant: Math.floor(Math.random() * 20000) + 500,
          type_transaction: ['DEPOT', 'RETRAIT', 'VIREMENT'][Math.floor(Math.random() * 3)],
          flagged: Math.random() > 0.8,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
        break;
      case 'summary':
        mockData = [
          { metric: 'Total Transactions', value: '12,543', change: '+5.2%' },
          { metric: 'Flagged Transactions', value: '1,234', change: '+2.1%' },
          { metric: 'Alerts Generated', value: '567', change: '-1.5%' },
          { metric: 'Processed Alerts', value: '523', change: '+8.7%' },
          { metric: 'False Positives', value: '44', change: '-12.3%' }
        ];
        break;
      case 'operators':
        mockData = Array.from({ length: 20 }, (_, i) => ({
          operator_id: `OP${100 + i}`,
          nom_operateur: `Operator ${i + 1}`,
          agence: `Agency ${String.fromCharCode(65 + (i % 6))}`,
          transactions_traitees: Math.floor(Math.random() * 500) + 100,
          alertes_generees: Math.floor(Math.random() * 50) + 10,
          performance_score: Math.floor(Math.random() * 30) + 70
        }));
        break;
    }

    // Use the API export function to download the mock data
    api.exportToCSV(mockData, `cd01_${reportType}_${reportParams.start_date}_${reportParams.end_date}.csv`);
  };

  const exportSystemParameters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.exportParameters();
        
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `system_parameters_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setSuccess('System parameters exported successfully!');
      } catch (apiError) {
        // Fallback to mock parameters data
        const mockParameters = [
          { category: 'Detection', parameter: 'risk_threshold', value: '75', description: 'Minimum risk score for alert generation' },
          { category: 'Detection', parameter: 'velocity_limit', value: '5', description: 'Max transactions per minute' },
          { category: 'Detection', parameter: 'amount_threshold', value: '10000', description: 'Large transaction amount threshold' },
          { category: 'Notification', parameter: 'email_enabled', value: 'true', description: 'Enable email notifications' },
          { category: 'Notification', parameter: 'sms_enabled', value: 'false', description: 'Enable SMS notifications' },
          { category: 'System', parameter: 'log_level', value: 'INFO', description: 'System logging level' },
          { category: 'System', parameter: 'backup_frequency', value: '24', description: 'Database backup frequency (hours)' }
        ];
        
        api.exportToCSV(mockParameters, `system_parameters_${new Date().toISOString().split('T')[0]}.csv`);
        setSuccess('System parameters (mock data) exported successfully!');
      }
    } catch (err) {
      console.error('Error exporting parameters:', err);
      setError('Failed to export system parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Reports & Analytics" icon={AssessmentIcon}>
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Generate comprehensive fraud detection and system performance reports
        </Typography>

        {/* Date Range Selection */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Report Parameters
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={reportParams.start_date}
                  onChange={(e) => setReportParams({...reportParams, start_date: e.target.value})}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="End Date"
                  type="date"
                  value={reportParams.end_date}
                  onChange={(e) => setReportParams({...reportParams, end_date: e.target.value})}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  startIcon={<Calendar size={16} />}
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    setReportParams({
                      ...reportParams,
                      start_date: lastMonth.toISOString().split('T')[0],
                      end_date: today.toISOString().split('T')[0]
                    });
                  }}
                  fullWidth
                >
                  Last 30 Days
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Alert Messages */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Report Cards */}
        <Grid container spacing={3}>
          {reportTypes.map((report) => (
            <Grid item xs={12} sm={6} md={3} key={report.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)'
                  }
                }}
                onClick={() => setSelectedReport(report)}
              >
                <CardContent>
                  <Box sx={{ 
                    mb: 2, 
                    color: report.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    {report.icon}
                    <Typography variant="h6" component="span">
                      {report.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 48 }}>
                    {report.description}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <Download size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      generateReport(report.apiType);
                    }}
                    disabled={loading}
                    fullWidth
                    sx={{ 
                      bgcolor: report.color,
                      '&:hover': {
                        bgcolor: report.color,
                        filter: 'brightness(0.9)'
                      }
                    }}
                  >
                    {loading ? 'Generating...' : 'Generate'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Additional Export Options */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Additional Exports
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      System Parameters
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Export all current system configuration parameters
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={loading ? <CircularProgress size={16} /> : <Download size={16} />}
                      onClick={exportSystemParameters}
                      disabled={loading}
                      fullWidth
                    >
                      Export Parameters
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Quick Stats
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      View current system statistics and performance metrics
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<PieChart size={16} />}
                      onClick={() => window.location.href = '/dashboard'}
                      fullWidth
                    >
                      View Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Report Preview Section */}
        {selectedReport && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {selectedReport.title} - Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This report will include data from {reportParams.start_date} to {reportParams.end_date}
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Report Contents:
                </Typography>
                <ul>
                  {selectedReport.apiType === 'alerts' && (
                    <>
                      <li>All fraud alerts with complete details</li>
                      <li>Risk scores and priority levels</li>
                      <li>Processing status and timestamps</li>
                      <li>Operator and agency information</li>
                    </>
                  )}
                  {selectedReport.apiType === 'transactions' && (
                    <>
                      <li>Complete transaction records</li>
                      <li>Transaction types and amounts</li>
                      <li>Account and client details</li>
                      <li>Fraud detection flags</li>
                    </>
                  )}
                  {selectedReport.apiType === 'summary' && (
                    <>
                      <li>Executive overview and KPIs</li>
                      <li>Detection rate statistics</li>
                      <li>Top risk accounts and patterns</li>
                      <li>Period-over-period comparisons</li>
                    </>
                  )}
                  {selectedReport.apiType === 'operators' && (
                    <>
                      <li>Operator performance metrics</li>
                      <li>Transaction volumes by operator</li>
                      <li>Alert generation statistics</li>
                      <li>Agency-wise breakdown</li>
                    </>
                  )}
                </ul>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Layout>
  );
};

export default Reports;