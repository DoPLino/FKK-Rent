import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import LoadingSpinner from '../Common/LoadingSpinner';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Close sidebar on mobile when screen size changes
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, sidebarOpen]);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuToggle={handleMenuToggle} />
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner 
                size="large" 
                text="Loading..." 
                variant="primary"
              />
            </div>
          ) : (
            <div className="p-4 lg:p-6">
              <Outlet />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Layout;