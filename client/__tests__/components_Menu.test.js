import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Menu from '../src/components/Menu';

describe('Menu', () => {
  const defaultProps = {
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Menu {...defaultProps} />);
  });

  it('renders button with correct text', () => {
    render(<Menu {...defaultProps} />);
    
    const button = screen.getByText('Play Tetris');
    expect(button).toBeInTheDocument();
  });

  it('renders button with correct CSS classes', () => {
    render(<Menu {...defaultProps} />);
    
    const button = screen.getByText('Play Tetris');
    expect(button).toHaveClass('Button');
  });

  it('renders menu container with correct CSS class', () => {
    render(<Menu {...defaultProps} />);
    
    const menuContainer = document.querySelector('.Menu');
    expect(menuContainer).toBeInTheDocument();
  });

  it('calls onClick function when button is clicked', () => {
    const onClick = jest.fn();
    render(<Menu onClick={onClick} />);
    
    const button = screen.getByText('Play Tetris');
    fireEvent.click(button);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick function multiple times when button is clicked multiple times', () => {
    const onClick = jest.fn();
    render(<Menu onClick={onClick} />);
    
    const button = screen.getByText('Play Tetris');
    
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('handles undefined onClick gracefully', () => {
    render(<Menu onClick={undefined} />);
    
    const button = screen.getByText('Play Tetris');
    expect(button).toBeInTheDocument();
    
    // Should not crash when clicked
    fireEvent.click(button);
  });

  it('handles null onClick gracefully', () => {
    render(<Menu onClick={null} />);
    
    const button = screen.getByText('Play Tetris');
    expect(button).toBeInTheDocument();
    
    // Should not crash when clicked
    fireEvent.click(button);
  });

  it('handles missing onClick prop gracefully', () => {
    render(<Menu />);
    
    const button = screen.getByText('Play Tetris');
    expect(button).toBeInTheDocument();
    
    // Should not crash when clicked
    fireEvent.click(button);
  });

  it('renders button as button element', () => {
    render(<Menu {...defaultProps} />);
    
    const button = screen.getByText('Play Tetris');
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders with custom onClick function', () => {
    const customOnClick = jest.fn();
    render(<Menu onClick={customOnClick} />);
    
    const button = screen.getByText('Play Tetris');
    fireEvent.click(button);
    
    expect(customOnClick).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it('renders with different onClick functions', () => {
    const onClick1 = jest.fn();
    const onClick2 = jest.fn();
    
    const { rerender } = render(<Menu onClick={onClick1} />);
    
    const button = screen.getByText('Play Tetris');
    fireEvent.click(button);
    expect(onClick1).toHaveBeenCalledTimes(1);
    
    rerender(<Menu onClick={onClick2} />);
    fireEvent.click(button);
    expect(onClick2).toHaveBeenCalledTimes(1);
    expect(onClick1).toHaveBeenCalledTimes(1); // Should not change
  });

  it('renders button with correct accessibility attributes', () => {
    render(<Menu {...defaultProps} />);
    
    const button = screen.getByText('Play Tetris');
    expect(button).toBeInTheDocument();
    expect(button.type).toBe('button');
  });

  it('renders button that can be focused', () => {
    render(<Menu {...defaultProps} />);
    
    const button = screen.getByText('Play Tetris');
    button.focus();
    
    expect(button).toHaveFocus();
  });

  it('renders button that responds to keyboard events', () => {
    const onClick = jest.fn();
    render(<Menu onClick={onClick} />);
    
    const button = screen.getByText('Play Tetris');
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
