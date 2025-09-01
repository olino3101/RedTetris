import React from 'react';
import { render, screen } from '@testing-library/react';
import Spectrum from '../src/components/Spectrum';

// Mock the buildBoard utility
jest.mock('../src/utils/Board', () => ({
  buildBoard: jest.fn()
}));

const mockBuildBoard = require('../src/utils/Board').buildBoard;

describe('Spectrum', () => {
  const defaultProps = {
    player: 1,
    index: 2
  };

  const mockBoard = {
    size: { rows: 20, columns: 10 },
    rows: Array(20).fill(Array(10).fill({ occupied: false, className: '' }))
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildBoard.mockReturnValue(mockBoard);
  });

  it('renders without crashing', () => {
    render(<Spectrum {...defaultProps} />);
  });

  it('renders with correct CSS classes', () => {
    render(<Spectrum {...defaultProps} />);
    
    const spectrumElement = document.querySelector('.Spectrum');
    expect(spectrumElement).toBeInTheDocument();
  });

  it('renders with correct inline styles', () => {
    render(<Spectrum {...defaultProps} />);
    
    const spectrumElement = document.querySelector('.Spectrum');
    expect(spectrumElement.style.top).toBe('30vw'); // 2 * 15 = 30
  });

  it('renders spectrum board container', () => {
    render(<Spectrum {...defaultProps} />);
    
    const boardContainer = document.querySelector('.Spectrum-board');
    expect(boardContainer).toBeInTheDocument();
  });

  it('calls buildBoard with correct parameters', () => {
    render(<Spectrum {...defaultProps} />);
    
    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });

  it('calls buildBoard only once per render', () => {
    render(<Spectrum {...defaultProps} />);
    
    expect(mockBuildBoard).toHaveBeenCalledTimes(1);
  });

  it('handles different player values', () => {
    const testPlayers = [1, 2, 3, 4, 5];
    
    testPlayers.forEach(player => {
      const { unmount } = render(<Spectrum player={player} index={2} />);
      
      expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
      
      unmount();
    });
  });

  it('handles different index values', () => {
    const testIndices = [0, 1, 2, 3, 4, 5];
    
    testIndices.forEach(index => {
      const { unmount } = render(<Spectrum player={1} index={index} />);
      
      const spectrumElement = document.querySelector('.Spectrum');
      expect(spectrumElement.style.top).toBe(`${index * 15}vw`);
      
      unmount();
    });
  });

  it('handles zero index', () => {
    render(<Spectrum player={1} index={0} />);
    
    const spectrumElement = document.querySelector('.Spectrum');
    expect(spectrumElement.style.top).toBe('0vw');
  });

  it('handles negative index', () => {
    render(<Spectrum player={1} index={-1} />);
    
    const spectrumElement = document.querySelector('.Spectrum');
    expect(spectrumElement.style.top).toBe('-15vw');
  });

  it('handles decimal index', () => {
    render(<Spectrum player={1} index={2.5} />);
    
    const spectrumElement = document.querySelector('.Spectrum');
    expect(spectrumElement.style.top).toBe('37.5vw'); // 2.5 * 15 = 37.5
  });

  it('handles very large index', () => {
    render(<Spectrum player={1} index={100} />);
    
    const spectrumElement = document.querySelector('.Spectrum');
    expect(spectrumElement.style.top).toBe('1500vw'); // 100 * 15 = 1500
  });

  it('handles undefined player prop', () => {
    render(<Spectrum player={undefined} index={2} />);
    
    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });

  it('handles null player prop', () => {
    render(<Spectrum player={null} index={2} />);
    
    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });

  it('handles undefined index prop', () => {
    render(<Spectrum player={1} index={undefined} />);
    
    const spectrumElement = document.querySelector('.Spectrum');
    expect(spectrumElement.style.top).toBe('NaNvw'); // undefined * 15 = NaN
  });

  it('handles null index prop', () => {
    render(<Spectrum player={1} index={null} />);
    
    const spectrumElement = document.querySelector('.Spectrum');
    expect(spectrumElement.style.top).toBe('0vw'); // null * 15 = 0
  });

  it('handles missing props gracefully', () => {
    render(<Spectrum />);
    
    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
    
    const spectrumElement = document.querySelector('.Spectrum');
    expect(spectrumElement.style.top).toBe('NaNvw'); // undefined * 15 = NaN
  });

  it('handles string player prop', () => {
    render(<Spectrum player="player1" index={2} />);
    
    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });

  it('handles string index prop', () => {
    render(<Spectrum player={1} index="2" />);
    
    const spectrumElement = document.querySelector('.Spectrum');
    expect(spectrumElement.style.top).toBe('30vw'); // "2" * 15 = 30
  });

  it('handles boolean player prop', () => {
    render(<Spectrum player={true} index={2} />);
    
    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });

  it('handles boolean index prop', () => {
    render(<Spectrum player={1} index={false} />);
    
    const spectrumElement = document.querySelector('.Spectrum');
    expect(spectrumElement.style.top).toBe('0vw'); // false * 15 = 0
  });

  it('handles object player prop', () => {
    render(<Spectrum player={{ id: 1 }} index={2} />);
    
    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });

  it('handles array index prop', () => {
    render(<Spectrum player={1} index={[2]} />);
    
    const spectrumElement = document.querySelector('.Spectrum');
    expect(spectrumElement.style.top).toBe('NaNvw'); // [2] * 15 = NaN
  });

  it('renders with custom board from buildBoard', () => {
    const customBoard = {
      size: { rows: 15, columns: 8 },
      rows: Array(15).fill(Array(8).fill({ occupied: true, className: 'test' }))
    };
    mockBuildBoard.mockReturnValue(customBoard);
    
    render(<Spectrum {...defaultProps} />);
    
    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });

  it('renders with empty board from buildBoard', () => {
    const emptyBoard = {
      size: { rows: 0, columns: 0 },
      rows: []
    };
    mockBuildBoard.mockReturnValue(emptyBoard);
    
    render(<Spectrum {...defaultProps} />);
    
    expect(mockBuildBoard).toHaveBeenCalledWith({ rows: 20, columns: 10 });
  });
});
