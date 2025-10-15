import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  AccountBalance,
  Assessment,
} from '@mui/icons-material';

const MetricCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
  <Card className="w-80 h-48 mb-4">
    <CardContent className="h-full flex flex-col justify-between p-4">
      <Box className="flex items-center mb-2">
        {icon}
        <Typography variant="h6" className="ml-2 font-bold">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" color={`${color}.main`} className="font-bold mb-2">
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const OverviewSection = ({ stats }) => {
  if (!stats) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading overview...</Typography>
        </CardContent>
      </Card>
    );
  }

  const transactions = stats.transactions || {};
  const alerts = stats.alerts || {};

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatAmount = (amount) => {
    if (!amount) return '0 MAD';
    return `${formatNumber(amount)} MAD`;
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        Overview (24h)
      </Typography>

      <MetricCard
        title="Total Transactions"
        value={formatNumber(transactions.total_transactions)}
        subtitle={`Avg: ${formatAmount(transactions.avg_amount)}`}
        icon={<AccountBalance color="primary" />}
        color="primary"
      />

      <MetricCard
        title="Active Accounts"
        value={formatNumber(transactions.active_accounts)}
        subtitle="Unique accounts"
        icon={<TrendingUp color="success" />}
        color="success"
      />

      <MetricCard
        title="Fraud Alerts"
        value={formatNumber(alerts.total_alerts)}
        subtitle={`${alerts.critical_alerts || 0} critical`}
        icon={<Warning color="#FF7D0e" />}
        color="#FF7D00"
      />

      <MetricCard
        title="Total Volume"
        value={formatAmount(transactions.total_volume)}
        subtitle="Transaction volume"
        icon={<Assessment color="info" />}
        color="info"
      />

      {/* Transaction Breakdown */}
      <Card className="w-full h-44">
        <CardContent className="h-full flex flex-col p-4">
          <Typography variant="h6" className="font-bold mb-4">
            Transaction Types
          </Typography>
          <Stack spacing={1} className="flex-grow">
            <Box className="flex justify-between items-center">
              <Typography variant="body2">Withdrawals</Typography>
              <Chip 
                label={formatNumber(transactions.total_withdrawals)} 
                size="small" 
                color="warning" 
              />
            </Box>
            <Box className="flex justify-between items-center">
              <Typography variant="body2">Deposits</Typography>
              <Chip 
                label={formatNumber(transactions.total_deposits)} 
                size="small" 
                color="success" 
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Alert Status */}
      <Card className="w-full h-44">
        <CardContent className="h-full flex flex-col p-4">
          <Typography variant="h6" className="font-bold mb-4">
            Alert Status
          </Typography>
          <Stack spacing={1} className="flex-grow">
            <Box className="flex justify-between items-center">
              <Typography variant="body2">New Alerts</Typography>
              <Chip 
                label={formatNumber(alerts.new_alerts)} 
                size="small" 
                color="error" 
              />
            </Box>
            <Box className="flex justify-between items-center">
              <Typography variant="body2">Critical</Typography>
              <Chip 
                label={formatNumber(alerts.critical_alerts)} 
                size="small" 
                color="error" 
                variant="outlined"
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default OverviewSection;