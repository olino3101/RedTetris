import { render, fireEvent } from '@testing-library/react';
import GameController from '../src/components/GameController';

// Mock hooks and utils
jest.mock('../src/hooks/UseDropTime', () => ({
  useDropTime: jest.fn(() => [1000, jest.fn(), jest.fn(), 1000]),
}));
jest.mock('../src/hooks/UseInterval', () => ({
  useInterval: jest.fn(),
}));
jest.mock('../src/utils/Input', () => ({
  Action: { Pause: 'Pause', Quit: 'Quit', SlowDrop: 'SlowDrop', Left: 'Left' },
  actionForKey: jest.fn((code) => code),
  actionIsDrop: jest.fn((action) => action === 'SlowDrop'),
}));
jest.mock('../src/utils/PlayerController', () => ({
  playerController: jest.fn(),
}));

const { actionForKey, actionIsDrop } = require('../src/utils/Input');
const { playerController } = require('../src/utils/PlayerController');

describe('GameController', () => {
  let setGameOver, setPlayer, board, gameStats, player;

  beforeEach(() => {
    setGameOver = jest.fn();
    setPlayer = jest.fn();
    board = {};
    gameStats = {};
    player = {};
    jest.clearAllMocks();
  });

  it('renders input element', () => {
    const { container } = render(
      <GameController
        board={board}
        gameStats={gameStats}
        player={player}
        setGameOver={setGameOver}
        setPlayer={setPlayer}
      />
    );
    expect(container.querySelector('input.GameController')).toBeInTheDocument();
  });

  it('handles Pause key', () => {
    actionForKey.mockReturnValue('Pause');
    const { getByRole } = render(
      <GameController
        board={board}
        gameStats={gameStats}
        player={player}
        setGameOver={setGameOver}
        setPlayer={setPlayer}
      />
    );
    fireEvent.keyDown(getByRole('textbox'), { code: 'Pause' });
    // Should call pauseDropTime or resumeDropTime (mocked)
  });

  it('handles Quit key', () => {
    actionForKey.mockReturnValue('Quit');
    const { getByRole } = render(
      <GameController
        board={board}
        gameStats={gameStats}
        player={player}
        setGameOver={setGameOver}
        setPlayer={setPlayer}
      />
    );
    fireEvent.keyDown(getByRole('textbox'), { code: 'Quit' });
    expect(setGameOver).toHaveBeenCalledWith(true);
  });

  it('handles SlowDrop key', () => {
    actionForKey.mockReturnValue('SlowDrop');
    actionIsDrop.mockReturnValue(true);
    const { getByRole } = render(
      <GameController
        board={board}
        gameStats={gameStats}
        player={player}
        setGameOver={setGameOver}
        setPlayer={setPlayer}
      />
    );
    fireEvent.keyDown(getByRole('textbox'), { code: 'SlowDrop' });
    expect(playerController).toHaveBeenCalled();
  });

  it('handles other key', () => {
    actionForKey.mockReturnValue('Left');
    actionIsDrop.mockReturnValue(false);
    const { getByRole } = render(
      <GameController
        board={board}
        gameStats={gameStats}
        player={player}
        setGameOver={setGameOver}
        setPlayer={setPlayer}
      />
    );
    fireEvent.keyDown(getByRole('textbox'), { code: 'Left' });
    expect(playerController).toHaveBeenCalled();
  });
});