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


    const token = document.createElement('div');
    token.className = `piece ${occupant.color}`; 
    token.setAttribute('aria-label', `${occupant.color} piece`);

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
  if (piece !== 'blue') return showMessage("You can only move blue pieces.");


  computeDestination(row, col, dice, piece, gameState.size);
  if (piece.dest !== null){
    
  }
  

}

function computeDestination(row, col, dice, piece, size){

}

function evenMove (dice){
  
  return dice
}

function oddMove (dice){

}

function checkWin(){

}