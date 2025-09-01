import React from 'react';
import { render } from '@testing-library/react';
import Bundle from '../src/Bundle';

describe('Bundle', () => {
    it('renders without crashing', () => {
        render(<Bundle />);
    });
});
