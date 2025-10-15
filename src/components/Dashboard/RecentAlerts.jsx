import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

const getPriorityIcon = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'critique':
      return <Error color="error" />;
    case 'élevée':
      return <Warning color="warning" />;
    case 'moyenne':
      return <Info color="info" />;
    default:
      return <CheckCircle color="success" />;
  }
};

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'critique':
      return 'error';
    case 'élevée':
      return 'warning';
    case 'moyenne':
      return 'info';
    default:
      return 'success';
  }
};

const RecentAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRecentAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getAlerts({ 
        per_page: 10,
        status: 'nouveau' 
      });
      
      setAlerts(response.data.data.alerts || []);
    } catch (err) {
      console.error('Error fetching recent alerts:', err);
      setError('Failed to load recent alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentAlerts();
  }, []);

  const handleViewAllAlerts = () => {
    navigate('/alerts');
  };

  const formatAmount = (amount) => {
    if (!amount) return '0 MAD';
    return `${Number(amount).toLocaleString()} MAD`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Recent Fraud Alerts
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Recent Fraud Alerts
          </Typography>
          <Alert severity="error" action={
            <IconButton size="small" onClick={fetchRecentAlerts}>
              <Refresh />
            </IconButton>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Recent Fraud Alerts
          </Typography>
          <Button 
            size="small" 
            onClick={handleViewAllAlerts}
            endIcon={<Visibility />}
          >
            View All
          </Button>
        </Box>

        {alerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircle color="success" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No recent fraud alerts
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {alerts.map((alert, index) => (
              <ListItem
                key={alert.alert_id || index}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <Box sx={{ mr: 1 }}>
                  {getPriorityIcon(alert.priorite)}
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Account: {alert.numero_compte}
                      </Typography>
                      <Chip 
                        label={alert.priorite || 'UNKNOWN'} 
                        color={getPriorityColor(alert.priorite)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        Amount: {formatAmount(alert.montant_recent)}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Risk Score: {alert.score_risque}%
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {formatDate(alert.created_at)}
                      </Typography>
                      {alert.scenario_fraude && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {alert.scenario_fraude}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={fetchRecentAlerts}
            startIcon={<Refresh />}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentAlerts;