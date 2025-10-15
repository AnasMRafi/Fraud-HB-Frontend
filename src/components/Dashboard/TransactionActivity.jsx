import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const TransactionActivity = ({ stats }) => {
  // Sample data for charts (in real implementation, this would come from API)
  const hourlyData = [
    { hour: '00', transactions: 12, amount: 25000 },
    { hour: '01', transactions: 8, amount: 18000 },
    { hour: '02', transactions: 5, amount: 12000 },
    { hour: '03', transactions: 3, amount: 8000 },
    { hour: '04', transactions: 7, amount: 15000 },
    { hour: '05', transactions: 15, amount: 32000 },
    { hour: '06', transactions: 28, amount: 56000 },
    { hour: '07', transactions: 45, amount: 89000 },
    { hour: '08', transactions: 65, amount: 128000 },
    { hour: '09', transactions: 82, amount: 165000 },
    { hour: '10', transactions: 95, amount: 192000 },
    { hour: '11', transactions: 88, amount: 176000 },
    { hour: '12', transactions: 92, amount: 185000 },
    { hour: '13', transactions: 87, amount: 174000 },
    { hour: '14', transactions: 78, amount: 156000 },
    { hour: '15', transactions: 85, amount: 170000 },
    { hour: '16', transactions: 72, amount: 144000 },
    { hour: '17', transactions: 68, amount: 136000 },
    { hour: '18', transactions: 55, amount: 110000 },
    { hour: '19', transactions: 42, amount: 84000 },
    { hour: '20', transactions: 35, amount: 70000 },
    { hour: '21', transactions: 28, amount: 56000 },
    { hour: '22', transactions: 22, amount: 44000 },
    { hour: '23', transactions: 18, amount: 36000 },
  ];

  const transactionTypes = [
    { name: 'Withdrawals', value: stats?.transactions?.total_withdrawals || 45, color: '#ff6b6b' },
    { name: 'Deposits', value: stats?.transactions?.total_deposits || 35, color: '#4ecdc4' },
    { name: 'Transfers', value: 20, color: '#45b7d1' },
  ];

  const riskLevels = [
    { name: 'Low Risk', count: 156, color: '#4caf50' },
    { name: 'Medium Risk', count: 23, color: '#ff9800' },
    { name: 'High Risk', count: 8, color: '#f44336' },
    { name: 'Critical', count: 3, color: '#9c27b0' },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Transaction Activity (Last 24 Hours)
        </Typography>

        <Grid container spacing={3}>
          {/* Hourly Transaction Volume */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Hourly Transaction Volume
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'transactions' ? value : `${value.toLocaleString()} MAD`,
                      name === 'transactions' ? 'Transactions' : 'Amount'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="transactions" fill="#8884d8" opacity={0.7} />
                  <Bar yAxisId="right" dataKey="amount" fill="#82ca9d" opacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Transaction Types */}
          <Grid item xs={12} lg={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Transaction Types
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {transactionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Grid>

          {/* Risk Levels */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Risk Level Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskLevels} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {riskLevels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TransactionActivity;