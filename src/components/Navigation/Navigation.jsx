import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Warning as AlertIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  AccountCircle,
  NotificationsActive,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/alerts', label: 'Alerts', icon: <AlertIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static" sx={{ bgcolor: 'white', color: '#111416', boxShadow: 1 }}>
      <Toolbar>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <SecurityIcon sx={{ mr: 1, color: '#1976d2' }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#111416',
              fontSize: '18px',
            }}
          >
            WafaCash CD01 Fraud Detection
          </Typography>
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                color: isActive(item.path) ? '#1976d2' : '#666',
                bgcolor: isActive(item.path) ? '#f0f7ff' : 'transparent',
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                '&:hover': {
                  bgcolor: '#f0f7ff',
                  color: '#1976d2',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Status Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<NotificationsActive />}
            label="Real-time Active"
            color="success"
            variant="outlined"
            size="small"
          />
          
          {/* Profile Menu */}
          <IconButton
            size="large"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
              A
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleMenuClose}>
            <AccountCircle sx={{ mr: 1 }} />
            Admin User
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;