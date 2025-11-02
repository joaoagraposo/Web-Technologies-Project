// board.js
function createBoard(size) {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${size}, 50px)`;

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < size; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', onCellClick);
      board.appendChild(cell);
    }
  }
}

function renderPieces(boardState) {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);

    cell.innerHTML = '';
    cell.classList.remove('highlight-select', 'highlight-move');

    const occupant = boardState[r][c];
    if (!occupant) return;

    const color = typeof occupant === 'string' ? occupant : occupant.color;
    const token = document.createElement('div');
    token.className = `piece ${color}`;
    token.setAttribute('aria-label', `${color} piece`);

    cell.appendChild(token);
  });
}

function onCellClick(e) {
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('highlight-select', 'highlight-move');
  });

  const row = Number(e.currentTarget.dataset.row);
  const col = Number(e.currentTarget.dataset.col);
  const dice = gameState.diceValue;
  const piece = gameState.board[row][col];

  if (dice === null) return showMessage("Ainda não lançaste o dado.");
  if (gameState.currentPlayer !== 'human') return showMessage("Não é a tua vez.");

  const humanColor = gameState.players.human;

  if (gameState.movePreview) {
    const { to } = gameState.movePreview;

    if (to.row === row && to.col === col) {
      const target = gameState.board[row][col];
      if (target && target.color === humanColor) {
        gameState.movePreview = null;
        computeDestination(row, col, dice, target, gameState.size);
        return;
      }

      return applyMove(gameState.movePreview);
    }

    gameState.movePreview = null;
  }

  if (piece && piece.color === humanColor) {
    computeDestination(row, col, dice, piece, gameState.size);
    return;
  }

  if (!piece) return showMessage("Casa vazia.");
  if (piece.color !== humanColor) return showMessage("Só podes mover as tuas peças.");
}

/* 
   Movement Logic 
   Blue and Red now move in mirrored directions (vertically and horizontally).
*/

function isForwardRow(row, color) {
  // For blue: rows 3 & 1 move left→right.
  // For red:  rows 0 & 2 move right→left (mirror).
  if (color === 'blue') return row === 3 || row === 1;
  return row === 0 || row === 2;
}

function moveStep(row, col, size, color) {
  const forward = isForwardRow(row, color);
  const dir = color === 'red' ? -1 : 1;

  if (forward) {
    // "Forward" rows move horizontally
    const nextCol = col + dir;
    const atEdge = dir === 1 ? nextCol >= size : nextCol < 0;
    if (!atEdge) return { row, col: nextCol };

    // reached end of row → go vertically
    const nextRow = color === 'blue' ? row - 1 : row + 1;
    return { row: nextRow, col };
  } else {
    // "Backward" rows move the opposite way
    const nextCol = col - dir;
    const atEdge = dir === 1 ? nextCol < 0 : nextCol >= size;
    if (!atEdge) return { row, col: nextCol };

    // reached end of row → go vertically
    const nextRow = color === 'blue' ? row - 1 : row + 1;
    return { row: nextRow, col };
  }
}

function highlightMove(fromRow, fromCol, toRow, toCol) {
  const originCell = document.querySelector(
    `.cell[data-row="${fromRow}"][data-col="${fromCol}"]`
  );
  if (originCell) originCell.classList.add('highlight-select');

  const destCell = document.querySelector(
    `.cell[data-row="${toRow}"][data-col="${toCol}"]`
  );
  if (destCell) destCell.classList.add('highlight-move');
}

function computeDestination(row, col, dice, piece, size, silent = false) {
  const color = piece.color;
  const map = getPiecesMapByColor(color);

  if (!piece.hasMoved && dice !== 1) {
    if (!silent) showMessage('Esta peça ainda não se mexeu, precisa de 1 no dado.');
    return null;
  }

  const isOppositeRow = (color === 'blue') ? (row === 0) : (row === 3);
  if (isOppositeRow && anyInStartRow(color)) {
    if (!silent) showMessage('Ainda tens peças na linha inicial, não podes avançar esta.');
    return null;
  }

  let curRow = row;
  let curCol = col;
  let steps = dice;

  while (steps > 0) {
    ({ row: curRow, col: curCol } = moveStep(curRow, curCol, size, color));
    steps--;
  }

  const meta = map.get(piece);
  if (meta) {
    meta.destRow = curRow;
    meta.destCol = curCol;
    meta.hasMove = true;
  }

  if (!silent) {
    highlightMove(row, col, curRow, curCol);

    gameState.movePreview = {
      from: { row, col },
      to: { row: curRow, col: curCol },
      piece,
    };
  }

  return { row: curRow, col: curCol };
}

function applyMove(move) {
  const { from, to, piece } = move;

  const target = gameState.board[to.row][to.col];
  if (target && target.color === piece.color) {
    showMessage('Casa ocupada pela tua peça.');
    return;
  }

  // Update board and map
  gameState.board[from.row][from.col] = null;
  gameState.board[to.row][to.col] = piece;

  const map = getPiecesMapByColor(piece.color);
  const meta = map.get(piece);
  if (meta) {
    meta.row = to.row;
    meta.col = to.col;
    meta.destRow = null;
    meta.destCol = null;
    meta.hasMove = false;
  }

  piece.hasMoved = true;
  gameState.movePreview = null;

  renderPieces(gameState.board);

  // Clear highlights
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('highlight-select', 'highlight-move');
  });

  if (checkWin()) return;

  if (gameState.extramove) {
    if (gameState.currentPlayer === "ai") {
      // Consume the extra-move flag and immediately start another AI turn
      gameState.extramove = false;
      showMessage(`IA ganhou jogada extra!`);
      gameState.diceValue = null;
      document.getElementById('diceResult').innerText = '';
      console.log("AI earned an extra move → starting next AI roll...");
      return setTimeout(() => aiMove(), 800);
    } else {
      // Human keeps their turn normally
      gameState.extramove = false;
      showMessage(`Saiu: ${gameState.diceValue}, tens direito a mais uma jogada`);
      gameState.diceValue = null;
      document.getElementById('diceResult').innerText = '';
      return;
    }
  }
  
  nextTurn();
}

function canAnyMove(color) {
  const dice = gameState.diceValue;
  if (dice === null) return false;

  const map = getPiecesMapByColor(color);

  for (const [piece, meta] of map) {
    const dest = computeDestination(meta.row, meta.col, dice, piece, gameState.size, true);
    if (!dest) continue;

    const target = gameState.board[dest.row][dest.col];
    if (!target || target.color !== color) {
      return true;
    }
  }

  return false;
}

function passTurn() {
  const color = gameState.currentColor;

  if (canAnyMove(color)) {
    showMessage("Ainda tens uma jogada válida, não podes passar.");
    return;
  }

  showMessage("Vez passada.");
  nextTurn();
}