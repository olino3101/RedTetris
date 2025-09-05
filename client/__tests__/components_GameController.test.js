import { render, fireEvent } from "@testing-library/react";
import GameController from "../src/components/GameController";

// Mock hooks and utils
jest.mock("../src/hooks/UseDropTime", () => ({
  useDropTime: jest.fn(() => [1000, jest.fn(), jest.fn(), 1000]),
}));
jest.mock("../src/hooks/UseInterval", () => ({
  useInterval: jest.fn(),
}));
jest.mock("../src/utils/Input", () => ({
  Action: { Pause: "Pause", Quit: "Quit", SlowDrop: "SlowDrop", Left: "Left" },
  actionForKey: jest.fn((code) => code),
  actionIsDrop: jest.fn((action) => action === "SlowDrop"),
}));
jest.mock("../src/utils/PlayerController", () => ({
  playerController: jest.fn(),
  isGoingToCollided: jest.fn(() => false),
}));

const { actionForKey, actionIsDrop } = require("../src/utils/Input");
const {
  playerController,
  isGoingToCollided,
} = require("../src/utils/PlayerController");

describe("GameController", () => {
  let setGameOver, setPlayer, board, gameStats, player, socket, room, name;

  beforeEach(() => {
    setGameOver = jest.fn();
    setPlayer = jest.fn();
    board = {};
    gameStats = {};
    player = {};
    socket = { emit: jest.fn() };
    room = "testroom";
    name = "testname";
    jest.clearAllMocks();
  });

  it("renders div element", () => {
    const { container } = render(
      <GameController
        board={board}
        gameStats={gameStats}
        player={player}
        setGameOver={setGameOver}
        setPlayer={setPlayer}
        socket={socket}
        room={room}
        name="testname"
      />
    );
    expect(container.querySelector("div.GameController")).toBeInTheDocument();
  });

  it("handles Pause key", () => {
    actionForKey.mockReturnValue("Pause");
    render(
      <GameController
        board={board}
        gameStats={gameStats}
        player={player}
        setGameOver={setGameOver}
        setPlayer={setPlayer}
        socket={socket}
        room={room}
        name="testname"
      />
    );

    // Fire keyboard event on document since we use global listeners
    fireEvent.keyDown(document, { code: "Pause" });
    // Should call pauseDropTime or resumeDropTime (mocked)
  });

  it("handles Quit key", () => {
    actionForKey.mockReturnValue("Quit");
    render(
      <GameController
        board={board}
        gameStats={gameStats}
        player={player}
        setGameOver={setGameOver}
        setPlayer={setPlayer}
        socket={socket}
        room={room}
        name="testname"
      />
    );

    // Fire keyboard event on document since we use global listeners
    fireEvent.keyDown(document, { code: "Quit" });
    expect(setGameOver).toHaveBeenCalledWith(true);
    expect(socket.emit).toHaveBeenCalledWith("gameLost", { room });
    expect(socket.emit).toHaveBeenCalledWith("joinRoom", {
      room,
      name: "testname",
    });
  });

  it("handles SlowDrop key", () => {
    actionForKey.mockReturnValue("SlowDrop");
    actionIsDrop.mockReturnValue(true);
    render(
      <GameController
        board={board}
        gameStats={gameStats}
        player={player}
        setGameOver={setGameOver}
        setPlayer={setPlayer}
        socket={socket}
        room={room}
        name="testname"
      />
    );

    // Fire keyboard event on document since we use global listeners
    fireEvent.keyDown(document, { code: "SlowDrop" });
    expect(playerController).toHaveBeenCalled();
  });

  it("handles other key", () => {
    actionForKey.mockReturnValue("Left");
    actionIsDrop.mockReturnValue(false);
    render(
      <GameController
        board={board}
        gameStats={gameStats}
        player={player}
        setGameOver={setGameOver}
        setPlayer={setPlayer}
        socket={socket}
        room={room}
        name="testname"
      />
    );

    // Fire keyboard event on document since we use global listeners
    fireEvent.keyDown(document, { code: "Left" });
    expect(playerController).toHaveBeenCalled();
  });
});
