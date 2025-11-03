// constrói a grelha do tabuleiro e associa os handlers de clique
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

// desenha as peças nas posições atuais do tabuleiro
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

// trata cliques nas casas: selecionar peça ou confirmar destino
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

// indica se a linha é “de avanço” para a cor dada
function isForwardRow(row, color) {
  if (color === 'blue') return row === 3 || row === 1;
  return row === 0 || row === 2;
}

// avança um passo a partir de uma posição seguindo as regras do Tâb
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

  if (color === 'blue') {
    if (row === 0) {
      return { row: 3, col };
    }
    if (row === 1) {
      return [
        { row: 0, col },
        { row: 2, col },
      ];
    }
    return { row: row - 1, col };
  } else {
    if (row === 3) {
      return { row: 0, col };
    }
    if (row === 2) {
      return [
        { row: 3, col },
        { row: 1, col },
      ];
    }
    return { row: row + 1, col };
  }
}

// destaca visualmente origem e destino de uma jogada
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

// calcula destinos válidos para a peça e mostra opções ao jogador
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

  const validDests = positions.filter(p => {
    const target = gameState.board[p.row][p.col];
    return !target || target.color !== color;
  });

  if (validDests.length === 0) {
    if (!silent) showMessage('Casa ocupada pela tua peça.');
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

// aplica uma jogada: move a peça, trata capturas e jogadas extra
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

// verifica se existe pelo menos uma jogada válida para a cor atual
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
