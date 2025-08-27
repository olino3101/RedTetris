import "./Spectrums.css";
import React from "react";

import { buildBoard } from "/src/utils/Board";
// import defaultCell from "/src/utils/Cells
// import { transferToBoard } from "/src/utils/Tetrominoes";

import BoardCell from "/src/components/BoardCell";

const Spectrum = ({ player, index }) => {
    const board = buildBoard({ rows: 4, columns: 4 });

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
        <div className="Spectrum" style={style}>
            <div className="Spectrum-board">
                {/* {board} */}
            </div>
        </div>
    );
}

export default React.memo(Spectrum);
