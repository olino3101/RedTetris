import React from 'react';
import { render, screen } from '@testing-library/react';
import GameStats from '../src/components/GameStats';

describe('GameStats', () => {
  const defaultGameStats = {
    level: 1,
    points: 0,
    linesCompleted: 0,
    linesPerLevel: 10
  };

  it('renders without crashing', () => {
    render(<GameStats gameStats={defaultGameStats} />);
  });

  it('renders all required stats elements', () => {
    render(<GameStats gameStats={defaultGameStats} />);
    
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Lines to level')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('calculates lines to level correctly', () => {
    const gameStats = {
      level: 1,
      points: 0,
      linesCompleted: 3,
      linesPerLevel: 10
    };
    
    render(<GameStats gameStats={gameStats} />);
    
    expect(screen.getByText('7')).toBeInTheDocument(); // 10 - 3 = 7
  });

  it('handles level 1 with no lines completed', () => {
    const gameStats = {
      level: 1,
      points: 0,
      linesCompleted: 0,
      linesPerLevel: 10
    };
    
    render(<GameStats gameStats={gameStats} />);
    
    expect(screen.getByText('10')).toBeInTheDocument(); // 10 - 0 = 10
  });

  it('handles level 1 with some lines completed', () => {
    const gameStats = {
      level: 1,
      points: 200,
      linesCompleted: 5,
      linesPerLevel: 10
    };
    
    render(<GameStats gameStats={gameStats} />);
    
    expect(screen.getByText('5')).toBeInTheDocument(); // 10 - 5 = 5
  });

  it('handles level 2 with lines completed', () => {
    const gameStats = {
      level: 2,
      points: 500,
      linesCompleted: 3,
      linesPerLevel: 10
    };
    
    render(<GameStats gameStats={gameStats} />);
    
    expect(screen.getByText('7')).toBeInTheDocument(); // 10 - 3 = 7
  });

  it('handles high level with high points', () => {
    const gameStats = {
      level: 10,
      points: 5000,
      linesCompleted: 8,
      linesPerLevel: 10
    };
    
    render(<GameStats gameStats={gameStats} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 10 - 8 = 2
  });

  it('handles edge case of all lines completed in level', () => {
    const gameStats = {
      level: 3,
      points: 1500,
      linesCompleted: 10,
      linesPerLevel: 10
    };
    
    render(<GameStats gameStats={gameStats} />);
    
    expect(screen.getByText('0')).toBeInTheDocument(); // 10 - 10 = 0
  });

  it('handles custom lines per level', () => {
    const gameStats = {
      level: 1,
      points: 0,
      linesCompleted: 2,
      linesPerLevel: 15
    };
    
    render(<GameStats gameStats={gameStats} />);
    
    expect(screen.getByText('13')).toBeInTheDocument(); // 15 - 2 = 13
  });

  it('handles zero points', () => {
    const gameStats = {
      level: 1,
      points: 0,
      linesCompleted: 0,
      linesPerLevel: 10
    };
    
    render(<GameStats gameStats={gameStats} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles high points', () => {
    const gameStats = {
      level: 5,
      points: 10000,
      linesCompleted: 7,
      linesPerLevel: 10
    };
    
    render(<GameStats gameStats={gameStats} />);
    
    expect(screen.getByText('10000')).toBeInTheDocument();
  });

  it('renders with correct CSS classes', () => {
    render(<GameStats gameStats={defaultGameStats} />);
    
    const statsElement = document.querySelector('.GameStats');
    expect(statsElement).toBeInTheDocument();
    expect(statsElement).toHaveClass('GameStats__right');
  });

  it('renders as unordered list', () => {
    render(<GameStats gameStats={defaultGameStats} />);
    
    const listElement = document.querySelector('ul');
    expect(listElement).toBeInTheDocument();
    expect(listElement).toHaveClass('GameStats');
  });

  it('renders list items with correct structure', () => {
    render(<GameStats gameStats={defaultGameStats} />);
    
    const listItems = document.querySelectorAll('li');
    expect(listItems).toHaveLength(6);
    
    // Check that values have the 'value' class
    const valueElements = document.querySelectorAll('.value');
    expect(valueElements).toHaveLength(3);
  });

  it('handles undefined gameStats gracefully', () => {
    render(<GameStats gameStats={undefined} />);
    
    // Should handle gracefully without crashing
    expect(document.querySelector('.GameStats')).toBeInTheDocument();
  });

  it('handles null gameStats gracefully', () => {
    render(<GameStats gameStats={null} />);
    
    // Should handle gracefully without crashing
    expect(document.querySelector('.GameStats')).toBeInTheDocument();
  });

  it('handles missing properties gracefully', () => {
    const incompleteGameStats = {
      level: 1
      // Missing other properties
    };
    
    render(<GameStats gameStats={incompleteGameStats} />);
    
    // Should handle gracefully without crashing
    expect(document.querySelector('.GameStats')).toBeInTheDocument();
  });
});
