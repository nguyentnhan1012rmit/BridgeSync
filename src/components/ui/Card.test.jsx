import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card from './Card';

describe('Card component', () => {
  it('renders children', () => {
    render(<Card>Hello Card</Card>);
    expect(screen.getByText('Hello Card')).toBeInTheDocument();
  });

  it('applies default md padding class', () => {
    const { container } = render(<Card>content</Card>);
    expect(container.firstChild.className).toContain('p-5');
  });

  it('applies custom padding sizes', () => {
    const { container } = render(<Card padding="sm">content</Card>);
    expect(container.firstChild.className).toContain('p-4');
  });

  it('applies hover class when hover prop is true', () => {
    const { container } = render(<Card hover>content</Card>);
    expect(container.firstChild.className).toContain('stat-card');
    expect(container.firstChild.className).toContain('cursor-pointer');
  });

  it('does not apply hover class by default', () => {
    const { container } = render(<Card>content</Card>);
    expect(container.firstChild.className).not.toContain('stat-card');
  });

  it('passes through additional classNames', () => {
    const { container } = render(<Card className="extra-class">content</Card>);
    expect(container.firstChild.className).toContain('extra-class');
  });
});
