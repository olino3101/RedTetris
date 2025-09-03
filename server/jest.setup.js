// Jest setup file for server tests

// Mock console methods to reduce noise in test output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
    // You can uncomment these to silence console output during tests
    // console.log = jest.fn();
    // console.warn = jest.fn();
    // console.error = jest.fn();
});

afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
});
