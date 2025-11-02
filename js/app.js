window.addEventListener("DOMContentLoaded", () => {
  // Botões
  const startBtn = document.getElementById("startBtn");
  const rollDiceBtn = document.getElementById("rollDiceBtn");
  const passTurnBtn = document.getElementById("passTurnBtn");
  const giveUpBtn = document.getElementById("giveUpBtn");
  const showRulesBtn = document.getElementById("showRulesBtn");
  const showScoresBtn = document.getElementById("showScoresBtn");
  const closeButtons = document.querySelectorAll(".closePanel");

  // Eventos principais
  startBtn.addEventListener("click", startGame);
  rollDiceBtn.addEventListener("click", rollDice);
  passTurnBtn.addEventListener("click", passTurn);
  giveUpBtn.addEventListener("click", giveUp);

  // Painel de regras
  showRulesBtn.addEventListener("click", () => {
    const p = document.getElementById("rulesPanel");
    if (p) p.classList.remove("hidden");
  });

  // Painel de classificações
  showScoresBtn.addEventListener("click", () => {
    const p = document.getElementById("scoresPanel");
    if (p) {
      if (typeof loadScores === "function") loadScores();
      p.classList.remove("hidden");
    }
  });

  // Fechar painéis
  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".panel");
      if (panel) panel.classList.add("hidden");
    });
  });

  // Inicializar tabela de pontuações
  if (typeof initScoreboard === "function") initScoreboard();

  console.log("App initialized");
});


// Funções do jogo
function startGame() {
  const size = parseInt(document.getElementById("boardSize").value);
  const firstPlayer = document.getElementById("firstPlayer").value;
  const humanColor = document.getElementById("humanColor").value;
  const aiColor = humanColor === "blue" ? "red" : "blue";

  createBoard(size);

  initGame(size, {
    firstPlayer,
    humanColor,
    aiColor,
  });

  showMessage("Jogo iniciado!");
}

function showMessage(msg) {
  document.getElementById("messageArea").innerText = msg;
}

function passTurn() {
  if (typeof window.passTurn === "function") window.passTurn();
}

function giveUp() {
  if (!confirm("Tens a certeza que queres desistir?")) return;

  showMessage("Jogador desistiu. O computador venceu!");
  gameState.currentPlayer = null;

  document.getElementById("rollDiceBtn").disabled = true;
  document.getElementById("passTurnBtn").disabled = true;
  document.getElementById("giveUpBtn").disabled = true;

  document.querySelectorAll(".cell").forEach(c => {
    c.style.pointerEvents = "none";
    c.style.opacity = "0.6";
  });

  if (typeof saveScore === "function") saveScore("Humano", "Desistiu");
}