import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, AlertCircle, RefreshCw, BarChart, Settings } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "../ui/sidebar";

// ========== Utility function ==========
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Navigation items with Lucide icons
const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
  { id: "transactions", label: "Transactions", icon: FileText, path: "/transactions" },
  { id: "alerts", label: "Alerts", icon: AlertCircle, path: "/alerts" },
  { id: "reactivations", label: "Reactivations", icon: RefreshCw, path: "/reactivations" },
  { id: "reports", label: "Reports", icon: BarChart, path: "/reports" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

const getSubtitle = (itemId) => {
  const subtitles = {
    dashboard: 'Real-time monitoring',
    transactions: 'View all transactions',
    alerts: 'Fraud notifications',
    reactivations: 'Account reactivations',
    reports: 'Analysis & insights',
    settings: 'System configuration'
  };
  return subtitles[itemId] || '';
};

export function AppSidebar() {
  const location = useLocation();
  const { expanded } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          {expanded && (
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <SidebarMenuItem key={item.id} className={!expanded && item.id === "dashboard" ? "mt-4" : ""}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.path} className="flex items-center gap-3 w-full ">
                        <IconComponent 
                          className={cn(
                            'flex-shrink-0',
                            expanded ? 'w-5 h-5' : 'w-7 h-7',
                            isActive ? 'text-white' : 'text-gray-500'
                          )}
                        />
                        {expanded && (
                          <div className="flex flex-col flex-1 min-w-0 text-left">
                            <span className={cn(
                              'font-medium truncate',
                              isActive ? 'text-white' : 'text-gray-700'
                            )}>
                              {item.label}
                            </span>
                            <span className={cn(
                              'text-xs truncate',
                              isActive ? 'text-blue-100' : 'text-gray-400'
                            )}>
                              {getSubtitle(item.id)}
                            </span>
                          </div>
                        )}
                        {!expanded && (
                          <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}