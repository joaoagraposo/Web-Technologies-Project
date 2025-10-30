let gameState = {
  size: 7,
  currentPlayer: 'human',
  board: [],
  diceValue: null,
  move: null,
  extramove: null,
  selectedPiece: null,
  redpices: new Map(),
  bluepieces : new Map(),
};

class Piece {
  constructor(color, dest) {
    this.color = color;
    this.hasmove = hasmove;
    this.destrow = destrow;
    this.destcol = destcol;
  }

}

function changeSize(delta){
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
  gameState.redpices = size;
  gameState.bluepieces = size;
  gameState.currentPlayer = document.getElementById('firstPlayer');
  renderPieces(gameState.board)
}

function initPieces(size) {
  const board = Array.from({ length: 4 }, () => Array(size).fill(null));
  
    for (let col = 0; col < size; col++) {
      const piece = new Piece ('red', null);
      gameState.redpices.set(piece, piece.dest);
      board[0][col] = piece; 
    }

    for (let col = 0; col < size; col++) {
      const piece = new Piece ('blue', null)
      gameState.bluepieces.set(piece, piece.dest);
      board[3][col] = piece; 
    }
    return board;
}
z
function nextTurn() {
  if(gameState.move === 2){
    gameState.move = null;
    gameState.diceValue = null;
  }
  else{
  gameState.currentPlayer = (gameState.currentPlayer === 'human') ? 'ai' : 'human';
  showMessage(`Vez do ${gameState.currentPlayer === 'human' ? 'Jogador' : 'Computador'}`);
  if (gameState.currentPlayer === 'ai') aiMove();
  }  
}
            
