import React, { useEffect, useRef } from 'react';
import { 
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Modal = ({ 
  isOpen, 
  onClose, 
  title = '', 
  children, 
  size = 'medium',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800',
    danger: 'bg-white dark:bg-gray-800 border-l-4 border-danger-500',
    warning: 'bg-white dark:bg-gray-800 border-l-4 border-warning-500',
    success: 'bg-white dark:bg-gray-800 border-l-4 border-success-500',
    info: 'bg-white dark:bg-gray-800 border-l-4 border-info-500'
  };

  const getVariantIcon = () => {
    switch (variant) {
      case 'danger':
        return ExclamationCircleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'success':
        return CheckCircleIcon;
      case 'info':
        return InformationCircleIcon;
      default:
        return null;
    }
  };

  const VariantIcon = getVariantIcon();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full">
          <div className={`${sizeClasses[size]} w-full`}>
            <div className={`${variantClasses[variant]} rounded-lg`}>
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    {VariantIcon && (
                      <VariantIcon className={`w-6 h-6 ${
                        variant === 'danger' ? 'text-danger-500' :
                        variant === 'warning' ? 'text-warning-500' :
                        variant === 'success' ? 'text-success-500' :
                        variant === 'info' ? 'text-info-500' : 'text-gray-400'
                      }`} />
                    )}
                    {title && (
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {title}
                      </h3>
                    )}
                  </div>
                  
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="px-6 py-4">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          button: 'btn-danger',
          icon: ExclamationCircleIcon
        };
      case 'warning':
        return {
          button: 'btn-warning',
          icon: ExclamationTriangleIcon
        };
      case 'success':
        return {
          button: 'btn-success',
          icon: CheckCircleIcon
        };
      default:
        return {
          button: 'btn-primary',
          icon: InformationCircleIcon
        };
    }
  };

  const { button, icon: Icon } = getVariantStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="small"
    >
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Icon className={`w-6 h-6 mt-0.5 ${
            variant === 'danger' ? 'text-danger-500' :
            variant === 'warning' ? 'text-warning-500' :
            variant === 'success' ? 'text-success-500' :
            'text-info-500'
          }`} />
          <p className="text-gray-700 dark:text-gray-300">
            {message}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-outline"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={button}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Alert Modal
export const AlertModal = ({ 
  isOpen, 
  onClose, 
  title = 'Alert',
  message = '',
  variant = 'info',
  buttonText = 'OK'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="small"
    >
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          {message}
        </p>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
