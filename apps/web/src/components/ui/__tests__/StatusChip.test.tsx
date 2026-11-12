import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusChip } from '../StatusChip';

describe('StatusChip Component', () => {
  it('renders success variants with green colors', () => {
    const { rerender } = render(<StatusChip status="attended" />);
    expect(screen.getByText('attended')).toHaveClass('bg-success-bg', 'text-success');

    rerender(<StatusChip status="paid" />);
    expect(screen.getByText('paid')).toHaveClass('bg-success-bg', 'text-success');

    rerender(<StatusChip status="active" />);
    expect(screen.getByText('active')).toHaveClass('bg-success-bg', 'text-success');

    rerender(<StatusChip status="present" />);
    expect(screen.getByText('present')).toHaveClass('bg-success-bg', 'text-success');

    rerender(<StatusChip status="approved" />);
    expect(screen.getByText('approved')).toHaveClass('bg-success-bg', 'text-success');
  });

  it('renders scheduled and on-leave variants with purple colors', () => {
    const { rerender } = render(<StatusChip status="scheduled" />);
    expect(screen.getByText('scheduled')).toHaveClass('bg-purple-100', 'text-purple-800');

    rerender(<StatusChip status="on-leave" />);
    expect(screen.getByText('on-leave')).toHaveClass('bg-purple-100', 'text-purple-800');
  });

  it('renders pending and late variants with warning colors', () => {
    const { rerender } = render(<StatusChip status="pending" />);
    expect(screen.getByText('pending')).toHaveClass('bg-warning-bg', 'text-warning');

    rerender(<StatusChip status="late" />);
    expect(screen.getByText('late')).toHaveClass('bg-warning-bg', 'text-warning');
  });

  it('renders cancelled and overdue variants with danger colors', () => {
    const { rerender } = render(<StatusChip status="cancelled" />);
    expect(screen.getByText('cancelled')).toHaveClass('bg-danger-bg', 'text-danger');

    rerender(<StatusChip status="overdue" />);
    expect(screen.getByText('overdue')).toHaveClass('bg-danger-bg', 'text-danger');
  });

  it('renders advance variant with teal colors', () => {
    render(<StatusChip status="advance" />);
    expect(screen.getByText('advance')).toHaveClass('bg-teal-50', 'text-teal-700');
  });

  it('supports custom label prop', () => {
    render(<StatusChip status="on_leave" label="On Leave" />);
    expect(screen.getByText('On Leave')).toBeInTheDocument();
  });
});
