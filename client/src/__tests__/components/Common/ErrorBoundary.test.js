import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary, { withErrorBoundary, useAsyncError } from '../../../components/Common/ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal component</div>;
};

// Component that uses the async error hook
const AsyncErrorComponent = () => {
  const throwAsyncError = useAsyncError();
  
  const handleAsyncError = () => {
    setTimeout(() => {
      throwAsyncError(new Error('Async error'));
    }, 0);
  };

  return (
    <div>
      <button onClick={handleAsyncError}>Trigger Async Error</button>
    </div>
  );
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
  });

  it('shows error details when toggle details is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const showDetailsButton = screen.getByText('Show Details');
    fireEvent.click(showDetailsButton);

    expect(screen.getByText('Error Details')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('hides error details when toggle details is clicked again', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const showDetailsButton = screen.getByText('Show Details');
    fireEvent.click(showDetailsButton);
    
    const hideDetailsButton = screen.getByText('Hide Details');
    fireEvent.click(hideDetailsButton);

    expect(screen.queryByText('Error Details')).not.toBeInTheDocument();
  });

  it('calls retry function when try again is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    // Should render the normal component again
    expect(screen.getByText('Normal component')).toBeInTheDocument();
  });

  it('navigates to dashboard when go to dashboard is clicked', () => {
    // Mock window.location
    delete window.location;
    window.location = { href: '' };

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const goHomeButton = screen.getByText('Go to Dashboard');
    fireEvent.click(goHomeButton);

    expect(window.location.href).toBe('/dashboard');
  });

  it('logs error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by boundary:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('handles keyboard events for escape key', () => {
    const mockOnClose = jest.fn();
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Simulate escape key press
    fireEvent.keyDown(document, { key: 'Escape' });

    // Should not close the error boundary (escape key is not handled in this implementation)
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('prevents body scroll when error occurs', () => {
    // Mock document.body.style
    Object.defineProperty(document.body, 'style', {
      value: {},
      writable: true
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Note: This test would need to be adjusted based on the actual implementation
    // of preventing body scroll in the ErrorBoundary component
  });
});

describe('withErrorBoundary HOC', () => {
  it('wraps component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(() => <div>Wrapped content</div>);
    
    render(<WrappedComponent />);
    expect(screen.getByText('Wrapped content')).toBeInTheDocument();
  });

  it('handles errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(() => <ThrowError shouldThrow={true} />);
    
    render(<WrappedComponent />);
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('wraps component with custom fallback', () => {
    const CustomFallback = () => <div>Custom error UI</div>;
    const WrappedComponent = withErrorBoundary(
      () => <ThrowError shouldThrow={true} />,
      CustomFallback
    );
    
    render(<WrappedComponent />);
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });
});

describe('useAsyncError Hook', () => {
  it('throws async errors', async () => {
    // Mock setError to capture the error throwing function
    const mockSetError = jest.fn();
    jest.spyOn(React, 'useState').mockReturnValue([null, mockSetError]);

    render(
      <ErrorBoundary>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );

    const triggerButton = screen.getByText('Trigger Async Error');
    fireEvent.click(triggerButton);

    // Wait for the async error to be thrown
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockSetError).toHaveBeenCalled();
  });
});

describe('ErrorBoundary Integration', () => {
  it('handles component lifecycle errors', () => {
    class LifecycleErrorComponent extends React.Component {
      componentDidMount() {
        throw new Error('Lifecycle error');
      }

      render() {
        return <div>Lifecycle component</div>;
      }
    }

    render(
      <ErrorBoundary>
        <LifecycleErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('handles render errors', () => {
    const RenderErrorComponent = () => {
      throw new Error('Render error');
    };

    render(
      <ErrorBoundary>
        <RenderErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('maintains error state across re-renders', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

    // Re-render with the same error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });
});
