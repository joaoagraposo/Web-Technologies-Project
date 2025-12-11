// representação de uma peça do tabuleiro
class Piece {
  constructor(color) {
    this.color = color;
    this.hasMoved = false;        // já foi movida pelo menos uma vez
    this.hasVisitedLastRow = false; // já esteve na 4ª linha (última)
  }
}

let gameState = {
  size: 7,
  board: [],
  diceValue: null,
  move: null,
  extramove: null,
  selectedPiece: null,
  currentPlayer: 'human',
  currentColor: 'blue',
  players: {
    human: 'blue',
    ai: 'red',
  },

  redPieces: new Map(),
  bluePieces: new Map(),
};

// altera o valor do input de tamanho do tabuleiro
function changeSize(delta) {
  const input = document.getElementById('boardSize');
  const min = parseInt(input.min);
  const max = parseInt(input.max);
  let value = parseInt(input.value);
  value = Math.min(max, Math.max(min, value + delta));
  input.value = value;
}

// repõe a interface para estado jogável num novo jogo
function resetGameUI() {
  document.getElementById("rollDiceBtn").disabled = false;
  document.getElementById("passTurnBtn").disabled = false;
  document.getElementById("giveUpBtn").disabled = false;

  document.querySelectorAll(".cell").forEach(c => {
    c.style.pointerEvents = "auto";
    c.style.opacity = "1";
  });

  document.getElementById('messageArea').innerText = '';
  document.getElementById('diceResult').innerText = '';
}

// inicializa o estado e as peças para uma partida
function initGame(size, config) {
  showMessage("Novo Jogo Iniciado.");
  resetGameUI();

  gameState.size = size;
  gameState.board = initPieces(size);

  gameState.currentPlayer = config.firstPlayer;
  gameState.players = {
    human: config.humanColor,
    ai: config.aiColor,
  };
  gameState.currentColor = gameState.players[gameState.currentPlayer];

  gameState.diceValue = null;
  gameState.move = null;
  gameState.extramove = null;
  gameState.selectedPiece = null;
  gameState.movePreview = null;

  renderPieces(gameState.board);

  document.getElementById('diceResult').innerText =
    `Lance o dado, ${gameState.currentPlayer}`;
}

// cria as peças iniciais nas linhas 0 e 3
function initPieces(size) {
  const board = Array.from({ length: 4 }, () => Array(size).fill(null));

  gameState.redPieces = new Map();
  gameState.bluePieces = new Map();

  for (let col = 0; col < size; col++) {
    const piece = new Piece('red');
    board[0][col] = piece;
    gameState.redPieces.set(piece, {
      row: 0,
      col: col,
      hasMove: false,
      destRow: null,
      destCol: null,
    });
  }

  for (let col = 0; col < size; col++) {
    const piece = new Piece('blue');
    board[3][col] = piece;
    gameState.bluePieces.set(piece, {
      row: 3,
      col: col,
      hasMove: false,
      destRow: null,
      destCol: null,
    });
  }

  return board;
}

// devolve o mapa de peças do adversário
function getAdversaryMapColor(color) {
  return color === 'blue' ? gameState.redPieces : gameState.bluePieces;
}

// devolve o mapa de peças da cor indicada
function getPiecesMapByColor(color) {
  return color === 'blue' ? gameState.bluePieces : gameState.redPieces;
}

// devolve a linha inicial para a cor dada
function getStartRowByColor(color) {
  return color === 'blue' ? 3 : 0;
}

// verifica se existe alguma peça dessa cor na linha inicial
function anyInStartRow(color) {
  const map = getPiecesMapByColor(color);
  const startRow = getStartRowByColor(color);
  for (const [, meta] of map) {
    if (meta.row === startRow) return true;
  }
  return false;
}

// alterna a vez entre humano e IA
function nextTurn() {
  gameState.currentPlayer =
    gameState.currentPlayer === 'human' ? 'ai' : 'human';

  gameState.currentColor = gameState.players[gameState.currentPlayer];

  gameState.diceValue = null;
  const diceEl = document.getElementById('diceResult');
  if (diceEl) diceEl.innerText = '';

  showMessage(
    `Vez do ${gameState.currentPlayer === 'human' ? 'Jogador' : 'Computador'} (${gameState.currentColor})`
  );

  if (gameState.currentPlayer === 'ai') {
    aiMove();
  }
}

// verifica condição de vitória e termina o jogo se aplicável
function checkWin() {
  let hasBlue = false;
  let hasRed = false;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < gameState.size; c++) {
      const p = gameState.board[r][c];
      if (!p) continue;
      if (p.color === "blue") hasBlue = true;
      if (p.color === "red") hasRed = true;
    }
  }

  if (!hasBlue || !hasRed) {
    const winnerColor = hasBlue ? "blue" : "red";
    const winnerName =
      winnerColor === gameState.players.human ? "Humano" : "Computador";

    showMessage(`Jogo terminado! ${winnerName} venceu!`);
    console.log(`Winner: ${winnerName}`);

    document.getElementById("rollDiceBtn").disabled = true;
    document.getElementById("passTurnBtn").disabled = true;
    document.getElementById("giveUpBtn").disabled = true;
    document.querySelectorAll(".cell").forEach((c) => {
      c.style.pointerEvents = "none";
      c.style.opacity = "0.6";
    });

    saveScore(winnerName, "Vitória");

    // Mostrar popup de configuração após 2 segundos para iniciar novo jogo
    setTimeout(() => {
      const configPopup = document.getElementById("configPopup");
      if (configPopup) {
        configPopup.classList.remove("hidden");
      }
    }, 1500);

    return true;
  }
  return false;
}
