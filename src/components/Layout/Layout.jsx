import React from 'react';
import { Box } from '@mui/material';
import { useSidebar } from '../ui/sidebar';

const Layout = ({ children }) => {
  const { expanded } = useSidebar();
  
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        position: 'relative',
        className: expanded ? 'sidebar-expanded' : 'sidebar-collapsed'
      }}
    >
      {children}
    </Box>
  );
};

export default Layout;