let gameState = {
  size: 7,
  currentPlayer: 'human',
  board: [],
  diceValue: null,
};

function initGame(size) {
  gameState.size = size;
  gameState.board = initPieces(size);
  gameState.currentPlayer = 'human';
}

function initPieces(size) {
  return Array.from({ length: 4 }, () => Array(size).fill(null));
}

function nextTurn() {
  gameState.currentPlayer = (gameState.currentPlayer === 'human') ? 'ai' : 'human';
  showMessage(`Vez do ${gameState.currentPlayer === 'human' ? 'Jogador' : 'Computador'}`);
  if (gameState.currentPlayer === 'ai') aiMove();
}
