import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard } from '../StatCard';

describe('StatCard Component', () => {
  it('renders label, value, and helper line correctly', () => {
    render(
      <StatCard
        label="Today's Sessions"
        value={24}
        helper="4 more than yesterday"
      />,
    );

    expect(screen.getByText("Today's Sessions")).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('4 more than yesterday')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading prop is true', () => {
    render(
      <StatCard
        label="Revenue"
        value="₹45,000"
        loading={true}
      />,
    );

    expect(screen.queryByText('Revenue')).not.toBeInTheDocument();
    expect(screen.queryByText('₹45,000')).not.toBeInTheDocument();
    expect(screen.getByTestId('stat-card-skeleton')).toBeInTheDocument();
  });
});
