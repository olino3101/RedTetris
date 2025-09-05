import {
  getOpponentsBoards,
  sendBoard,
  getNextTetromino,
  punishOther
} from '../src/utils/UseServer';
import { TETROMINOES } from '../src/utils/Tetrominoes';

// Mock the hook
jest.mock('../src/hooks/UseOpponentsBoard', () => ({
  useOpponentsBoardsFromSocket: jest.fn(() => new Map())
}));

describe('UseServer utilities', () => {
  let mockSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket = {
      emit: jest.fn(),
      on: jest.fn()
    };
  });

  describe('getOpponentsBoards', () => {
    it('should be defined', () => {
      expect(getOpponentsBoards).toBeDefined();
    });

    it('should return a Map from the hook', () => {
      const result = getOpponentsBoards(mockSocket);
      expect(result).toBeInstanceOf(Map);
    });
  });

  describe('sendBoard', () => {
    it('should call socket.emit with correct event and payload', () => {
      const board = [[0, 1], [1, 0]];
      const room = 'room1';

      sendBoard(mockSocket, room, board);

      expect(mockSocket.emit).toHaveBeenCalledWith('sendBoard', { room, board });
    });
  });

  describe('getNextTetromino', () => {
    it('should emit getNextTetrominoes and resolve with correct tetromino', async () => {
      const room = 'room1';
      const fakeKey = Object.keys(TETROMINOES)[0];
      const fakeTetromino = TETROMINOES[fakeKey];

      // mock socket.emit to immediately invoke callback
      mockSocket.emit.mockImplementation((event, payload, callback) => {
        if (event === 'getNextTetrominoes') {
          callback({ key: fakeKey });
        }
      });

      const result = await getNextTetromino(mockSocket, room);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'getNextTetrominoes',
        { room },
        expect.any(Function)
      );
      expect(result).toEqual(fakeTetromino);
    });
  });

  describe('punishOther', () => {
    it('should call socket.emit with punishOpponents event and payload', () => {
      const linesToPunish = 2;
      const room = 'room1';

      punishOther(linesToPunish, mockSocket, room);

      expect(mockSocket.emit).toHaveBeenCalledWith('punishOpponents', { linesToPunish, room });
    });
  });
});
