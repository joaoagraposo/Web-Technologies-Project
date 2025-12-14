// constrói a grelha do tabuleiro e associa os handlers de clique
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

// desenha as peças nas posições atuais do tabuleiro
function renderPieces(boardState) {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);

    const occupant = boardState[r][c];

    // Remover classes de highlight antigas
    cell.classList.remove('highlight-select', 'highlight-move', 'highlight-opponent');

    // Se não há ocupante, limpar conteúdo da célula
    if (!occupant) {
      if (cell.firstChild) cell.innerHTML = '';
      return;
    }

    const color = typeof occupant === 'string' ? occupant : occupant.color;

    // Obter ou criar o token da peça
    let token = cell.querySelector('.piece');

    // Se não existir ou for da cor errada, recriar
    if (!token || !token.classList.contains(color)) {
      cell.innerHTML = ''; // Limpar conteúdo antigo
      token = document.createElement('div');
      token.className = `piece ${color}`;
      token.setAttribute('aria-label', `${color} piece`);
      cell.appendChild(token);
    }

    // Atualizar classes de estado visual sem recriar o elemento
    // Remover classes de estado antigas
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

// trata cliques nas casas: selecionar peça ou confirmar destino
function onCellClick(e) {
  // Verificar se é modo online e se é a vez do jogador
  if (onlineState.isOnline && !onlineState.myTurn) {
    showMessage("Não é a tua vez.");
    return;
  }

  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('highlight-select', 'highlight-move');
  });

  const row = Number(e.currentTarget.dataset.row);
  const col = Number(e.currentTarget.dataset.col);
  const dice = gameState.diceValue;
  const piece = gameState.board[row][col];

  if (dice === null) return showMessage("Ainda não lançaste o dado.");
  if (gameState.currentPlayer !== 'human') return showMessage("Não é a tua vez.");

  // No modo online, delegar lógica para o servidor (seleção e movimento)
  if (onlineState.isOnline) {
    const squareIndex = row * gameState.size + col;

    // Enviar notificação para o servidor
    // O servidor gere o estado (from -> to) e valida
    const moveData = {
      cell: {
        square: squareIndex,
        position: squareIndex
      }
    };

    window.server.notify(
      onlineState.gameId,
      onlineState.nick,
      onlineState.password,
      moveData
    ).then(res => {
      if (res.error) showMessage(res.error);
      // O update SSE tratará de atualizar o tabuleiro
    }).catch(err => {
      showMessage("Erro de comunicação ao selecionar/mover.");
    });

    return; // Ignorar lógica local
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

  // Transições entre linhas quando chega à extremidade
  if (color === 'blue') {
    // Blue: 1ª=row3, 2ª=row2, 3ª=row1, 4ª=row0
    if (row === 0) {
      // 4ª linha → volta para 3ª linha (row 1)
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
    // Red: 1ª=row0, 2ª=row1, 3ª=row2
    // REGRA: Red NUNCA pode entrar na 4ª linha (row 3)
    if (row === 3) {
      // Se red estiver em row 3 (não deveria acontecer), volta para row 2
      return { row: 2, col };
    }
    if (row === 2) {
      // 3ª linha → só pode ir para 2ª linha (row 1)
      // Red não pode ir para a 4ª linha (row 3)
      return { row: 1, col };
    }
    // row 1 (2ª) → row 2 (3ª), row 0 (1ª) → row 1 (2ª)
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

  // Filtrar destinos válidos
  let validDests = positions.filter(p => {
    const target = gameState.board[p.row][p.col];
    return !target || target.color !== color;
  });

  // Regra: "As peças entram apenas uma vez na 4ª linha"
  // Só bloquear reentrada se a peça JÁ SAIU da 4ª linha (não se ainda está lá)
  const lastRow = (color === 'blue') ? 0 : 3;
  const currentlyInLastRow = (row === lastRow);

  if (piece.hasVisitedLastRow && !currentlyInLastRow) {
    // Peça já visitou E já saiu da 4ª linha, não pode voltar
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

// aplica uma jogada: move a peça, trata capturas e jogadas extra
async function applyMove(move) {
  const { from, to, piece } = move;

  // Modo online - notificar servidor
  if (onlineState.isOnline) {
    if (!onlineState.myTurn) {
      showMessage("Não é a tua vez.");
      return;
    }

    // Converter row,col para índice linear da célula
    const squareIndex = to.row * gameState.size + to.col;

    // Estrutura exigida pelo enunciado
    const moveData = {
      cell: {
        square: squareIndex,
        position: squareIndex // Simplificação (assumindo 1 peça/casa)
      }
    };

    try {
      const res = await window.server.notify(
        onlineState.gameId,
        onlineState.nick,
        onlineState.password,
        moveData
      );

      if (res.error) {
        showMessage("Erro ao mover: " + res.error);
      }
    } catch (err) {
      showMessage("Erro de rede ao notificar jogada.");
    }

    // Limpar preview
    gameState.movePreview = null;
    document.querySelectorAll('.cell').forEach(c => {
      c.classList.remove('highlight-select', 'highlight-move');
    });

    // O tabuleiro será atualizado pelo próximo update()
    return;
  }

  // Modo local (lógica original)
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

  // Verificar se a peça chegou à 4ª linha (última linha do adversário)
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
