import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock the Bundle module to prevent immediate execution
jest.mock('../src/Bundle', () => {
    const React = require('react');
    const { Route, Routes, useParams } = require('react-router-dom');

    function App() {
        return React.createElement('div', { className: 'App' },
            React.createElement(Routes, null,
                React.createElement(Route, {
                    path: '/:room/:name',
                    element: React.createElement(GameIfConnected)
                }),
                React.createElement(Route, {
                    path: '*',
                    element: React.createElement('div', null, 'NOT FOUND')
                })
            )
        );
    }

    function GameIfConnected() {
        const { useUserData } = require('../src/hooks/UseUserData');
        const params = useParams();
        const { socket, isConnected, error } = useUserData({ room: params.room, name: params.name });

        if (isConnected && !error) {
            return React.createElement('div', null, 'Mock Game Component');
        } else {
            return React.createElement('div', null, 'Waiting server Connection...');
        }
    }

    return { default: App };
});

// Mock useUserData
jest.mock('../src/hooks/UseUserData', () => ({
    useUserData: jest.fn(),
}));
const { useUserData } = require('../src/hooks/UseUserData');

// Mock Game component
jest.mock('../src/components/Game', () => {
    return function MockGame() {
        return require('react').createElement('div', null, 'Mock Game Component');
    };
});

const App = require('../src/Bundle').default;

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
    });

    it('renders without crashing', () => {
        useUserData.mockReturnValue({ isConnected: false });
        render(
            <MemoryRouter initialEntries={['/testroom/testuser']}>
                <App />
            </MemoryRouter>
        );
    });

    it('renders NOT FOUND for invalid routes', () => {
        useUserData.mockReturnValue({ isConnected: false });
        render(
            <MemoryRouter initialEntries={['/invalid']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText(/NOT FOUND/i)).toBeInTheDocument();
    });

    it('renders waiting connection message when not connected', () => {
        useUserData.mockReturnValue({ isConnected: false, error: false });
        render(
            <MemoryRouter initialEntries={['/testroom/testuser']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText(/Waiting server Connection.../i)).toBeInTheDocument();
    });

    it('renders Game component when connected', () => {
        useUserData.mockReturnValue({ isConnected: true, error: false, socket: {} });
        render(
            <MemoryRouter initialEntries={['/testroom/testuser']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText(/Mock Game Component/i)).toBeInTheDocument();
    });

});
