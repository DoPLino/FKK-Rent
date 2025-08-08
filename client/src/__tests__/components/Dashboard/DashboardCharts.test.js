import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardCharts from '../../../components/Dashboard/DashboardCharts';

describe('DashboardCharts', () => {
  const mockEquipmentStats = {
    total: 10,
    available: 5,
    checkedOut: 3,
    maintenance: 1,
    damaged: 1
  };

  const mockBookingStats = {
    total: 15,
    pending: 3,
    approved: 5,
    active: 4,
    completed: 2,
    cancelled: 1
  };

  const mockUserStats = {
    total: 8,
    active: 6,
    new: 2
  };

  const mockLocationStats = [
    { _id: 'Studio A', count: 5 },
    { _id: 'Studio B', count: 3 },
    { _id: 'Storage Room', count: 2 }
  ];

  const mockMonthlyTrends = [
    { _id: { year: 2024, month: 1 }, count: 5 },
    { _id: { year: 2024, month: 2 }, count: 8 },
    { _id: { year: 2024, month: 3 }, count: 12 }
  ];

  it('renders all chart components when data is provided', () => {
    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        bookingStats={mockBookingStats}
        userStats={mockUserStats}
        locationStats={mockLocationStats}
        monthlyTrends={mockMonthlyTrends}
      />
    );

    // Check if all chart titles are rendered
    expect(screen.getByText('Equipment Status')).toBeInTheDocument();
    expect(screen.getByText('Booking Trends')).toBeInTheDocument();
    expect(screen.getByText('Booking Status')).toBeInTheDocument();
    expect(screen.getByText('User Activity')).toBeInTheDocument();
    expect(screen.getByText('Location Distribution')).toBeInTheDocument();
  });

  it('renders equipment status chart with correct data', () => {
    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        bookingStats={mockBookingStats}
        userStats={mockUserStats}
        locationStats={mockLocationStats}
        monthlyTrends={mockMonthlyTrends}
      />
    );

    // Check equipment status values
    expect(screen.getByText('10 Total Items')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Checked Out')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Damaged')).toBeInTheDocument();

    // Check utilization rate
    expect(screen.getByText('50%')).toBeInTheDocument(); // (10-5)/10 * 100
  });

  it('renders booking status chart with correct data', () => {
    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        bookingStats={mockBookingStats}
        userStats={mockUserStats}
        locationStats={mockLocationStats}
        monthlyTrends={mockMonthlyTrends}
      />
    );

    // Check booking status values
    expect(screen.getByText('15 Total Bookings')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('renders user activity chart with correct data', () => {
    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        bookingStats={mockBookingStats}
        userStats={mockUserStats}
        locationStats={mockLocationStats}
        monthlyTrends={mockMonthlyTrends}
      />
    );

    // Check user activity values
    expect(screen.getByText('8 Total Users')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument(); // 6/8 * 100
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('New This Month')).toBeInTheDocument();
  });

  it('renders location distribution chart with correct data', () => {
    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        bookingStats={mockBookingStats}
        userStats={mockUserStats}
        locationStats={mockLocationStats}
        monthlyTrends={mockMonthlyTrends}
      />
    );

    // Check location data
    expect(screen.getByText('3 Locations')).toBeInTheDocument();
    expect(screen.getByText('Studio A')).toBeInTheDocument();
    expect(screen.getByText('Studio B')).toBeInTheDocument();
    expect(screen.getByText('Storage Room')).toBeInTheDocument();
  });

  it('renders booking trends chart with correct data', () => {
    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        bookingStats={mockBookingStats}
        userStats={mockUserStats}
        locationStats={mockLocationStats}
        monthlyTrends={mockMonthlyTrends}
      />
    );

    // Check booking trends
    expect(screen.getByText('Last 12 Months')).toBeInTheDocument();
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<DashboardCharts />);

    // Should not render any charts when no data is provided
    expect(screen.queryByText('Equipment Status')).not.toBeInTheDocument();
    expect(screen.queryByText('Booking Trends')).not.toBeInTheDocument();
    expect(screen.queryByText('Booking Status')).not.toBeInTheDocument();
    expect(screen.queryByText('User Activity')).not.toBeInTheDocument();
    expect(screen.queryByText('Location Distribution')).not.toBeInTheDocument();
  });

  it('handles partial data', () => {
    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        // Other stats are undefined
      />
    );

    // Should only render equipment status chart
    expect(screen.getByText('Equipment Status')).toBeInTheDocument();
    expect(screen.queryByText('Booking Trends')).not.toBeInTheDocument();
    expect(screen.queryByText('Booking Status')).not.toBeInTheDocument();
    expect(screen.queryByText('User Activity')).not.toBeInTheDocument();
    expect(screen.queryByText('Location Distribution')).not.toBeInTheDocument();
  });

  it('calculates utilization rate correctly', () => {
    const statsWithZeroTotal = { ...mockEquipmentStats, total: 0 };
    
    render(
      <DashboardCharts
        equipmentStats={statsWithZeroTotal}
        bookingStats={mockBookingStats}
        userStats={mockUserStats}
        locationStats={mockLocationStats}
        monthlyTrends={mockMonthlyTrends}
      />
    );

    // Should show 0% utilization when total is 0
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('calculates user activity rate correctly', () => {
    const statsWithZeroTotal = { ...mockUserStats, total: 0 };
    
    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        bookingStats={mockBookingStats}
        userStats={statsWithZeroTotal}
        locationStats={mockLocationStats}
        monthlyTrends={mockMonthlyTrends}
      />
    );

    // Should show 0% activity when total is 0
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('limits location display to top 5', () => {
    const manyLocations = [
      { _id: 'Location 1', count: 10 },
      { _id: 'Location 2', count: 8 },
      { _id: 'Location 3', count: 6 },
      { _id: 'Location 4', count: 4 },
      { _id: 'Location 5', count: 2 },
      { _id: 'Location 6', count: 1 }, // This should not be displayed
    ];

    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        bookingStats={mockBookingStats}
        userStats={mockUserStats}
        locationStats={manyLocations}
        monthlyTrends={mockMonthlyTrends}
      />
    );

    // Should only show top 5 locations
    expect(screen.getByText('Location 1')).toBeInTheDocument();
    expect(screen.getByText('Location 2')).toBeInTheDocument();
    expect(screen.getByText('Location 3')).toBeInTheDocument();
    expect(screen.getByText('Location 4')).toBeInTheDocument();
    expect(screen.getByText('Location 5')).toBeInTheDocument();
    expect(screen.queryByText('Location 6')).not.toBeInTheDocument();
  });

  it('handles empty monthly trends', () => {
    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        bookingStats={mockBookingStats}
        userStats={mockUserStats}
        locationStats={mockLocationStats}
        monthlyTrends={[]}
      />
    );

    // Should not render booking trends chart when no data
    expect(screen.queryByText('Booking Trends')).not.toBeInTheDocument();
  });

  it('handles empty location stats', () => {
    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        bookingStats={mockBookingStats}
        userStats={mockUserStats}
        locationStats={[]}
        monthlyTrends={mockMonthlyTrends}
      />
    );

    // Should not render location distribution chart when no data
    expect(screen.queryByText('Location Distribution')).not.toBeInTheDocument();
  });

  it('displays correct percentages for equipment status', () => {
    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        bookingStats={mockBookingStats}
        userStats={mockUserStats}
        locationStats={mockLocationStats}
        monthlyTrends={mockMonthlyTrends}
      />
    );

    // Check percentage calculations
    expect(screen.getByText('(50%)')).toBeInTheDocument(); // 5/10 * 100
    expect(screen.getByText('(30%)')).toBeInTheDocument(); // 3/10 * 100
    expect(screen.getByText('(10%)')).toBeInTheDocument(); // 1/10 * 100
  });

  it('displays correct percentages for booking status', () => {
    render(
      <DashboardCharts
        equipmentStats={mockEquipmentStats}
        bookingStats={mockBookingStats}
        userStats={mockUserStats}
        locationStats={mockLocationStats}
        monthlyTrends={mockMonthlyTrends}
      />
    );

    // Check percentage calculations for bookings
    expect(screen.getByText('20%')).toBeInTheDocument(); // 3/15 * 100
    expect(screen.getByText('33%')).toBeInTheDocument(); // 5/15 * 100
    expect(screen.getByText('27%')).toBeInTheDocument(); // 4/15 * 100
  });
});
