import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SidebarProvider } from './components/ui/sidebar';
import { AppSidebar } from './components/Sidebar/AppSidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions';
import Alerts from './pages/Alerts/Alerts';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Reactivations from './pages/Reactivations/Reactivations';
import './App.scss';

const theme = createTheme({
  palette: {
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <SidebarProvider>
          <div className="app-layout">
            <AppSidebar />
            <main 
              className="main-content-wrapper"
              style={{ 
                marginLeft: 'var(--sidebar-width, 280px)',
                width: 'calc(100% - var(--sidebar-width, 280px))',
                transition: 'all 300ms ease-in-out',
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div className="content-container" style={{ 
                height: '100vh',
                overflowY: 'auto',
                overflowX: 'hidden'
              }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reactivations" element={<Reactivations />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;