// builds the board grid and associates click handlers
function createBoard(size) {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${size}, 80px)`;

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

// draws the pieces at current board positions
function renderPieces(boardState, playerColor) {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    let r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);

    const occupant = boardState[r][c];

    // Remove old highlight classes
    cell.classList.remove('highlight-select', 'highlight-move', 'highlight-opponent');

    // If no occupant, clear cell content
    if (!occupant) {
      if (cell.firstChild) cell.innerHTML = '';
      return;
    }

    const color = typeof occupant === 'string' ? occupant : occupant.color;

    // Get or create piece token
    let token = cell.querySelector('.piece');

    // If it doesn't exist or is wrong color, recreate
    if (!token || !token.classList.contains(color)) {
      cell.innerHTML = ''; // Clear old content
      token = document.createElement('div');
      token.className = `piece ${color}`;
      token.setAttribute('aria-label', `${color} piece`);
      cell.appendChild(token);
    }

    // Update visual state classes without recreating element
    token.classList.remove('last-row', 'moved', 'not-moved');

    if (typeof occupant === 'object') {
      if (occupant.hasVisitedLastRow) {
        token.classList.add('last-row');
      } else if (occupant.hasMoved) {
        token.classList.add('moved');
      } else {
        token.classList.add('not-moved');
      }
    }
  });
}

// handles cell clicks: select piece or confirm destination
function onCellClick(e) {
  // Check if online mode and if it's player's turn
  if (onlineState.isOnline && !onlineState.myTurn) {
    showMessage("Não é a tua vez.");
    return;
  }

  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('highlight-select', 'highlight-move');
  });

  let row = Number(e.currentTarget.dataset.row);
  const col = Number(e.currentTarget.dataset.col);

  const dice = gameState.diceValue;
  const piece = gameState.board[row][col];

  if (dice === null) return showMessage("Ainda não lançaste o dado.");
  if (gameState.currentPlayer !== 'human') return showMessage("Não é a tua vez.");

  // In online mode, delegate logic to server (selection and movement)
  if (onlineState.isOnline) {
    const squareIndex = row * gameState.size + col;
    console.log(`[DEBUG] Click at (${row}, ${col}) -> Index ${squareIndex}. Current Step: ${gameState.step || 'unknown'}`);

    // Send notification to server
    // Server manages state (from -> to) and validates
    window.server.notify(
      onlineState.gameId,
      onlineState.nick,
      onlineState.password,
      squareIndex // Send only cell index (integer)
    ).then(res => {
      console.log("[DEBUG] Notify response:", res);
      if (res.error) showMessage(res.error);
      // SSE update will handle board refresh
    }).catch(err => {
      showMessage("Erro de comunicação ao selecionar/mover.");
    });

    return; // Ignore local logic
  }

  let humanColor = gameState.players.human;

  if (gameState.movePreview) {
    const { from, options, piece: previewPiece } = gameState.movePreview;

    const chosen = options.find(o => o.row === row && o.col === col);
    if (chosen) {
      gameState.movePreview = null;
      return applyMove({
        from,
        to: chosen,
        piece: previewPiece,
      });
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

// indicates if row is "forward" for given color
// Red (Row 0): Left (<--), Row 1: Right (-->), Row 2: Left (<--), Row 3: Right (-->)
// Blue (Row 3): Right (-->), Row 2: Left (<--), Row 1: Right (-->), Row 0: Left (<--)
function isForwardRow(row, color) {
  if (color === 'blue') return row === 3 || row === 1;
  // Red: Row 0 (Home) moves Left (Forward), Row 1 moves Right (Backward), Row 2 moves Left (Forward)...
  if (color === 'red') return row === 0 || row === 2;
  return false;
}

// advances one step from a position following Tâb rules
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

  if (!atEdge) {
    return { row, col: nextCol };
  }

  // Row transitions when reaching edge
  if (color === 'blue') {
    // Blue: 1ª=row3, 2ª=row2, 3ª=row1, 4ª=row0
    if (row === 0) {
      // 4ª linha (Last) → volta para 3ª linha (row 1)
      return { row: 1, col };
    }
    if (row === 1) {
      // 3ª linha → pode ir para 4ª (row 0) OU 2ª (row 2)
      return [
        { row: 0, col },
        { row: 2, col },
      ];
    }
    // row 2 (2ª) → row 1 (3ª), row 3 (1ª) → row 2 (2ª)
    return { row: row - 1, col };
  } else {
    // Red: 1ª=row0, 2ª=row1, 3ª=row2, 4ª=row3
    if (row === 3) {
      // 4ª linha (Last) → volta para 3ª linha (row 2)
      return { row: 2, col };
    }
    if (row === 2) {
      // 3ª linha → pode ir para 4ª (row 3) OU 2ª (row 1)
      return [
        { row: 3, col },
        { row: 1, col },
      ];
    }
    // row 1 (2ª) → row 2 (3ª), row 0 (1ª) → row 1 (2ª)
    return { row: row + 1, col };
  }
}

// visually highlights origin and destination of a move
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

// calculates valid destinations for piece and shows options to player
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

  let positions = [{ row, col }];

  for (let s = 0; s < dice; s++) {
    const nextPositions = [];
    for (const pos of positions) {
      const step = moveStep(pos.row, pos.col, size, color);

      if (Array.isArray(step)) {
        step.forEach(p => nextPositions.push(p));
      } else {
        nextPositions.push(step);
      }
    }
    positions = nextPositions;
  }

  // Filter valid destinations
  let validDests = positions.filter(p => {
    const target = gameState.board[p.row][p.col];
    return !target || target.color !== color;
  });

  // Rule: "Pieces enter the 4th line only once"
  // Only block reentry if piece ALREADY LEFT 4th row (not if still there)
  const lastRow = (color === 'blue') ? 0 : 3;
  const currentlyInLastRow = (row === lastRow);

  if (piece.hasVisitedLastRow && !currentlyInLastRow) {
    // Piece visited AND left 4th row, cannot return
    validDests = validDests.filter(p => p.row !== lastRow);
  }

  if (validDests.length === 0) {
    if (!silent) showMessage('Casa ocupada pela tua peça ou sem destino válido.');
    return null;
  }

  if (silent) {
    const chosen = validDests[0];

    const meta = map.get(piece);
    if (meta) {
      meta.destRow = chosen.row;
      meta.destCol = chosen.col;
      meta.hasMove = true;
    }

    return chosen;
  }

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

  const originCell = document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );
  if (originCell) originCell.classList.add('highlight-select');

  validDests.forEach(d => {
    const destCell = document.querySelector(
      `.cell[data-row="${d.row}"][data-col="${d.col}"]`
    );
    if (destCell) destCell.classList.add('highlight-move');
  });

  gameState.movePreview = {
    from: { row, col },
    piece,
    options: validDests,
  };

  return validDests.length === 1 ? validDests[0] : validDests;
}

// applies a move: moves piece, handles captures and extra moves
async function applyMove(move) {
  const { from, to, piece } = move;

  // Online mode - notify server
  if (onlineState.isOnline) {
    if (!onlineState.myTurn) {
      showMessage("Não é a tua vez.");
      return;
    }

    // Convert row,col to linear cell index
    const squareIndex = to.row * gameState.size + to.col;

    // Structure required by spec (integer only)
    try {
      const res = await window.server.notify(
        onlineState.gameId,
        onlineState.nick,
        onlineState.password,
        squareIndex
      );

      if (res.error) {
        showMessage("Erro ao mover: " + res.error);
      }
    } catch (err) {
      showMessage("Erro de rede ao notificar jogada.");
    }

    // Clear preview
    gameState.movePreview = null;
    document.querySelectorAll('.cell').forEach(c => {
      c.classList.remove('highlight-select', 'highlight-move');
    });

    // Board will be updated by next update()
    return;
  }

  // Local mode (original logic)
  const target = gameState.board[to.row][to.col];
  if (target && target.color === piece.color) {
    showMessage('Casa ocupada pela tua peça.');
    return;
  }

  if (target && target.color !== piece.color) {
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

  // Check if piece reached 4th row (opponent's last row)
  const lastRow = (piece.color === 'blue') ? 0 : 3;
  if (to.row === lastRow) {
    piece.hasVisitedLastRow = true;
  }

  gameState.movePreview = null;

  renderPieces(gameState.board);

  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('highlight-select', 'highlight-move');
  });

  if (checkWin()) return;

  if (gameState.extramove) {
    if (gameState.currentPlayer === "ai") {
      gameState.extramove = false;
      showMessage(`IA ganhou jogada extra!`);
      gameState.diceValue = null;
      document.getElementById('diceResult').innerText = '';
      console.log("AI earned an extra move → starting next AI roll...");
      return setTimeout(() => aiMove(), 800);
    } else {
      gameState.extramove = false;
      showMessage(`Saiu: ${gameState.diceValue}, tens direito a mais uma jogada`);
      gameState.diceValue = null;
      document.getElementById('diceResult').innerText = '';
      return;
    }
  }

  nextTurn();
}

// verifies if there is at least one valid move for current color
function canAnyMove(color) {
  const dice = gameState.diceValue;
  console.log(`[DEBUG] canAnyMove: color=${color}, dice=${dice}`);

  if (dice === null) return false;

  const map = getPiecesMapByColor(color);
  console.log(`[DEBUG] map has ${map.size} pieces`);

  for (const [piece, meta] of map) {
    const dest = computeDestination(meta.row, meta.col, dice, piece, gameState.size, true);
    console.log(`[DEBUG] Piece at (${meta.row},${meta.col}), hasMoved=${piece.hasMoved}, dest=${dest ? JSON.stringify(dest) : 'null'}`);

    if (!dest) continue;

    const target = gameState.board[dest.row][dest.col];
    if (!target || target.color !== color) {
      console.log(`[DEBUG] Found valid move to (${dest.row},${dest.col})`);
      return true;
    } else {
      console.log(`[DEBUG] Blocked by own piece at (${dest.row},${dest.col})`);
    }
  }

  console.log(`[DEBUG] No moves found`);
  return false;
}
