import "./Spectrums.css";
import React from "react";
import "./Board.css"
import { buildBoard } from "/src/utils/Board";

// import defaultCell from "/src/utils/Cells
// import { transferToBoard } from "/src/utils/Tetrominoes";

import BoardCell from "/src/components/BoardCell";

const Spectrum = ({ player, index }) => {
    const board = buildBoard({ rows: 20, columns: 10 });

    const style = {
        top: `${index * 15}vw`
    }

    // board.rows = transferToBoard({
    //     className,
    //     isOccupied: false,
    //     position: { row: 0, column: 0 },
    //     rows: board.rows,
    //     shape
    // });


    return (
        // <div className="Spectrum" style={style}>
        //     <div className="Spectrum-board">
        //         {board}
        //     </div>
        // </div>
        <BoardSpectrum board={player} name="George" />
    );
}

const BoardSpectrum = ({ board, name }) => {

    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
    };
    return (
        <div className="Spectrum-container">
            <div className="Spectrum-board" style={boardStyles}>
                {board.rows.map((row, y) =>
                    row.map((cell, x) => (
                        <BoardCell key={x * board.size.columns + x} cell={cell} />
                    ))
                )}
            </div>
            <div className="Spectrum-name">name</div>
        </div>


    );
};


export default React.memo(Spectrum);
