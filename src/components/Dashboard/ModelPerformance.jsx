import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid,
  Stack,
} from '@mui/material';
import {
  Psychology,
  Speed,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';

const MetricBar = ({ label, value, color = 'primary', icon }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {icon}
        <Typography variant="body2" sx={{ ml: 1 }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
        {value}%
      </Typography>
    </Box>
    <LinearProgress 
      variant="determinate" 
      value={value} 
      color={color}
      sx={{ height: 8, borderRadius: 4 }}
    />
  </Box>
);

const ModelPerformance = () => {
  const modelMetrics = {
    accuracy: 94.2,
    precision: 89.7,
    recall: 92.1,
    f1Score: 90.9,
  };

  const modelStatus = [
    { name: 'XGBoost', status: 'active', accuracy: 93.5, color: 'success' },
    { name: 'LightGBM', status: 'active', accuracy: 94.2, color: 'success' },
    { name: 'Random Forest', status: 'active', accuracy: 91.8, color: 'success' },
    { name: 'LSTM', status: 'active', accuracy: 88.9, color: 'success' },
    { name: 'Autoencoder', status: 'active', accuracy: 87.3, color: 'success' },
  ];

  const recentPerformance = [
    { period: 'Last Hour', detected: 12, falsePositives: 1, accuracy: 95.2 },
    { period: 'Last 6 Hours', detected: 67, falsePositives: 4, accuracy: 94.8 },
    { period: 'Last 24 Hours', detected: 189, falsePositives: 11, accuracy: 94.2 },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          ML Model Performance
        </Typography>

        {/* Overall Metrics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Overall Performance
          </Typography>
          
          <MetricBar 
            label="Accuracy" 
            value={modelMetrics.accuracy} 
            color="success"
            icon={<CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />}
          />
          <MetricBar 
            label="Precision" 
            value={modelMetrics.precision} 
            color="primary"
            icon={<Speed sx={{ fontSize: 16, color: 'primary.main' }} />}
          />
          <MetricBar 
            label="Recall" 
            value={modelMetrics.recall} 
            color="info"
            icon={<TrendingUp sx={{ fontSize: 16, color: 'info.main' }} />}
          />
          <MetricBar 
            label="F1-Score" 
            value={modelMetrics.f1Score} 
            color="warning"
            icon={<Psychology sx={{ fontSize: 16, color: 'warning.main' }} />}
          />
        </Box>

        {/* Model Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Active Models
          </Typography>
          <Stack spacing={1}>
            {modelStatus.map((model, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={model.status} 
                    color={model.color} 
                    size="small" 
                    sx={{ mr: 1, minWidth: 60 }}
                  />
                  <Typography variant="body2">
                    {model.name}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {model.accuracy}%
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Recent Performance */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Recent Detection Performance
          </Typography>
          <Stack spacing={1}>
            {recentPerformance.map((period, index) => (
              <Card key={index} variant="outlined" sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {period.period}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {period.accuracy}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Detected: {period.detected}
                  </Typography>
                  <Typography variant="caption" color="error.main">
                    False Positives: {period.falsePositives}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ModelPerformance;