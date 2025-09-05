import React from 'react';
import { render, screen } from '@testing-library/react';
import Spectrum from '../src/components/Spectrum';

// Mock BoardCell component
jest.mock('/src/components/BoardCell', () => {
    return function MockBoardCell({ cell }) {
        return <div data-testid="board-cell" data-cell={JSON.stringify(cell)} />;
    };
});

describe('Spectrum', () => {
    it('renders without crashing with valid board', () => {
        const props = {
            board: {
                size: { rows: 2, columns: 2 },
                rows: [
                    [{ type: 'empty' }, { type: 'filled' }],
                    [{ type: 'filled' }, { type: 'empty' }]
                ]
            },
            name: 'Player 1'
        };

        render(<Spectrum {...props} />);

        expect(screen.getByText('Player 1')).toBeInTheDocument();
        expect(screen.getAllByTestId('board-cell')).toHaveLength(4);
    });

    it('renders "No board data" when board is null', () => {
        const props = {
            board: null,
            name: 'Player 1'
        };

        render(<Spectrum {...props} />);

        expect(screen.getByText('No board data')).toBeInTheDocument();
        expect(screen.getByText('No board data')).toHaveClass('Spectrum', 'no-board');
    });

    it('renders "No board data" when board is undefined', () => {
        const props = {
            board: undefined,
            name: 'Player 1'
        };

        render(<Spectrum {...props} />);

        expect(screen.getByText('No board data')).toBeInTheDocument();
    });

    it('applies correct grid styles to board', () => {
        const props = {
            board: {
                size: { rows: 3, columns: 4 },
                rows: [
                    [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
                    [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
                    [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }]
                ]
            },
            name: 'Player 2'
        };

        const { container } = render(<Spectrum {...props} />);
        const boardElement = container.querySelector('.Spectrum-board');

        expect(boardElement).toHaveStyle({
            gridTemplateRows: 'repeat(3, 1fr)',
            gridTemplateColumns: 'repeat(4, 1fr)'
        });
    });

    it('renders correct number of cells based on board size', () => {
        const props = {
            board: {
                size: { rows: 2, columns: 3 },
                rows: [
                    [{ type: 'I' }, { type: 'O' }, { type: 'T' }],
                    [{ type: 'L' }, { type: 'J' }, { type: 'S' }]
                ]
            },
            name: 'Player 3'
        };

        render(<Spectrum {...props} />);

        const cells = screen.getAllByTestId('board-cell');
        expect(cells).toHaveLength(6); // 2 rows × 3 columns
    });

    it('passes correct cell data to BoardCell components', () => {
        const props = {
            board: {
                size: { rows: 1, columns: 2 },
                rows: [
                    [{ type: 'I', occupied: true }, { type: 'empty', occupied: false }]
                ]
            },
            name: 'Player 4'
        };

        render(<Spectrum {...props} />);

        const cells = screen.getAllByTestId('board-cell');
        expect(cells[0]).toHaveAttribute('data-cell', JSON.stringify({ type: 'I', occupied: true }));
        expect(cells[1]).toHaveAttribute('data-cell', JSON.stringify({ type: 'empty', occupied: false }));
    });

    it('renders player name correctly', () => {
        const props = {
            board: {
                size: { rows: 1, columns: 1 },
                rows: [[{ type: 'empty' }]]
            },
            name: 'Test Player Name'
        };

        render(<Spectrum {...props} />);

        expect(screen.getByText('Test Player Name')).toBeInTheDocument();
        expect(screen.getByText('Test Player Name')).toHaveClass('Spectrum-name');
    });

    it('handles empty board rows', () => {
        const props = {
            board: {
                size: { rows: 0, columns: 0 },
                rows: []
            },
            name: 'Empty Board Player'
        };

        render(<Spectrum {...props} />);

        expect(screen.getByText('Empty Board Player')).toBeInTheDocument();
        expect(screen.queryAllByTestId('board-cell')).toHaveLength(0);
    });

    it('component is memoized (React.memo)', () => {
        // Test that the component is wrapped with React.memo
        expect(Spectrum.$$typeof).toBe(Symbol.for('react.memo'));
    });
});

// it('renders with correct CSS classes', () => {
//   render(<Spectrum {...defaultProps} />);

//   const spectrumElement = document.querySelector('.Spectrum');
//   expect(spectrumElement).toBeInTheDocument();
// });

// it('renders with correct inline styles', () => {
//   render(<Spectrum {...defaultProps} />);

//   const spectrumElement = document.querySelector('.Spectrum');
//   expect(spectrumElement.style.top).toBe('30vw'); // 2 * 15 = 30
// });

// it('renders spectrum board container', () => {
//   render(<Spectrum {...defaultProps} />);

//   const boardContainer = document.querySelector('.Spectrum-board');
//   expect(boardContainer).toBeInTheDocument();
// });

// it('calls buildBoard with correct parameters', () => {
//   render(<Spectrum {...defaultProps} />);

//   expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
// });

// it('calls buildBoard only once per render', () => {
//   render(<Spectrum {...defaultProps} />);

//   expect(mockBuildBoard).toHaveBeenCalledTimes(1);
// });

// it('handles different player values', () => {
//   const testPlayers = [1, 2, 3, 4, 5];

//   testPlayers.forEach(player => {
//     const { unmount } = render(<Spectrum player={player} index={2} />);

//     expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });

//     unmount();
//   });
// });

// it('handles different index values', () => {
//   const testIndices = [0, 1, 2, 3, 4, 5];

//   testIndices.forEach(index => {
//     const { unmount } = render(<Spectrum player={1} index={index} />);

//     const spectrumElement = document.querySelector('.Spectrum');
//     expect(spectrumElement.style.top).toBe(`${index * 15}vw`);

//     unmount();
//   });
// });

// it('handles zero index', () => {
//   render(<Spectrum player={1} index={0} />);

//   const spectrumElement = document.querySelector('.Spectrum');
//   expect(spectrumElement.style.top).toBe('0vw');
// });

// it('handles negative index', () => {
//   render(<Spectrum player={1} index={-1} />);

//   const spectrumElement = document.querySelector('.Spectrum');
//   expect(spectrumElement.style.top).toBe('-15vw');
// });

// it('handles decimal index', () => {
//   render(<Spectrum player={1} index={2.5} />);

//   const spectrumElement = document.querySelector('.Spectrum');
//   expect(spectrumElement.style.top).toBe('37.5vw'); // 2.5 * 15 = 37.5
// });

// it('handles very large index', () => {
//   render(<Spectrum player={1} index={100} />);

//   const spectrumElement = document.querySelector('.Spectrum');
//   expect(spectrumElement.style.top).toBe('1500vw'); // 100 * 15 = 1500
// });

// it('handles undefined player prop', () => {
//   render(<Spectrum player={undefined} index={2} />);

//   expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
// });

// it('handles null player prop', () => {
//   render(<Spectrum player={null} index={2} />);

//   expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
// });

// it('handles undefined index prop', () => {
//   render(<Spectrum player={1} index={undefined} />);

//   const spectrumElement = document.querySelector('.Spectrum');
//   expect(spectrumElement.style.top).toBe('NaNvw'); // undefined * 15 = NaN
// });

// it('handles null index prop', () => {
//   render(<Spectrum player={1} index={null} />);

//   const spectrumElement = document.querySelector('.Spectrum');
//   expect(spectrumElement.style.top).toBe('0vw'); // null * 15 = 0
// });

// it('handles missing props gracefully', () => {
//   render(<Spectrum />);

//   expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });

//   const spectrumElement = document.querySelector('.Spectrum');
//   expect(spectrumElement.style.top).toBe('NaNvw'); // undefined * 15 = NaN
// });

// it('handles string player prop', () => {
//   render(<Spectrum player="player1" index={2} />);

//   expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
// });

// it('handles string index prop', () => {
//   render(<Spectrum player={1} index="2" />);

//   const spectrumElement = document.querySelector('.Spectrum');
//   expect(spectrumElement.style.top).toBe('30vw'); // "2" * 15 = 30
// });

// it('handles boolean player prop', () => {
//   render(<Spectrum player={true} index={2} />);

//   expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
// });

// it('handles boolean index prop', () => {
//   render(<Spectrum player={1} index={false} />);

//   const spectrumElement = document.querySelector('.Spectrum');
//   expect(spectrumElement.style.top).toBe('0vw'); // false * 15 = 0
// });

// it('handles object player prop', () => {
//   render(<Spectrum player={{ id: 1 }} index={2} />);

//   expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
// });

// it('handles array index prop', () => {
//   render(<Spectrum player={1} index={[2]} />);

//   const spectrumElement = document.querySelector('.Spectrum');
//   expect(spectrumElement.style.top).toBe('NaNvw'); // [2] * 15 = NaN
// });

// it('renders with custom board from buildBoard', () => {
//   const customBoard = {
//     size: { rows: 15, columns: 8 },
//     rows: Array(15).fill(Array(8).fill({ occupied: true, className: 'test' }))
//   };
//   mockBuildBoard.mockReturnValue(customBoard);

//   render(<Spectrum {...defaultProps} />);

//   expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
// });

// it('renders with empty board from buildBoard', () => {
//   const emptyBoard = {
//     size: { rows: 0, columns: 0 },
//     rows: []
//   };
//   mockBuildBoard.mockReturnValue(emptyBoard);

//   render(<Spectrum {...defaultProps} />);

//   expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
// });
// });
