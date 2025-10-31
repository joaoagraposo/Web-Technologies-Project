window.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const rollDiceBtn = document.getElementById('rollDiceBtn');
  const passTurnBtn = document.getElementById('passTurnBtn');
  const giveUpBtn = document.getElementById('giveUpBtn');

  startBtn.addEventListener('click', startGame);
  rollDiceBtn.addEventListener('click', rollDice);
  passTurnBtn.addEventListener('click', passTurn);
  giveUpBtn.addEventListener('click', giveUp);
});

function startGame() {
  const size = parseInt(document.getElementById('boardSize').value);
  createBoard(size);
  initGame(size);
  showMessage("Jogo iniciado!");
}

function showMessage(msg) {
  document.getElementById('messageArea').innerText = msg;
}

function passTurn() {
  showMessage("Vez passada.");
  nextTurn();
}

function giveUp() {
  showMessage("Jogador desistiu.");
}
