import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'primary', 
  text = '', 
  fullScreen = false,
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const variantClasses = {
    primary: 'border-primary-500',
    secondary: 'border-gray-500',
    success: 'border-success-500',
    warning: 'border-warning-500',
    danger: 'border-danger-500',
    white: 'border-white'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`animate-spin rounded-full border-2 border-gray-200 ${sizeClasses[size]} ${variantClasses[variant]} border-t-transparent`}></div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
        {spinner}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
