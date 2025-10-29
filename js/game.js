let gameState = {
  size: 7,
  currentPlayer: 'human',
  board: [],
  diceValue: null,
  move: null,
  extramove: null,
  selectedPiece: null,
};
// move pode  ser 0 1 2, 2 signfica q pode repete jogada

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
  gameState.currentPlayer = 'human';
  renderPieces(gameState.board)
}

function initPieces(size) {
  const board = Array.from({ length: 4 }, () => Array(size).fill(null));
  
    for (let col = 0; col < size; col++) {
      board[0][col] = 'red'; 
    }

    for (let col = 0; col < size; col++) {
      board[3][col] = 'blue'; 
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
            
