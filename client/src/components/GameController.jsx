import "./GameController.css";

import { Action, actionForKey } from "/src/utils/Input"
import { playerController } from "/src/utils/PlayerController"

const GameController = ({
    board,
    gameStats,
    player,
    setGameOver,
    setPlayer
}) => {
    const onKeyUp = ({ code }) => {
        const action = actionForKey(code);
        console.log(code, action);
        if (action === Action.Quit) {
            setGameOver(true);
            console.log("up");
        }
    }
    const onKeyDown = ({ code }) => {
        console.log("zdfgdfgg");
        const action = actionForKey(code)
        handleInput({ action });
    }

    const handleInput = ({ action }) => {
        playerController({
            action,
            board,
            player,
            setPlayer,
            setGameOver
        });
    };


    return (
        <input
            className="GameController"
            type="text"
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            autoFocus
        />
    );
}

export default GameController;