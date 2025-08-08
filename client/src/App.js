import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg, #363636)',
                    color: 'var(--toast-color, #fff)',
                    border: '1px solid var(--toast-border, #4a4a4a)',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  );
}

export default App;
