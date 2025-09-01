import { render, screen } from '@testing-library/react';
import App from '../src/App';

// Mock useUserData
jest.mock('../src/hooks/UseUserData', () => ({
    useUserData: jest.fn(),
}));
const { useUserData } = require('../src/hooks/UseUserData');

// Mock useParams from react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}));
const { useParams } = require('react-router-dom');

beforeAll(() => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
});

afterAll(() => {
    const root = document.getElementById('root');
    if (root) root.remove();
});


describe('App', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useParams.mockReturnValue({});
    });

    it('renders without crashing', () => {
        useUserData.mockReturnValue({ isConnected: false });
        render(<App />);
    });

    it('renders NOT FOUND for invalid routes', () => {
        useUserData.mockReturnValue({ isConnected: false });
        useParams.mockReturnValue({});
        render(<App />);
        expect(screen.getByText(/NOT FOUND/i)).toBeInTheDocument();
    });

});
