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
  // clear previous highlights
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

  // === CASE: we had a preview (maybe with multiple options)
  if (gameState.movePreview) {
    const { from, options, piece: previewPiece } = gameState.movePreview;

    // did we click one of the destinations?
    const chosen = options.find(o => o.row === row && o.col === col);
    if (chosen) {
      gameState.movePreview = null;
      return applyMove({
        from,
        to: chosen,
        piece: previewPiece,
      });
    }

    // else: clicked another of my pieces → recompute for that one
    gameState.movePreview = null;
  }

  // === normal selection
  if (piece && piece.color === humanColor) {
    computeDestination(row, col, dice, piece, gameState.size);
    return;
  }

  if (!piece) return showMessage("Casa vazia.");
  if (piece.color !== humanColor) return showMessage("Só podes mover as tuas peças.");
}




function isForwardRow(row, color) {
  // For blue: rows 3 & 1 move left→right.
  // For red:  rows 0 & 2 move right→left (mirror).
  if (color === 'blue') return row === 3 || row === 1;
  return row === 0 || row === 2;
}

function moveStep(row, col, size, color) {
  const forward = isForwardRow(row, color);
  const dir = (color === 'red') ? -1 : 1;

  let nextCol, atEdge;

  if (forward) {
    nextCol = col + dir;
    atEdge = (dir === 1) ? (nextCol >= size) : (nextCol < 0);
  } else {
    nextCol = col - dir;
    atEdge = (dir === 1) ? (nextCol < 0) : (nextCol >= size);
  }

  // still inside row → just move horizontally
  if (!atEdge) {
    return { row, col: nextCol };
  }

  // === reached end of the lane → vertical move(s) ===

  if (color === 'blue') {
    // blue starts at 3, enemy is 0
    if (row === 0) {
      // wrap around enemy row → go back to 3
      return { row: 3, col };
    }
    if (row === 1) {
      // this is EXACTLY your screenshot case:
      // blue leaving row 1 can go UP (0) or DOWN (2)
      return [
        { row: 0, col },
        { row: 2, col },
      ];
    }
    // normal blue (from 3 or 2): just go up
    return { row: row - 1, col };
  } else {
    // RED
    // red starts at 0, enemy is 3
    if (row === 3) {
      // wrap around enemy row → go back to 0
      return { row: 0, col };
    }
    if (row === 2) {
      // red leaving row 2 can go DOWN (3) or UP (1)
      return [
        { row: 3, col },
        { row: 1, col },
      ];
    }
    // normal red (from 0 or 1): just go down
    return { row: row + 1, col };
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

  // 1st-move rule
  if (!piece.hasMoved && dice !== 1) {
    if (!silent) showMessage('Esta peça ainda não se mexeu, precisa de 1 no dado.');
    return null;
  }

  // cannot leave opposite row if start row still has pieces
  const isOppositeRow = (color === 'blue') ? (row === 0) : (row === 3);
  if (isOppositeRow && anyInStartRow(color)) {
    if (!silent) showMessage('Ainda tens peças na linha inicial, não podes avançar esta.');
    return null;
  }

  // we start from one position
  let positions = [{ row, col }];

  // walk dice steps
  for (let s = 0; s < dice; s++) {
    const nextPositions = [];
    for (const pos of positions) {
      const step = moveStep(pos.row, pos.col, size, color);

      if (Array.isArray(step)) {
        // branch
        step.forEach(p => nextPositions.push(p));
      } else {
        nextPositions.push(step);
      }
    }
    positions = nextPositions;
  }

  // remove cells with own piece
  const validDests = positions.filter(p => {
    const target = gameState.board[p.row][p.col];
    return !target || target.color !== color;
  });

  if (validDests.length === 0) {
    if (!silent) showMessage('Casa ocupada pela tua peça.');
    return null;
  }

  // ------ IMPORTANT PART FOR AI ------
  if (silent) {
    // AI just wants ONE cell → give the first valid
    const chosen = validDests[0];

    // update meta (optional)
    const meta = map.get(piece);
    if (meta) {
      meta.destRow = chosen.row;
      meta.destCol = chosen.col;
      meta.hasMove = true;
    }

    return chosen;   // ALWAYS an object here
  }
  // ------ END AI PART ------

  // human → show all options
  const meta = map.get(piece);
  if (meta) {
    if (validDests.length === 1) {
      meta.destRow = validDests[0].row;
      meta.destCol = validDests[0].col;
    } else {
      meta.destRow = null;
      meta.destCol = null;
    }
    meta.hasMove = true;
  }

  // highlight origin
  const originCell = document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );
  if (originCell) originCell.classList.add('highlight-select');

  // highlight ALL destinations
  validDests.forEach(d => {
    const destCell = document.querySelector(
      `.cell[data-row="${d.row}"][data-col="${d.col}"]`
    );
    if (destCell) destCell.classList.add('highlight-move');
  });

  // store all options for click
  gameState.movePreview = {
    from: { row, col },
    piece,
    options: validDests,
  };

  // for human: if only one, return object; if several, return array
  return validDests.length === 1 ? validDests[0] : validDests;
}



function applyMove(move) {
  const { from, to, piece } = move;

  const target = gameState.board[to.row][to.col];
  if (target && target.color === piece.color) {
    showMessage('Casa ocupada pela tua peça.');
    return;
  }

  if(target && target.color !== piece.color){
    const adversaryMap = getAdversaryMapColor(piece.color);
    adversaryMap.delete(target);
  }
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

