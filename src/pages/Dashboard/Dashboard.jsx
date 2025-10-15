import Security from "@mui/icons-material/Security";
import { Box, Typography, Paper, Skeleton, Alert } from "@mui/material";
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Layout from "../../components/Layout/Layout";
import { useSidebar } from "../../components/ui/sidebar";
import * as api from '../../services/api';

const Dashboard = () => {
  const { expanded } = useSidebar();
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAlerts: 0,
    totalReactivations: 0,
    avgTransactionAmount: 0,
    flaggedTransactions: 0,
    processedAlerts: 0,
    reactivations: 0
  });
  
  const [modelPerformance, setModelPerformance] = useState({
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1_score: 0,
    types: {}
  });
  
  const [transactionData, setTransactionData] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all dashboard data in parallel
      const [
        overviewResponse,
        modelResponse,
        chartResponse,
        typesResponse,
      ] = await Promise.all([
        api.getDashboardOverview(),
        api.getModelPerformance(),
        api.getChartData({ days: 7, type: 'daily' }),
        api.getChartData({ type: 'types' })
      ]);
      
      // Update stats - map API response to frontend format
      if (overviewResponse.data?.data) {
        const apiData = overviewResponse.data.data;
        setStats({
          totalTransactions: apiData.total_transactions || 0,
          totalAlerts: apiData.total_alerts || 0,
          totalReactivations: apiData.total_reactivations || 0,
          avgTransactionAmount: parseFloat(apiData.avg_transaction_amount) || 0,
          flaggedTransactions: apiData.flagged_transactions || 0,
          processedAlerts: apiData.processed_alerts || 0,
          reactivations: apiData.total_reactivations || 0
        });
      }
      
      // Update model performance - map API response to frontend format
      if (modelResponse.data) {
        const perfData = modelResponse.data;
        setModelPerformance({
          accuracy: perfData.accuracy || 0,
          precision: perfData.precision || 0,
          recall: perfData.recall || 0,
          f1_score: perfData.f1_score || 0,
          types: perfData.model_types || {}
        });
      }
      
      // Update charts
      if (chartResponse.data?.data) {
        setTransactionData(chartResponse.data.data);
      }
      
      if (typesResponse.data?.data) {
        setTransactionTypes(typesResponse.data.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const metricsData = [
    { 
      title: "Total Transactions", 
      value: loading ? <Skeleton /> : stats.totalTransactions.toLocaleString(),
      color: "#007AFF"
    },
    { 
      title: "Flagged Transactions", 
      value: loading ? <Skeleton /> : stats.flaggedTransactions.toLocaleString(),
      color: "#FB8500"
    },
    { 
      title: "Processed Alerts", 
      value: loading ? <Skeleton /> : (stats.processedAlerts || 0).toLocaleString(),
      color: "#2FBF71"
    },
    { 
      title: "Reactivations", 
      value: loading ? <Skeleton /> : stats.reactivations.toLocaleString(),
      color: "#FF3B30"
    }
  ];

  const COLORS = ['#007AFF', '#A663CC', '#FB8500', '#FF3B30', '#2FBF71'];


  return (
    <Layout title="Fraud Detection Dashboard" icon={Security}>
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Overview Metrics */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: expanded 
            ? { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }
            : { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(4, 1fr)' },
          gap: expanded ? 2 : 3,
          mb: 3,
          width: '100%',
          maxWidth: expanded ? '100%' : '100%'
        }}>
          {metricsData.map((metric, index) => (
            <Paper 
              key={index}
              sx={{ 
                p: expanded ? 2.5 : 3,
                height: 144,
                minHeight: 144,
                maxHeight: 144,
                width: '100%',
                minWidth: expanded ? 200 : 250,
                maxWidth: expanded ? 280 : 350,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease'
              }}
            >
              <Typography variant="caption" sx={{ color: '#86868B', fontSize: '0.75rem' }}>
                {metric.title}
              </Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                color: metric.color,
                fontSize: expanded ? '1.8rem' : '2.125rem',
                transition: 'font-size 0.3s ease'
              }}>
                {metric.value}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Transaction Activity Section */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 3,
          justifyContent: 'flex-start'
        }}>
          <Paper sx={{ 
            p: 3,
            width: expanded ? 700 : 730, // Responsive width based on sidebar
            height: 400, // Fixed height
            minWidth: expanded ? 700 : 730,
            minHeight: 400,
            maxWidth: expanded ? 700 : 900,
            maxHeight: 400,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Transaction Activity (Last 7 Days)
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={320} />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EA" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => value.toLocaleString()}
                    contentStyle={{ borderRadius: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#007AFF" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
          
          <Paper sx={{ 
            p: 3,
            width: expanded ? 450 : 610, // Responsive width based on sidebar
            height: 400, // Fixed height
            minWidth: expanded ? 450 : 610,
            minHeight: 400,
            maxWidth: expanded ? 450 : 600,
            maxHeight: 400,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Transaction Types (Last 30 Days)
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={320} />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={transactionTypes.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value.toLocaleString()}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transactionTypes.slice(0, 5).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Box>

        {/* Model Performance Section */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 3,
          justifyContent: 'flex-start'
        }}>
          <Paper sx={{ 
            p: 3,
            width: expanded ? 500 : 500, // Fixed width
            height: 350, // Fixed height
            minWidth: expanded ? 500 : 540,
            minHeight: 350,
            maxWidth: expanded ? 550 : 600,
            maxHeight: 350,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Model Performance Metrics
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={270} />
            ) : (
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={[
                  { name: 'Accuracy', value: modelPerformance.accuracy },
                  { name: 'Precision', value: modelPerformance.precision },
                  { name: 'Recall', value: modelPerformance.recall },
                  { name: 'F1 Score', value: modelPerformance.f1_score }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EA" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" fill="#007AFF">
                    {[0, 1, 2, 3].map((index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>

          {/* Performance by transaction type */}
          <Paper sx={{
            p: 3,
            width: expanded ? 750 : 800, // Fixed width
            height: 350, // Fixed height
            minWidth: expanded ? 650 : 700,
            minHeight: 350,
            maxWidth: expanded ? 550 : 800,
            maxHeight: 350,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Performance by Transaction Type
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={270} />
            ) : (
              <ResponsiveContainer width="100%" height={270}>
                <BarChart 
                  data={Object.entries(modelPerformance.types || {}).map(([type, data]) => ({
                    name: type.charAt(0).toUpperCase() + type.slice(1),
                    score: data.avg_score || 0
                  }))} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EA" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} 
                    contentStyle={{
                      backgroundColor: '#53599A',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} />
                  <Bar dataKey="score" fill="#7A89C2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Box>



        {/* Recent Alerts Table */}
        {/* <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 3
        }}>
          <Paper sx={{ 
            p: 3,
            width: 1200, // Fixed width for table
            height: 500, // Fixed height
            minWidth: 1200,
            minHeight: 500,
            maxWidth: 1200,
            maxHeight: 500,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Recent Fraud Alerts
            </Typography>
            <Box sx={{ height: 420, flexGrow: 1 }}>
              <DataGrid
                rows={recentAlerts}
                columns={alertColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row) => row.alert_id || Math.random()}
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
        </Box> */}
      </Box>
    </Layout>
  );
};

export default Dashboard;