import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders primary variant by default', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('bg-purple-600', 'text-white');
  });

  it('renders teal variant correctly', () => {
    render(<Button variant="teal">Save milestone</Button>);
    const btn = screen.getByRole('button', { name: /save milestone/i });
    expect(btn).toHaveClass('bg-teal-500', 'text-ink');
  });

  it('renders outline variant correctly', () => {
    render(<Button variant="outline">Cancel</Button>);
    const btn = screen.getByRole('button', { name: /cancel/i });
    expect(btn).toHaveClass('bg-white', 'border-purple-600', 'text-purple-600');
  });

  it('renders disabled state and prevents click handler', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );
    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('handles click events when enabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Action</Button>);
    const btn = screen.getByRole('button', { name: /action/i });
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
