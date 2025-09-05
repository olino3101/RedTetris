import React from 'react';
import { render } from '@testing-library/react';
import BoardCell from '../src/components/BoardCell';

describe('BoardCell - Simple Tests', () => {
    it('renders a basic cell with default props', () => {
        const cell = {
            className: 'test-class'
        };

        const { container } = render(<BoardCell cell={cell} />);

        const cellElement = container.querySelector('.BoardCell');
        expect(cellElement).toBeInTheDocument();
        expect(cellElement).toHaveClass('BoardCell');
        expect(cellElement).toHaveClass('test-class');
    });

    it('renders the sparkle div inside the cell', () => {
        const cell = {
            className: 'sparkle-cell'
        };

        const { container } = render(<BoardCell cell={cell} />);

        const sparkleElement = container.querySelector('.Sparkle');
        expect(sparkleElement).toBeInTheDocument();
    });

    it('handles empty className gracefully', () => {
        const cell = {
            className: ''
        };

        const { container } = render(<BoardCell cell={cell} />);

        const cellElement = container.querySelector('.BoardCell');
        expect(cellElement).toBeInTheDocument();
        expect(cellElement).toHaveClass('BoardCell');
    });
});
