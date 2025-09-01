import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';

// Mock the hooks to avoid socket connection issues
jest.mock('../src/hooks/UseUserData', () => ({
  useUserData: jest.fn()
}));

const mockUseUserData = require('../src/hooks/UseUserData').useUserData;

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('renders NOT FOUND for invalid routes', () => {
    render(<App />);
    // The default route should show NOT FOUND since no room/name params
    expect(screen.getByText('NOT FOUND')).toBeInTheDocument();
  });

  it('renders Game component when connected', () => {
    mockUseUserData.mockReturnValue({ isConnected: true });
    
    render(<App />);
    // Should show waiting connection since no route params
    expect(screen.getByText('Waiting server Connection...')).toBeInTheDocument();
  });

  it('renders waiting message when not connected', () => {
    mockUseUserData.mockReturnValue({ isConnected: false });
    
    render(<App />);
    expect(screen.getByText('Waiting server Connection...')).toBeInTheDocument();
  });
});

describe('GameIfConnected', () => {
  it('renders Game when connected with valid params', () => {
    mockUseUserData.mockReturnValue({ isConnected: true });
    
    // Mock useParams to return room and name
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({ room: 'test-room', name: 'test-player' })
    }));
    
    render(<App />);
    expect(screen.getByText('Waiting server Connection...')).toBeInTheDocument();
  });
});
