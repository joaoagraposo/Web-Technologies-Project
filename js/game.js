let gameState = {
  size: 7,
  currentPlayer: 'human',
  board: [],
  diceValue: null,
  move: null,
  extramove: null,
  selectedPiece: null,
  redPieces: new Map(),
  bluePieces: new Map(),
};

class Piece {
  constructor(color, dest = null) {
    this.color = color;  
    this.dest = dest;     
    this.hasMoved = false;  
    this.destRow = null;    
    this.destCol = null;
  }
}

function changeSize(delta) {
  const input = document.getElementById('boardSize');
  const min = parseInt(input.min);
  const max = parseInt(input.max);
  let value = parseInt(input.value);
  value = Math.min(max, Math.max(min, value + delta));
  input.value = value;
}

function initGame(size) {
  gameState.size = size;
  gameState.board = initPieces(size);
  gameState.currentPlayer = document.getElementById('firstPlayer').value;
  gameState.diceValue = null;
  gameState.move = null;
  gameState.extramove = null;
  gameState.selectedPiece = null;
  gameState.movePreview = null;
  renderPieces(gameState.board);
}

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

function nextTurn() {
  if (gameState.move === 2) {
    gameState.move = null;
    gameState.diceValue = null;
  } else {
    gameState.currentPlayer =
      gameState.currentPlayer === 'human' ? 'ai' : 'human';
    showMessage(
      `Vez do ${gameState.currentPlayer === 'human' ? 'Jogador' : 'Computador'}`
    );
    if (gameState.currentPlayer === 'ai') aiMove();
  }
}




function findPieceOnBoard(piece) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < gameState.size; c++) {
      if (gameState.board[r][c] === piece) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}


function anyBlueInStartRow() {
  for (const [piece] of gameState.bluePieces) {
    const pos = findPieceOnBoard(piece);
    if (pos && pos.row === 3) return true;
  }
  return false;
}

function anyRedInStartRow(){
  for (const [piece] of gameState.redPieces) {
    const pos = findPieceOnBoard(piece);
    if (pos && pos.row === 3) return true;
  }
  return false;
}


function canAnyBlueMove() {
  const dice = gameState.diceValue;
  if (dice === null) return false;

  for (const [piece, meta] of gameState.bluePieces) {
    const { row, col } = meta;

    // tenta destino em silêncio 
    const dest = computeDestination(row, col, dice, piece, gameState.size, true);
    if (!dest) continue;

    // verificar se a casa destino não está ocupada por azul
    const target = gameState.board[dest.row][dest.col];
    if (!target || target.color !== 'blue') {
      return true; 
    }
  }

  return false;
}