// inicializa a aplicação, menus, login e configurações do jogo
window.addEventListener("DOMContentLoaded", () => {
  console.log("App initialized");

  const userIcon = document.getElementById("userIcon");
  const userMenu = document.getElementById("userMenu");
  const userCorner = document.getElementById("userCorner");

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const usernameDisplay = document.getElementById("usernameDisplay");
  const loginText = document.getElementById("loginText");
  const loginBox = document.getElementById("loginBox");

  if (userIcon) {
    userIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("hidden");
    });
  }

  document.addEventListener("click", (e) => {
    if (!userCorner.contains(e.target)) {
      userMenu.classList.add("hidden");
    }
  });

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const user = document.getElementById("username").value.trim();
      if (user === "") {
        alert("Por favor, introduz um nome de utilizador.");
        return;
      }

      loginText.classList.add("hidden");
      usernameDisplay.classList.remove("hidden");
      usernameDisplay.textContent = `Bem-vindo, ${user}!`;

      loginBox.classList.add("hidden");
      logoutBtn.classList.remove("hidden");

      showMessage(`Bem-vindo, ${user}!`);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      loginText.classList.remove("hidden");
      usernameDisplay.classList.add("hidden");
      loginBox.classList.remove("hidden");
      logoutBtn.classList.add("hidden");
      document.getElementById("username").value = "";
      document.getElementById("password").value = "";
    });
  }

  const rollDiceBtn = document.getElementById("rollDiceBtn");
  const passTurnBtn = document.getElementById("passTurnBtn");
  const giveUpBtn = document.getElementById("giveUpBtn");
  const closeButtons = document.querySelectorAll(".closePanel");

  if (rollDiceBtn) rollDiceBtn.disabled = true;
  if (passTurnBtn) passTurnBtn.disabled = true;
  if (giveUpBtn) giveUpBtn.disabled = true;

  if (rollDiceBtn) rollDiceBtn.addEventListener("click", rollDice);
  if (passTurnBtn) passTurnBtn.addEventListener("click", passTurn);
  if (giveUpBtn) giveUpBtn.addEventListener("click", giveUp);

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".panel");
      if (panel) panel.classList.add("hidden");
    });
  });

  if (typeof initScoreboard === "function") initScoreboard();

  const configPopup = document.getElementById("configPopup");
  const confirmConfigBtn = document.getElementById("confirmConfig");
  const closeConfigBtn = document.getElementById("closeConfig");

  if (configPopup) configPopup.classList.remove("hidden");

  if (confirmConfigBtn) {
    confirmConfigBtn.addEventListener("click", () => {
      configPopup.classList.add("hidden");
      userMenu.classList.add("hidden");
      startGame();
    });
  }

  if (closeConfigBtn) {
    closeConfigBtn.addEventListener("click", () => {
      configPopup.classList.add("hidden");
    });
  }

  const openConfigBtn = document.getElementById("openConfig");
  const openRulesBtn = document.getElementById("openRules");
  const openScoresBtn = document.getElementById("openScores");

  if (openConfigBtn) {
    openConfigBtn.addEventListener("click", () => {
      userMenu.classList.add("hidden");
      configPopup.classList.remove("hidden");
    });
  }

  if (openRulesBtn) {
    openRulesBtn.addEventListener("click", () => {
      userMenu.classList.add("hidden");
      const p = document.getElementById("rulesPanel");
      if (p) p.classList.remove("hidden");
    });
  }

  if (openScoresBtn) {
    openScoresBtn.addEventListener("click", () => {
      userMenu.classList.add("hidden");
      if (typeof loadScores === "function") loadScores();
      const p = document.getElementById("scoresPanel");
      if (p) p.classList.remove("hidden");
    });
  }

  console.log("Menus e login configurados, popup ativo.");
});

// inicia um novo jogo com as opções escolhidas
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

  document.getElementById("rollDiceBtn").disabled = false;
  document.getElementById("passTurnBtn").disabled = false;
  document.getElementById("giveUpBtn").disabled = false;

  showMessage("Jogo iniciado!");
}

// mostra uma mensagem na área do jogo
function showMessage(msg) {
  const area = document.getElementById("messageArea");
  if (area) area.innerText = msg;
}

// tenta passar a vez, se não houver jogadas válidas
function passTurn() {
  if (gameState.diceValue === null) {
    showMessage("Tens de lançar o dado antes de passar a vez.");
    return;
  }

  if (gameState.extramove === true) {
    gameState.extramove = false;
    gameState.diceValue = null;
    document.getElementById('diceResult').innerText = '';
    showMessage("Jogada extra cancelada. Continua a tua vez.");
    return;
  }

  const color = gameState.currentColor;

  if (canAnyMove(color)) {
    showMessage("Ainda tens uma jogada válida, não podes passar.");
    return;
  }

  showMessage("Vez passada.");
  gameState.diceValue = null;
  document.getElementById('diceResult').innerText = '';
  nextTurn();
}

// termina o jogo porque o jogador desistiu
function giveUp() {
  if (!confirm("Tens a certeza que queres desistir?")) return;

  showMessage("Jogador desistiu. O computador venceu!");
  gameState.currentPlayer = null;

  document.getElementById("rollDiceBtn").disabled = true;
  document.getElementById("passTurnBtn").disabled = true;
  document.getElementById("giveUpBtn").disabled = true;

  document.querySelectorAll(".cell").forEach((c) => {
    c.style.pointerEvents = "none";
    c.style.opacity = "0.6";
  });

  if (typeof saveScore === "function") saveScore("Humano", "Desistiu");
}
