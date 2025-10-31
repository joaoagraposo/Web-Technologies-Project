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
  // Clear all highlights before handling new click
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('highlight-select', 'highlight-move');
  });

  const row = Number(e.currentTarget.dataset.row);
  const col = Number(e.currentTarget.dataset.col);
  const dice = gameState.diceValue;
  const piece = gameState.board[row][col];

  if (dice === null) return showMessage("Dice not used");
  if (gameState.currentPlayer !== 'human') return showMessage("Not your turn.");

  // If there's an active preview...
  if (gameState.movePreview) {
    const { to } = gameState.movePreview;

    // If the clicked cell matches the preview destination
    if (to.row === row && to.col === col) {
      const target = gameState.board[row][col];

      // If the destination has one of your own pieces, don't move — select it instead
      if (target && target.color === 'blue') {
        gameState.movePreview = null;
        computeDestination(row, col, dice, target, gameState.size);
        return;
      }

      // Otherwise, valid move — apply it
      return applyMove(gameState.movePreview);
    }

    // If you clicked any other cell, reset move preview
    gameState.movePreview = null;
  }

  // If clicked a blue piece, start selection / compute possible move
  if (piece && piece.color === 'blue') {
    computeDestination(row, col, dice, piece, gameState.size);
    return;
  }

  // Otherwise, invalid clicks
  if (!piece) return showMessage("Empty cell.");
  if (piece.color !== 'blue') return showMessage("You can only move blue pieces.");
}

function isForwardRow(row) {
  return row === 3 || row === 1;
}

function computeDestination(row, col, dice, piece, size) {
  if (!piece.hasMoved && dice !== 1) {
    showMessage('Esta peça ainda não se mexeu, precisa de 1 no dado.');
    return;
  }

  if (row === 0 && anyBlueInStartRow()) {
    showMessage(
      'Tens peças na linha inicial (row 3), não podes avançar com as que estão no topo.'
    );
    return;
  }

  let curRow = row;
  let curCol = col;
  let steps = dice;


  while (steps > 0) {
    if (isForwardRow(curRow)) {
      ({ row: curRow, col: curCol } = evenMove(curRow, curCol, size));
    } else {
      ({ row: curRow, col: curCol } = oddMove(curRow, curCol, size));
    }
    steps--;
  }


  piece.destRow = curRow;
  piece.destCol = curCol;
  piece.hasMove = true;


  const map =
    piece.color === 'blue' ? gameState.bluePieces : gameState.redPieces;
  const meta = map.get(piece);
  if (meta) {
    meta.destRow = curRow;
    meta.destCol = curCol;
    meta.hasMove = true;
  }


  const originCell = document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );
  if (originCell) originCell.classList.add('highlight-select');

  const destCell = document.querySelector(
    `.cell[data-row="${curRow}"][data-col="${curCol}"]`
  );
  if (destCell) destCell.classList.add('highlight-move');


  gameState.movePreview = {
    from: { row, col },
    to: { row: curRow, col: curCol },
    piece,
  };
}


function evenMove(row, col, size) {
  if (col + 1 < size) {
    return { row, col: col + 1 };
  }

  return { row: row - 1, col };
}


function oddMove(row, col, size) {
  if (col - 1 >= 0) {
    return { row, col: col - 1 };
  }
  return { row: row - 1, col };
}


function applyMove(move) {
  const { from, to, piece } = move;

  const target = gameState.board[to.row][to.col];
  if (target && target.color === piece.color) {
    showMessage('Casa ocupada pela tua peça.');
    return;
  }

  gameState.board[from.row][from.col] = null;
  gameState.board[to.row][to.col] = piece;

  piece.hasMoved = true;

  gameState.movePreview = null;

  renderPieces(gameState.board);

  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('highlight-select', 'highlight-move');
  });

  if (gameState.extramove) {
    gameState.extramove = false;
    gameState.diceValue = null;
    return;
  }

  gameState.diceValue = null;
  nextTurn();
}