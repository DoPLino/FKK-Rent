import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmptyState, { EquipmentEmptyState, BookingsEmptyState, SearchEmptyState } from '../../../components/Common/EmptyState';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('EmptyState', () => {
  it('renders with default props', () => {
    render(<EmptyState />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument();
  });

  it('renders with custom title and description', () => {
    const customTitle = 'Custom Title';
    const customDescription = 'Custom description text';
    
    render(<EmptyState title={customTitle} description={customDescription} />);
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it('renders with different types', () => {
    const { rerender } = render(<EmptyState type="equipment" />);
    expect(screen.getByTestId('equipment-icon')).toBeInTheDocument();

    rerender(<EmptyState type="bookings" />);
    expect(screen.getByTestId('bookings-icon')).toBeInTheDocument();

    rerender(<EmptyState type="users" />);
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<EmptyState size="small" />);
    let icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('w-12', 'h-12');

    rerender(<EmptyState size="medium" />);
    icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('w-16', 'h-16');

    rerender(<EmptyState size="large" />);
    icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('w-24', 'h-24');
  });

  it('renders link action', () => {
    const action = {
      type: 'link',
      href: '/test',
      text: 'Go to Test',
      icon: 'PlusIcon'
    };

    renderWithRouter(<EmptyState action={action} />);
    const link = screen.getByRole('link', { name: /go to test/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renders button action', () => {
    const mockOnClick = jest.fn();
    const action = {
      type: 'button',
      text: 'Click Me',
      onClick: mockOnClick,
      icon: 'PlusIcon'
    };

    render(<EmptyState action={action} />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action when not provided', () => {
    render(<EmptyState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('EquipmentEmptyState', () => {
  it('renders with default action', () => {
    renderWithRouter(<EquipmentEmptyState />);
    expect(screen.getByText('No equipment found')).toBeInTheDocument();
    expect(screen.getByText('Get started by adding your first piece of equipment to the inventory.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /add equipment/i })).toBeInTheDocument();
  });

  it('renders with custom action', () => {
    const customAction = {
      type: 'link',
      href: '/custom',
      text: 'Custom Action',
      icon: 'PlusIcon'
    };

    renderWithRouter(<EquipmentEmptyState action={customAction} />);
    expect(screen.getByRole('link', { name: /custom action/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /custom action/i })).toHaveAttribute('href', '/custom');
  });
});

describe('BookingsEmptyState', () => {
  it('renders with default action', () => {
    renderWithRouter(<BookingsEmptyState />);
    expect(screen.getByText('No bookings found')).toBeInTheDocument();
    expect(screen.getByText('Create your first booking to start managing equipment reservations.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create booking/i })).toBeInTheDocument();
  });

  it('renders with custom action', () => {
    const customAction = {
      type: 'button',
      text: 'Custom Booking Action',
      onClick: jest.fn(),
      icon: 'PlusIcon'
    };

    render(<BookingsEmptyState action={customAction} />);
    expect(screen.getByRole('button', { name: /custom booking action/i })).toBeInTheDocument();
  });
});

describe('SearchEmptyState', () => {
  it('renders with search term', () => {
    const searchTerm = 'camera';
    render(<SearchEmptyState searchTerm={searchTerm} />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText(/no items found matching "camera"/i)).toBeInTheDocument();
  });

  it('renders clear search button', () => {
    const searchTerm = 'test';
    render(<SearchEmptyState searchTerm={searchTerm} />);
    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('calls window.location.reload when clear search is clicked', () => {
    const originalReload = window.location.reload;
    window.location.reload = jest.fn();

    const searchTerm = 'test';
    render(<SearchEmptyState searchTerm={searchTerm} />);
    
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);
    
    expect(window.location.reload).toHaveBeenCalledTimes(1);
    
    window.location.reload = originalReload;
  });
});
