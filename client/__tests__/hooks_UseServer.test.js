import { getOpponentsBoards } from '../src/utils/UseServer';

// Mock the useOpponentsBoards hook
jest.mock('../src/hooks/UseOpponentsBoard', () => ({
  useOpponentsBoards: () => ({
    map: new Map(),
    set: jest.fn()
  })
}));

describe('getOpponentsBoards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(getOpponentsBoards).toBeDefined();
  });

  it('should return a Map when called with socket', () => {
    const mockSocket = {
      on: jest.fn()
    };

    const result = getOpponentsBoards(mockSocket);
    expect(result).toBeInstanceOf(Map);
  });

  it('should register BoardOpponents event listener', () => {
    const mockSocket = {
      on: jest.fn()
    };

    getOpponentsBoards(mockSocket);
    expect(mockSocket.on).toHaveBeenCalledWith('BoardOpponents', expect.any(Function));
  });
});
