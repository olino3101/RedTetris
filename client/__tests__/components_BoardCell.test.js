import React from 'react';
import { render, screen } from '@testing-library/react';
import BoardCell from '../src/components/BoardCell';

describe('BoardCell', () => {
  it('renders without crashing', () => {
    const cell = { occupied: false, className: '' };
    render(<BoardCell cell={cell} />);
  });

  it('renders with default cell properties', () => {
    const cell = { occupied: false, className: '' };
    render(<BoardCell cell={cell} />);

    const cellElement = document.querySelector('.BoardCell');
    expect(cellElement).toBeInTheDocument();
    expect(cellElement).toHaveClass('BoardCell');
  });

  it('renders with custom className', () => {
    const cell = { occupied: true, className: 'tetromino__i' };
    render(<BoardCell cell={cell} />);

    const cellElement = document.querySelector('.BoardCell');
    expect(cellElement).toHaveClass('tetromino__i');
  });

  it('renders with multiple class names', () => {
    const cell = { occupied: true, className: 'tetromino__i ghost' };
    render(<BoardCell cell={cell} />);

    const cellElement = document.querySelector('.BoardCell');
    expect(cellElement).toHaveClass('tetromino__i');
    expect(cellElement).toHaveClass('ghost');
  });

  it('renders with empty className', () => {
    const cell = { occupied: false, className: '' };
    render(<BoardCell cell={cell} />);

    const cellElement = document.querySelector('.BoardCell');
    expect(cellElement).toHaveClass('BoardCell');
  });

  it('renders with indestructible className', () => {
    const cell = { occupied: true, className: 'indestructible' };
    render(<BoardCell cell={cell} />);

    const cellElement = document.querySelector('.BoardCell');
    expect(cellElement).toHaveClass('indestructible');
  });

  it('renders with tetromino class names', () => {
    const tetrominoTypes = ['tetromino__i', 'tetromino__o', 'tetromino__t', 'tetromino__s', 'tetromino__z', 'tetromino__j', 'tetromino__l'];

    tetrominoTypes.forEach(className => {
      const cell = { occupied: true, className };
      const { unmount } = render(<BoardCell cell={cell} />);

      const cellElement = document.querySelector('.BoardCell');
      expect(cellElement).toHaveClass(className);

      unmount();
    });
  });

  it('renders Sparkle element', () => {
    const cell = { occupied: false, className: '' };
    render(<BoardCell cell={cell} />);

    const sparkleElement = document.querySelector('.Sparkle');
    expect(sparkleElement).toBeInTheDocument();
  });

  it('renders Sparkle element for all cell types', () => {
    const testCells = [
      { occupied: false, className: '' },
      { occupied: true, className: 'tetromino__i' },
      { occupied: true, className: 'indestructible' },
      { occupied: true, className: 'ghost' }
    ];

    testCells.forEach(cell => {
      const { unmount } = render(<BoardCell cell={cell} />);

      const sparkleElement = document.querySelector('.Sparkle');
      expect(sparkleElement).toBeInTheDocument();

      unmount();
    });
  });

  it('handles cell with missing properties gracefully', () => {
    const cell = {};
    render(<BoardCell cell={cell} />);

    const cellElement = document.querySelector('.BoardCell');
    expect(cellElement).toBeInTheDocument();
  });

  it('renders with complex className combinations', () => {
    const cell = { occupied: true, className: 'tetromino__i ghost tetromino__i__active' };
    render(<BoardCell cell={cell} />);

    const cellElement = document.querySelector('.BoardCell');
    expect(cellElement).toHaveClass('tetromino__i');
    expect(cellElement).toHaveClass('ghost');
    expect(cellElement).toHaveClass('tetromino__i__active');
  });
});
