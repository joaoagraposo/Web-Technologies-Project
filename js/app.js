// app.js
window.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const rollDiceBtn = document.getElementById('rollDiceBtn');
  const passTurnBtn = document.getElementById('passTurnBtn');
  const giveUpBtn = document.getElementById('giveUpBtn');

  startBtn.addEventListener('click', startGame);
  rollDiceBtn.addEventListener('click', rollDice);
  passTurnBtn.addEventListener('click', passTurn);
  giveUpBtn.addEventListener('click', giveUp);

  initScoreboard();
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
  if (gameState.currentPlayer !== 'human') return;

  if (canAnyBlueMove()) {
    showMessage("Ainda tens uma jogada válida, não podes passar.");
    return;
  }

  gameState.diceValue = null;
  document.getElementById('diceResult').innerText = '';
  
  showMessage("Vez passada.");
  nextTurn();
}

function giveUp() {
  if (!confirm("Tens a certeza que queres desistir?")) return;

  showMessage("Jogador desistiu. O computador venceu!");
  
  // Disable further interactions
  gameState.currentPlayer = null;

  // Disable buttons
  document.getElementById("rollDiceBtn").disabled = true;
  document.getElementById("passTurnBtn").disabled = true;
  document.getElementById("giveUpBtn").disabled = true;

  // Optional: gray out the board
  document.querySelectorAll(".cell").forEach(c => {
    c.style.pointerEvents = "none";
    c.style.opacity = "0.6";
  });

  saveScore("Humano", "Desistiu");

}
