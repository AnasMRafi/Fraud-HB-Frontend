import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChevronLeft, Menu } from 'lucide-react';

// ========== Utility function ==========
const cn = (...classes) => classes.filter(Boolean).join(' ');

// ========== Sidebar Context ==========
const SidebarContext = createContext({
  expanded: true,
  setExpanded: () => {},
});

// ========== Sidebar Provider ==========
export const SidebarProvider = ({ children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    const EXPANDED_WIDTH = '280px';
    const COLLAPSED_WIDTH = '80px';
    
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH
    );
  }, [expanded]);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      <div className="relative min-h-screen bg-gray-50">
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

// Hook to use sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// ========== Sidebar Component ==========
export const Sidebar = ({ className, children }) => {
  const { expanded, setExpanded } = useSidebar();

  const EXPANDED_WIDTH = 280;
  const COLLAPSED_WIDTH = 80;

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full z-40 flex flex-col bg-white transition-all duration-300 ease-in-out shadow-lg',
        'border-r border-gray-200',
        className
      )}
      style={{
        width: expanded ? `${EXPANDED_WIDTH}px` : `${COLLAPSED_WIDTH}px`,
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="absolute -right-3 top-9 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
      >
        {expanded ? (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        ) : (
          <Menu className="h-4 w-4 text-gray-600" />
        )}
      </button>
      {children}
    </aside>
  );
};

// ========== Sidebar Components ==========
export const SidebarHeader = ({ children }) => {
  const { expanded } = useSidebar();
  
  return (
    <div className="flex items-center h-16 px-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">FDS</span>
        </div>
        {expanded && (
          <span className="font-semibold text-gray-900 whitespace-nowrap">
            Fraud Detection System
          </span>
        )}
      </div>
    </div>
  );
};

export const SidebarContent = ({ className, children }) => {
  return (
    <div className={cn('flex-1 overflow-y-auto py-4', className)}>
      {children}
    </div>
  );
};

export const SidebarGroup = ({ className, children }) => {
  return (
    <div className={cn('mb-2', className)}>
      {children}
    </div>
  );
};

export const SidebarGroupLabel = ({ className, children }) => {
  const { expanded } = useSidebar();
  
  if (!expanded) return null;
  
  return (
    <div className={cn('px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide', className)}>
      {children}
    </div>
  );
};

export const SidebarGroupContent = ({ className, children }) => {
  return (
    <div className={cn('space-y-1', className)}>
      {children}
    </div>
  );
};

export const SidebarMenu = ({ className, children }) => {
  return (
    <nav className={cn('px-2', className)}>
      {children}
    </nav>
  );
};

export const SidebarMenuItem = ({ className, children }) => {
  return (
    <div className={cn('mb-2 px-1', className)}>
      {children}
    </div>
  );
};

export const SidebarMenuButton = ({ 
  className, 
  children, 
  isActive = false, 
  asChild = false, 
  ...props 
}) => {
  const { expanded } = useSidebar();
  
  const baseClasses = cn(
    'w-full flex items-center text-sm font-medium transition-all duration-300 ease-out',
    'rounded-lg group relative transform',
    
    // Base padding - smaller default
    expanded ? 'px-2 py-2 gap-3' : 'px-0 py-4 justify-center gap-0',
    
    // Active state - significantly larger padding and visual effects
    isActive && expanded && 'px-6 py-4 scale-[1.02] shadow-lg',
    isActive && !expanded && 'py-4 scale-105',
    isActive && 'bg-blue-600 text-white shadow-md',
    
    // Hover state - noticeable padding increase and effects (only when not active)
    !isActive && expanded && 'hover:px-5 hover:py-3.5 hover:scale-[1.01] hover:shadow-md',
    !isActive && !expanded && 'hover:py-4 hover:scale-105',
    !isActive && 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    
    // Border for visual feedback
    isActive && 'border-2 border-blue-500',
    !isActive && 'border-2 border-transparent hover:border-gray-200',
    
    className
  );

  if (asChild) {
    // When asChild is true, we expect children to be a link element
    // We'll clone it and add our classes
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      className: baseClasses,
      ...props
    });
  }

  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
};