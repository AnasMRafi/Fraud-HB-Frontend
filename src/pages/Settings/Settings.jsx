import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  MenuItem,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save,
  Refresh,
  Security,
  NotificationsActive,
  Speed,
  Storage,
  Check,
  Close,
  RestartAlt,
  Email,
  Send,
} from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import * as api from '../../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [originalParams, setOriginalParams] = useState(null);
  const [defaultParams, setDefaultParams] = useState(null);
  
  // Current parameters state - will be loaded from default_parameters.json
  const [parameters, setParameters] = useState({});

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      setLoading(true);
      const response = await api.getAllParameters();
      
      if (response.data?.data) {
        const { current, defaults } = response.data.data;
        
        // Merge current parameters with defaults
        const mergedParams = mergeParameters(defaults, current);
        setParameters(mergedParams);
        setOriginalParams(JSON.parse(JSON.stringify(mergedParams)));
        setDefaultParams(defaults);
      }
    } catch (err) {
      console.error('Error fetching parameters:', err);
      setError('Failed to load parameters');
    } finally {
      setLoading(false);
    }
  };

  const mergeParameters = (defaults, current) => {
    // Deep merge function
    const merged = JSON.parse(JSON.stringify(defaults));
    
    if (current) {
      Object.keys(current).forEach(category => {
        if (merged[category]) {
          Object.keys(current[category]).forEach(param => {
            if (merged[category][param] !== undefined) {
              merged[category][param] = current[category][param];
            }
          });
        }
      });
    }
    
    // Add notification settings if not in defaults
    if (!merged.notification_settings) {
      merged.notification_settings = {
        enable_email: false,
        enable_sms: false,
        email_recipients: [],
        alert_priorities: ['ALL'],
        notification_hours: {
          start: '08:00',
          end: '20:00'
        },
        weekend_notifications: false
      };
    }
    
    return merged;
  };

  const handleSaveParameters = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Prepare parameters for batch update
      const updateParams = [];
      
      Object.keys(parameters).forEach(category => {
        const categoryParams = parameters[category];
        
        Object.keys(categoryParams).forEach(param => {
          // Skip nested objects
          if (typeof categoryParams[param] === 'object' && !Array.isArray(categoryParams[param])) {
            // Handle nested parameters
            if (param === 'ensemble_weights') {
              Object.keys(categoryParams[param]).forEach(subParam => {
                updateParams.push({
                  category: category,
                  name: `${param}_${subParam}`,
                  value: categoryParams[param][subParam]
                });
              });
            }
          } else {
            updateParams.push({
              category: category,
              name: param,
              value: categoryParams[param]
            });
          }
        });
      });
      
      const response = await api.updateBatchParameters({
        parameters: updateParams,
        updated_by: 'Admin',
        save_as_defaults: true // Save changes to default_parameters.json
      });
      
      if (response.data?.status === 'success') {
        setSuccess(true);
        setOriginalParams(JSON.parse(JSON.stringify(parameters)));
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving parameters:', err);
      setError('Failed to save parameters');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async (category = null, resetToOriginal = false) => {
    try {
      setSaving(true);
      
      const categories = category ? [category] : Object.keys(parameters);
      
      const response = await api.resetParametersToDefaults({
        categories: categories,
        updated_by: 'Admin',
        reset_to_original: resetToOriginal
      });
      
      if (response.data?.status === 'success') {
        // Refresh parameters from server after reset
        await fetchParameters();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error resetting parameters:', err);
      setError('Failed to reset parameters');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      const response = await api.testEmailNotification({ recipient: testEmail });
      if (response.data?.status === 'success') {
        setTestEmailDialog(false);
        setSuccess(true);
        setTestEmail('');
      } else {
        setError('Failed to send test email');
      }
    } catch (err) {
      console.error('Error sending test email:', err);
      setError('Failed to send test email');
    }
  };

  const handlePriorityToggle = (priority) => {
    setParameters(prev => {
      const current = prev.notification_settings.alert_priorities;
      
      if (priority === 'ALL') {
        // Toggle ALL
        if (current.includes('ALL')) {
          return {
            ...prev,
            notification_settings: {
              ...prev.notification_settings,
              alert_priorities: []
            }
          };
        } else {
          return {
            ...prev,
            notification_settings: {
              ...prev.notification_settings,
              alert_priorities: ['ALL']
            }
          };
        }
      } else {
        // Toggle individual priority
        let newPriorities = current.filter(p => p !== 'ALL');
        
        if (newPriorities.includes(priority)) {
          newPriorities = newPriorities.filter(p => p !== priority);
        } else {
          newPriorities.push(priority);
        }
        
        return {
          ...prev,
          notification_settings: {
            ...prev.notification_settings,
            alert_priorities: newPriorities
          }
        };
      }
    });
  };

  const renderSystemTab = () => {
    // Show loading if parameters aren't loaded yet
    if (!parameters.dormancy || !parameters.transaction_limits || !parameters.risk_thresholds) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security /> Fraud Detection Parameters
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => handleResetToDefaults('dormancy')}
              title="Reset to defaults"
            >
              <RestartAlt />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Dormancy Period (days)"
              type="number"
              value={parameters.dormancy.dormancy_period_days || 150}
              onChange={(e) => setParameters(prev => ({
                ...prev,
                dormancy: {
                  ...prev.dormancy,
                  dormancy_period_days: parseInt(e.target.value)
                }
              }))}
              helperText="Days of inactivity before account is considered dormant"
              fullWidth
            />
            
            <TextField
              label="Alert Threshold (days)"
              type="number"
              value={parameters.dormancy.alert_threshold_days || 150}
              onChange={(e) => setParameters(prev => ({
                ...prev,
                dormancy: {
                  ...prev.dormancy,
                  alert_threshold_days: parseInt(e.target.value)
                }
              }))}
              helperText="Days after which to generate high priority alerts"
              fullWidth
            />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Storage /> Transaction Limits
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => handleResetToDefaults('transaction_limits')}
              title="Reset to defaults"
            >
              <RestartAlt />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Maximum Withdrawal (MAD)"
              type="number"
              value={parameters.transaction_limits.withdrawal_max || 4000}
              onChange={(e) => setParameters(prev => ({
                ...prev,
                transaction_limits: {
                  ...prev.transaction_limits,
                  withdrawal_max: parseFloat(e.target.value)
                }
              }))}
              fullWidth
            />
            
            <TextField
              label="Maximum Deposit (MAD)"
              type="number"
              value={parameters.transaction_limits.deposit_max || 5000}
              onChange={(e) => setParameters(prev => ({
                ...prev,
                transaction_limits: {
                  ...prev.transaction_limits,
                  deposit_max: parseFloat(e.target.value)
                }
              }))}
              fullWidth
            />
            
            <TextField
              label="Daily Transaction Limit (MAD)"
              type="number"
              value={parameters.transaction_limits.daily_limit || 6000}
              onChange={(e) => setParameters(prev => ({
                ...prev,
                transaction_limits: {
                  ...prev.transaction_limits,
                  daily_limit: parseFloat(e.target.value)
                }
              }))}
              fullWidth
            />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Risk Score Thresholds
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            {Object.keys(parameters.risk_thresholds).map((level, index) => (
              <Grid item xs={12} sm={6} md={3} key={`risk-threshold-${level}-${index}`}>
                <TextField
                  label={`${level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')} Risk`}
                  type="number"
                  value={parameters.risk_thresholds[level]}
                  onChange={(e) => setParameters(prev => ({
                    ...prev,
                    risk_thresholds: {
                      ...prev.risk_thresholds,
                      [level]: parseFloat(e.target.value)
                    }
                  }))}
                  InputProps={{ inputProps: { min: 0, max: 1, step: 0.05 } }}
                  fullWidth
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
    );
  };

  const renderNotificationTab = () => {
    // Show loading if notification settings aren't loaded yet
    if (!parameters.notification_settings) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActive /> Notification Settings
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={parameters.notification_settings.enable_email || false}
                      onChange={(e) => setParameters(prev => ({
                        ...prev,
                        notification_settings: {
                          ...prev.notification_settings,
                          enable_email: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Enable Email Notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={parameters.notification_settings.enable_sms || false}
                      onChange={(e) => setParameters(prev => ({
                        ...prev,
                        notification_settings: {
                          ...prev.notification_settings,
                          enable_sms: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Enable SMS Notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={parameters.notification_settings.weekend_notifications || false}
                      onChange={(e) => setParameters(prev => ({
                        ...prev,
                        notification_settings: {
                          ...prev.notification_settings,
                          weekend_notifications: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Send Weekend Notifications"
                />
                
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={() => setTestEmailDialog(true)}
                  disabled={!parameters.notification_settings.enable_email}
                >
                  Send Test Email
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Notification Start Time"
                  type="time"
                  value={parameters.notification_settings.notification_hours?.start || '08:00'}
                  onChange={(e) => setParameters(prev => ({
                    ...prev,
                    notification_settings: {
                      ...prev.notification_settings,
                      notification_hours: {
                        ...prev.notification_settings.notification_hours,
                        start: e.target.value
                      }
                    }
                  }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                
                <TextField
                  label="Notification End Time"
                  type="time"
                  value={parameters.notification_settings.notification_hours?.end || '20:00'}
                  onChange={(e) => setParameters(prev => ({
                    ...prev,
                    notification_settings: {
                      ...prev.notification_settings,
                      notification_hours: {
                        ...prev.notification_settings.notification_hours,
                        end: e.target.value
                      }
                    }
                  }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Alert Priority Levels for Notifications
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  key="priority-all"
                  label="ALL"
                  onClick={() => handlePriorityToggle('ALL')}
                  color={(parameters.notification_settings.alert_priorities || []).includes('ALL') ? 'primary' : 'default'}
                  icon={(parameters.notification_settings.alert_priorities || []).includes('ALL') ? <Check /> : null}
                />
                {['CRITIQUE', 'ÉLEVÉE', 'NORMALE', 'BASSE'].map((priority, index) => (
                  <Chip
                    key={`priority-${priority}-${index}`}
                    label={priority}
                    onClick={() => handlePriorityToggle(priority)}
                    color={
                      (parameters.notification_settings.alert_priorities || []).includes('ALL') ||
                      (parameters.notification_settings.alert_priorities || []).includes(priority) 
                        ? 'primary' : 'default'
                    }
                    icon={
                      (parameters.notification_settings.alert_priorities || []).includes('ALL') ||
                      (parameters.notification_settings.alert_priorities || []).includes(priority) 
                        ? <Check /> : null
                    }
                    disabled={(parameters.notification_settings.alert_priorities || []).includes('ALL')}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
    );
  };

  if (loading) {
    return (
      <Layout title="Settings" icon={SettingsIcon}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Settings" icon={SettingsIcon}>
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Settings saved successfully!
          </Alert>
        </Snackbar>
        
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="System Parameters" icon={<Security />} iconPosition="start" />
            <Tab label="Notifications" icon={<NotificationsActive />} iconPosition="start" />
          </Tabs>
        </Paper>
        
        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && renderSystemTab()}
          {activeTab === 1 && renderNotificationTab()}
        </Box>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            startIcon={<Refresh />}
            onClick={() => setParameters(originalParams || parameters)}
            variant="outlined"
            disabled={saving || JSON.stringify(parameters) === JSON.stringify(originalParams)}
          >
            Revert Changes
          </Button>
          <Button
            startIcon={<RestartAlt />}
            onClick={() => handleResetToDefaults()}
            variant="outlined"
            color="warning"
          >
            Reset to Current Defaults
          </Button>
          <Button
            startIcon={<RestartAlt />}
            onClick={() => handleResetToDefaults(null, true)}
            variant="outlined"
            color="error"
          >
            Reset to Factory Defaults
          </Button>
          <Button
            startIcon={<Save />}
            onClick={handleSaveParameters}
            variant="contained"
            disabled={saving || JSON.stringify(parameters) === JSON.stringify(originalParams)}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
        
        {/* Test Email Dialog */}
        <Dialog open={testEmailDialog} onClose={() => setTestEmailDialog(false)}>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogContent>
            <TextField
              label="Recipient Email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTestEmailDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleTestEmail} 
              variant="contained"
              startIcon={<Send />}
              disabled={!testEmail}
            >
              Send Test
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Settings;