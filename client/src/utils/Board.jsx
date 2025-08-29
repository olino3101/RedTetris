import { defaultCell, indestructibleCell } from "./Cells";
import { transferToBoard } from "./Tetrominoes";
import { movePlayer } from "./PlayerController";
import { punishOther } from '/src/utils/SendServer';


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

  const updateOccupiedRows = board.rows.map((row) =>
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

  // update tetromino ghost
  const updateTetrominoRows = updateGhostAndTetromino({
    className,
    player,
    dropPosition,
    rows: updateOccupiedRows,
    tetromino,
    position
  });


  // clear the lines that are full
  const { clearedRows, linesCleared } = clearLines(updateTetrominoRows);

  if (linesCleared > 0) {
    addLinesCleared(linesCleared);
  }
  const linesToPunish = Math.round(linesCleared / 2);
  // punish other is when you delete more then 2 lines the other receive +1 lines penalty
  if (linesToPunish > 0)
    punishOther(linesToPunish);
  if (player.collided || player.isFastDropping) {
    resetPlayer();
  }

  // add the rows that are indestructable
  const withIndestrucableRows = indestructibleLines(clearedRows, addIndestructibleLines);

  return {
    rows: withIndestrucableRows,
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

const clearLines = (rows) => {
  const blankRow = rows[0].map((_) => ({ ...defaultCell }));
  const { acc, linesCleared } = [...rows].reduce(({ acc, linesCleared }, row) => {
    if (row.every((column) => column.occupied && row[0].className != "indestructible")) {
      return {
        acc: [...acc],
        linesCleared: linesCleared + 1,
      };
    } else {
      return {
        acc: [...acc, [...row]],
        linesCleared,
      };
    }
  }, { acc: [], linesCleared: 0 });

  const BlankRows = Array(linesCleared).fill(blankRow);
  const clearedRows = linesCleared > 0 ? [...BlankRows, ...acc] : [...acc];

  return { clearedRows, linesCleared };
}

const indestructibleLines = (rows, addIndestructibleLines) => {
  const indestructibleLine = rows[0].map((_) => ({ ...indestructibleCell }));
  const reverseRows = [...rows].reverse();
  const newRows = reverseRows.reduce(({ acc, count }, row) => {
    if (count < addIndestructibleLines) {
      return {
        acc: [...acc, [...indestructibleLine]],
        count: count + 1,
      };
    }
    return {
      acc: [...acc, [...row]],
      count,
    };
  },
    { acc: [], count: rows.filter(row => row[0].className === "indestructible").length }

  ).acc.reverse();

  return newRows;
}


const updateGhostAndTetromino = (
  { className,
    player,
    dropPosition,
    rows,
    tetromino,
    position
  }) => {
  console.log(className);
  console.log(player, rows);
  const updateGhost = transferToBoard({
    className,
    isOccupied: player.isFastDropping,
    position: dropPosition,
    rows,
    shape: tetromino.shape
  });

  if (!player.isFastDropping) {
    const updateTetrominoRows = transferToBoard({
      className: tetromino.className,
      isOccupied: player.collided,
      position,
      rows: updateGhost,
      shape: tetromino.shape
    });
    return updateTetrominoRows;
  }
  return updateGhost;
}