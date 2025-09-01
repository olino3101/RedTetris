import { renderHook, act } from '@testing-library/react';
import { useUserData } from '../src/hooks/UseUserData';

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn()
}));

const mockIo = require('socket.io-client').io;

describe('useUserData', () => {
  let mockSocket;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSocket = {
      id: 'test-socket-id',
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn()
    };

    mockIo.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useUserData());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.socket).toBe(null);
  });

  it('returns correct object structure', () => {
    const { result } = renderHook(() => useUserData());

    expect(typeof result.current).toBe('object');
    expect(result.current).toHaveProperty('isConnected');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('socket');
  });

  it('creates socket connection on mount', () => {
    renderHook(() => useUserData());

    expect(mockIo).toHaveBeenCalledWith({
      path: "/api/socket.io",
      withCredentials: true,
    });
  });

  it('sets up socket event listeners on mount', () => {
    renderHook(() => useUserData());

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('handles connect event correctly', () => {
    const { result } = renderHook(() => useUserData());

    // Get the connect handler
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];

    act(() => {
      connectHandler();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('handles disconnect event correctly', () => {
    const { result } = renderHook(() => useUserData());

    // First connect
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    act(() => {
      connectHandler();
    });
    expect(result.current.isConnected).toBe(true);

    // Then disconnect
    const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
    act(() => {
      disconnectHandler();
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('handles connect_error event correctly', () => {
    const { result } = renderHook(() => useUserData());

    const connectErrorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')[1];
    const testError = new Error('Connection failed');

    act(() => {
      connectErrorHandler(testError);
    });

    expect(result.current.error).toBe('Connection failed');
    expect(result.current.isConnected).toBe(false);
  });

  it('handles error event correctly', () => {
    const { result } = renderHook(() => useUserData());

    const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'error')[1];
    const testError = { message: 'Socket error' };

    act(() => {
      errorHandler(testError);
    });

    expect(result.current.error).toBe('Socket error');
  });

  // it('emits joinRoom when room and name are provided and connected', () => {
  //   const { result } = renderHook(() => useUserData('test-room', 'test-player'));

  //   // Connect first
  //   const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
  //   act(() => {
  //     connectHandler();
  //   });

  //   expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', { room: 'test-room', name: 'test-player' });
  // });

  it('does not emit joinRoom when not connected', () => {
    renderHook(() => useUserData('test-room', 'test-player'));

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('does not emit joinRoom when room is missing', () => {
    const { result } = renderHook(() => useUserData(undefined, 'test-player'));

    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    act(() => {
      connectHandler();
    });

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('does not emit joinRoom when name is missing', () => {
    const { result } = renderHook(() => useUserData('test-room', undefined));

    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    act(() => {
      connectHandler();
    });

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('cleans up socket connection on unmount', () => {
    const { unmount } = renderHook(() => useUserData());

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('connect_error', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('sets socket ref to null on unmount', () => {
    const { result, unmount } = renderHook(() => useUserData());

    unmount();

    expect(result.current.socket).toBe(null);
  });

  it('handles multiple connect/disconnect cycles', () => {
    const { result } = renderHook(() => useUserData());

    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];

    // First cycle
    act(() => {
      connectHandler();
    });
    expect(result.current.isConnected).toBe(true);

    act(() => {
      disconnectHandler();
    });
    expect(result.current.isConnected).toBe(false);

    // Second cycle
    act(() => {
      connectHandler();
    });
    expect(result.current.isConnected).toBe(true);

    act(() => {
      disconnectHandler();
    });
    expect(result.current.isConnected).toBe(false);
  });

  it('handles error clearing on successful connection', () => {
    const { result } = renderHook(() => useUserData());

    // First set an error
    const connectErrorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')[1];
    act(() => {
      connectErrorHandler(new Error('Connection failed'));
    });
    expect(result.current.error).toBe('Connection failed');

    // Then connect successfully
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    act(() => {
      connectHandler();
    });

    expect(result.current.error).toBe(null);
    expect(result.current.isConnected).toBe(true);
  });



  it('logs connection events to console', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const { result } = renderHook(() => useUserData());

    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    act(() => {
      connectHandler();
    });

    expect(consoleSpy).toHaveBeenCalledWith('[socket] connected id:', 'test-socket-id');

    consoleSpy.mockRestore();
  });

  it('logs connect_error events to console', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useUserData());

    const connectErrorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')[1];
    const testError = new Error('Connection failed');
    testError.description = 'Test description';
    testError.context = 'Test context';

    act(() => {
      connectErrorHandler(testError);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[socket] connect_error',
      'Connection failed',
      'Test description',
      'Test context'
    );

    consoleSpy.mockRestore();
  });

  it('logs error events to console', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useUserData());

    const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'error')[1];
    const testError = new Error('Socket error');

    act(() => {
      errorHandler(testError);
    });

    expect(consoleSpy).toHaveBeenCalledWith('[socket] error', testError);

    consoleSpy.mockRestore();
  });



  it('handles empty room and name strings', () => {
    const { result } = renderHook(() => useUserData('', ''));

    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    act(() => {
      connectHandler();
    });

    // Should not emit joinRoom for empty strings
    expect(mockSocket.emit).not.toHaveBeenCalledWith('joinRoom', {
      room: '',
      name: ''
    });
  });

  it('handles boolean room and name', () => {
    const { result } = renderHook(() => useUserData(true, false));

    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    act(() => {
      connectHandler();
    });

    // Should not emit joinRoom for boolean values
    expect(mockSocket.emit).not.toHaveBeenCalledWith('joinRoom', {
      room: true,
      name: false
    });
  });




  it('handles undefined room and name', () => {
    const { result } = renderHook(() => useUserData(undefined, undefined));

    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    act(() => {
      connectHandler();
    });

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('handles missing room and name', () => {
    const { result } = renderHook(() => useUserData());

    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    act(() => {
      connectHandler();
    });

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('handles no parameters', () => {
    const { result } = renderHook(() => useUserData());

    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    act(() => {
      connectHandler();
    });

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });
});
