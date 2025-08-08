import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    const testText = 'Loading data...';
    render(<LoadingSpinner text={testText} />);
    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    let spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="medium" />);
    spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('w-8', 'h-8');

    rerender(<LoadingSpinner size="large" />);
    spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('w-12', 'h-12');

    rerender(<LoadingSpinner size="xlarge" />);
    spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('w-16', 'h-16');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<LoadingSpinner variant="primary" />);
    let spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('border-primary-500');

    rerender(<LoadingSpinner variant="success" />);
    spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('border-success-500');

    rerender(<LoadingSpinner variant="warning" />);
    spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('border-warning-500');

    rerender(<LoadingSpinner variant="danger" />);
    spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('border-danger-500');
  });

  it('renders fullscreen overlay', () => {
    render(<LoadingSpinner fullScreen={true} />);
    const overlay = screen.getByRole('status', { hidden: true }).parentElement;
    expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50');
  });

  it('renders overlay mode', () => {
    render(<LoadingSpinner overlay={true} />);
    const overlay = screen.getByRole('status', { hidden: true }).parentElement;
    expect(overlay).toHaveClass('absolute', 'inset-0', 'z-10');
  });

  it('applies correct animation classes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('animate-spin');
  });

  it('has correct border styling', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('border-2', 'border-gray-200', 'border-t-transparent');
  });
});
