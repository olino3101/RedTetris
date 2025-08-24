import { defaultCell, indestructableCell } from "./Cells";
import { transferToBoard } from "./Tetrominoes";
import { movePlayer } from "./PlayerController";

export const buildBoard = ({ rows, columns }) => {
  const builtRows = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ({ ...defaultCell }))
  );
  return {
    rows: builtRows,
    size: { rows, columns }
  };
};

const findDropPosition = ({ board, position, shape }) => {
  let max = board.size.rows - position.row + 1;
  let row = 0;

  for (let i = 0; i < max; i++) {
    const delta = { row: i, column: 0 };
    const result = movePlayer({ delta, position, shape, board });
    const { collided } = result;

    if (collided) {
      break;
    }

    row = position.row + i;
  }
  return { ...position, row };
}


export const nextBoard = ({
  board,
  player,
  resetPlayer,
  addLinesCleared,
  addIndestructibleLines
}) => {
  const { tetromino, position } = player;

  let rows = board.rows.map((row) =>
    row.map((cell) => (cell.occupied ? cell : { ...defaultCell }))
  );

  const dropPosition = findDropPosition({
    board,
    position,
    shape: tetromino.shape
  });

  const className = `${tetromino.className} 
    ${player.isFastDropping ? "" : "ghost"
    }`;

  rows = transferToBoard({
    className,
    isOccupied: player.isFastDropping,
    position: dropPosition,
    rows,
    shape: tetromino.shape
  });


  if (!player.isFastDropping) {
    rows = transferToBoard({
      className: tetromino.className,
      isOccupied: player.collided,
      position,
      rows,
      shape: tetromino.shape
    });
  }

  const blankRow = rows[0].map((_) => ({ ...defaultCell }));
  let linesCleared = 0;
  rows = rows.reduce((acc, row) => {
    if (row.every((column) => column.occupied && row[0].className != "Indestructable")) {
      linesCleared++;
      acc.unshift([...blankRow]);
    } else {
      acc.push(row);
    }
    return acc;
  }, []);

  if (linesCleared > 0) {
    addLinesCleared(linesCleared);
  }
  if (player.collided || player.isFastDropping) {
    resetPlayer();
  }


  // get the number of existing indestrucable line

  // if the number is of howmany its supppose to be then add them up
  const indestructibleLine = rows[0].map((_) => ({ ...indestructableCell }));
  const amountIndestructibleLine = rows.reduce((counter, row) => {
    if (row[0].className == "Indestructable")
      counter += 1;
    return counter;
  }, {});

  rows = rows.reduce((acc, row) => {
    if (amountIndestructibleLine < addIndestructibleLines)
      acc.push(indestructibleLine);
    else
      acc.push(row);
    return acc;
  }, []);

  return {
    rows,
    size: { ...board.size }
  };
};

export const hasCollision = ({ board, position, shape }) => {
  for (let y = 0; y < shape.length; y++) {
    const row = y + position.row;

    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === 1) {
        const column = x + position.column;

        if (

          board.rows[row] &&
          board.rows[row][column] &&
          board.rows[row][column].occupied

        ) {
          return true;
        }
      }
    }
  }
  return false;
};

export const isWithinBoard = ({ board, position, shape }) => {
  for (let y = 0; y < shape.length; y++) {
    const row = y + position.row;

    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const column = x + position.column;
        const isValidPosition = board.rows[row] && board.rows[row][column];

        if (!isValidPosition) return false;
      }
    }
  }
  return true;
}

// z z j o  // o j z