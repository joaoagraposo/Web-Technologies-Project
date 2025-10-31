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
  const row = Number(e.currentTarget.dataset.row);
  const col = Number(e.currentTarget.dataset.col);
  const dice = gameState.diceValue;


  if (gameState.movePreview &&
      gameState.movePreview.to.row === row &&
      gameState.movePreview.to.col === col) {
    return applyMove(gameState.movePreview);
  }

  const piece = gameState.board[row][col];

  if (dice === null) return showMessage("Dice not used");
  if (gameState.currentPlayer !== 'human') return showMessage("Not your turn.");
  if (!piece) return showMessage("Empty cell.");
  if (piece.color !== 'blue') return showMessage("You can only move blue pieces.");


  computeDestination(row, col, dice, piece, gameState.size);
  if (piece.dest !== null){
    
  }


}

/* ======== LÓGICA DE CAMINHO TÂB ======== */

// linha que anda ESQUERDA -> DIREITA
function isForwardRow(row) {
  // aqui decidi: 3 e 1 vão para a direita
  return row === 3 || row === 1;
}

function computeDestination(row, col, dice, piece, size) {
  // 1) regra: primeira vez tem de ser 1
  if (!piece.hasMoved && dice !== 1) {
    showMessage('Esta peça ainda não se mexeu, precisa de 1 no dado.');
    return;
  }

  // 2) regra: se já está no topo, só mexe se a base estiver livre
  if (row === 0 && anyBlueInStartRow()) {
    showMessage(
      'Tens peças na linha inicial (row 3), não podes avançar com as que estão no topo.'
    );
    return;
  }

  let curRow = row;
  let curCol = col;
  let steps = dice;

  // anda "dice" passos
  while (steps > 0) {
    if (isForwardRow(curRow)) {
      ({ row: curRow, col: curCol } = evenMove(curRow, curCol, size));
    } else {
      ({ row: curRow, col: curCol } = oddMove(curRow, curCol, size));
    }
    steps--;
  }

  // guardar destino na peça
  piece.destRow = curRow;
  piece.destCol = curCol;
  piece.hasMove = true;

  // guardar também no map da cor (opcional mas útil)
  const map =
    piece.color === 'blue' ? gameState.bluePieces : gameState.redPieces;
  const meta = map.get(piece);
  if (meta) {
    meta.destRow = curRow;
    meta.destCol = curCol;
    meta.hasMove = true;
  }

  // pintar origem e destino
  const originCell = document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );
  if (originCell) originCell.classList.add('highlight-select');

  const destCell = document.querySelector(
    `.cell[data-row="${curRow}"][data-col="${curCol}"]`
  );
  if (destCell) destCell.classList.add('highlight-move');

  // guardar no estado para o clique seguinte saber
  gameState.movePreview = {
    from: { row, col },
    to: { row: curRow, col: curCol },
    piece,
  };
}

// esquerda -> direita; se não der, sobe
function evenMove(row, col, size) {
  if (col + 1 < size) {
    return { row, col: col + 1 };
  }
  // chegou ao fim -> sobe
  return { row: row - 1, col };
}

// direita -> esquerda; se não der, sobe
function oddMove(row, col, size) {
  if (col - 1 >= 0) {
    return { row, col: col - 1 };
  }
  return { row: row - 1, col };
}

/* ======== APLICAR O MOVIMENTO ======== */

function applyMove(move) {
  const { from, to, piece } = move;

  // se a casa destino tiver peça da mesma cor -> bloquear
  const target = gameState.board[to.row][to.col];
  if (target && target.color === piece.color) {
    showMessage('Casa ocupada pela tua peça.');
    return;
  }

  // mover no board
  gameState.board[from.row][from.col] = null;
  gameState.board[to.row][to.col] = piece;

  // marcar que já se mexeu alguma vez
  piece.hasMoved = true;

  // limpar preview
  gameState.movePreview = null;

  // redesenhar
  renderPieces(gameState.board);

  // limpar highlights
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('highlight-select', 'highlight-move');
  });

  // gerir extra-move do dado
  if (gameState.extramove) {
    gameState.extramove = false;
    gameState.diceValue = null;
    return;
  }

  // fim do turno normal
  gameState.diceValue = null;
  nextTurn();
}