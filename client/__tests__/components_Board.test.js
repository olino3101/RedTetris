import React from 'react';
import { render, screen } from '@testing-library/react';
import Board from '../src/components/Board';

describe('Board', () => {
  const createMockBoard = (rows, columns) => ({
    size: { rows, columns },
    rows: Array(rows).fill(null).map(() =>
      Array(columns).fill(null).map(() => ({
        occupied: false,
        className: ''
      }))
    )
  });

  it('renders without crashing', () => {
    const board = createMockBoard(20, 10);
    render(<Board board={board} />);
  });

  it('renders with correct grid layout', () => {
    const board = createMockBoard(20, 10);
    render(<Board board={board} />);

    const boardElement = document.querySelector('.Board');
    expect(boardElement).toBeInTheDocument();
    expect(boardElement.style.gridTemplateRows).toBe('repeat(20, 1fr)');
    expect(boardElement.style.gridTemplateColumns).toBe('repeat(10, 1fr)');
  });

  it('renders correct number of BoardCell components', () => {
    const board = createMockBoard(20, 10);
    render(<Board board={board} />);

    const cells = document.querySelectorAll('.BoardCell');
    expect(cells).toHaveLength(200); // 20 * 10
  });

  it('renders BoardCell components with correct keys', () => {
    const board = createMockBoard(2, 2);
    render(<Board board={board} />);

    const cells = document.querySelectorAll('.BoardCell');
    expect(cells).toHaveLength(4);
  });

  it('handles different board sizes correctly', () => {
    const board = createMockBoard(15, 8);
    render(<Board board={board} />);

    const boardElement = document.querySelector('.Board');
    expect(boardElement.style.gridTemplateRows).toBe('repeat(15, 1fr)');
    expect(boardElement.style.gridTemplateColumns).toBe('repeat(8, 1fr)');

    const cells = document.querySelectorAll('.BoardCell');
    expect(cells).toHaveLength(120); // 15 * 8
  });

  it('renders BoardCell with correct cell data', () => {
    const board = createMockBoard(2, 2);
    // Set specific cell data
    board.rows[0][0] = { occupied: true, className: 'test-class' };
    board.rows[0][1] = { occupied: false, className: 'empty' };

    render(<Board board={board} />);

    const cells = document.querySelectorAll('.BoardCell');
    expect(cells[0]).toHaveClass('test-class');
    expect(cells[1]).toHaveClass('empty');
  });

  it('handles empty board gracefully', () => {
    const board = { size: { rows: 0, columns: 0 }, rows: [] };
    render(<Board board={board} />);

    const boardElement = document.querySelector('.Board');
    expect(boardElement).toBeInTheDocument();
    expect(boardElement.style.gridTemplateRows).toBe('repeat(0, 1fr)');
    expect(boardElement.style.gridTemplateColumns).toBe('repeat(0, 1fr)');
  });

  it('handles single row board', () => {
    const board = createMockBoard(1, 5);
    render(<Board board={board} />);

    const cells = document.querySelectorAll('.BoardCell');
    expect(cells).toHaveLength(5);
  });

  it('handles single column board', () => {
    const board = createMockBoard(5, 1);
    render(<Board board={board} />);

    const cells = document.querySelectorAll('.BoardCell');
    expect(cells).toHaveLength(5);
  });

  it('renders with custom cell data', () => {
    const board = {
      size: { rows: 2, columns: 2 },
      rows: [
        [
          { occupied: true, className: 'tetromino__i' },
          { occupied: false, className: '' }
        ],
        [
          { occupied: true, className: 'indestructible' },
          { occupied: true, className: 'tetromino__o' }
        ]
      ]
    };

    render(<Board board={board} />);

    const cells = document.querySelectorAll('.BoardCell');
    expect(cells[0]).toHaveClass('tetromino__i');
    expect(cells[2]).toHaveClass('indestructible');
    expect(cells[3]).toHaveClass('tetromino__o');
  });
});
