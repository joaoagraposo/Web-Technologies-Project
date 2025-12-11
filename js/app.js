// inicializa a aplicação, menus, login e configurações do jogo
// server.js é carregado antes e expõe funções globais via window.server

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

  // Handler para alternar visibilidade do campo grupo
  const gameModeSelect = document.getElementById("gameMode");
  const groupRow = document.getElementById("groupRow");
  if (gameModeSelect) {
    gameModeSelect.addEventListener("change", () => {
      if (gameModeSelect.value === "online") {
        groupRow.classList.remove("hidden");
      } else {
        groupRow.classList.add("hidden");
      }
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const user = document.getElementById("username").value.trim();
      const pass = document.getElementById("password").value;

      if (user === "") {
        alert("Por favor, introduz um nome de utilizador.");
        return;
      }

      // Chamar servidor para registar/autenticar
      const res = await window.server.register(user, pass);
      const result = window.server.handleRegister(res);

      if (!result.ok) {
        alert("Erro de autenticação: " + result.error);
        return;
      }

      // Guardar credenciais no estado global
      onlineState.nick = user;
      onlineState.password = pass;

      loginText.classList.add("hidden");
      usernameDisplay.classList.remove("hidden");
      usernameDisplay.textContent = `Bem-vindo, ${user}!`;

      loginBox.classList.add("hidden");
      logoutBtn.classList.remove("hidden");

      showMessage(`Bem-vindo, ${user}!`);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      // Se estiver num jogo online, sair primeiro
      if (onlineState.isOnline && onlineState.gameId) {
        await window.server.leave(onlineState.gameId, onlineState.nick, onlineState.password);
        onlineState.isOnline = false;
        onlineState.pollingActive = false;
        onlineState.gameId = null;
      }

      // Limpar credenciais
      onlineState.nick = null;
      onlineState.password = null;

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
async function startGame() {
  const mode = document.getElementById("gameMode").value;
  const size = parseInt(document.getElementById("boardSize").value);

  if (mode === "online") {
    // Verificar se o utilizador está logado
    if (!onlineState.nick) {
      alert("Precisas de fazer login primeiro para jogar online!");
      return;
    }
    await startOnlineGame(size);
  } else {
    startLocalGame(size);
  }
}

// Inicia jogo local contra IA (lógica original)
function startLocalGame(size) {
  const firstPlayer = document.getElementById("firstPlayer").value;
  const humanColor = document.getElementById("humanColor").value;
  const aiColor = humanColor === "blue" ? "red" : "blue";

  onlineState.isOnline = false;
  onlineState.pollingActive = false;

  createBoard(size);
  initGame(size, {
    firstPlayer,
    humanColor,
    aiColor,
  });

  document.getElementById("rollDiceBtn").disabled = false;
  document.getElementById("passTurnBtn").disabled = false;
  document.getElementById("giveUpBtn").disabled = false;

  showMessage("Jogo local iniciado!");
}

// Inicia jogo online via matchmaking
async function startOnlineGame(size) {
  const group = parseInt(document.getElementById("groupNumber").value) || 1;

  onlineState.group = group;
  onlineState.isOnline = true;

  showMessage("A procurar adversário...");

  // Desabilitar controlos enquanto espera
  document.getElementById("rollDiceBtn").disabled = true;
  document.getElementById("passTurnBtn").disabled = true;
  document.getElementById("giveUpBtn").disabled = true;

  // Criar tabuleiro vazio
  createBoard(size);
  gameState.size = size;

  // Chamar join para matchmaking
  const res = await window.server.join(group, size, onlineState.nick, onlineState.password);
  const result = window.server.handleJoin(res);

  if (!result.ok) {
    showMessage("Erro ao entrar no jogo: " + result.error);
    onlineState.isOnline = false;
    return;
  }

  onlineState.gameId = result.game;
  onlineState.pollingActive = true;

  showMessage("Jogo encontrado! A iniciar...");

  // Iniciar loop de atualizações
  onlineGameLoop();
}

// Loop de atualizações do jogo online (long polling)
async function onlineGameLoop() {
  if (!onlineState.pollingActive || !onlineState.gameId) {
    return;
  }

  try {
    const res = await window.server.update(onlineState.gameId, onlineState.nick);
    const result = window.server.handleUpdate(res);

    if (!result.ok) {
      console.error("Erro no update:", result.error);
      // Tentar novamente após pausa
      setTimeout(onlineGameLoop, 2000);
      return;
    }

    // Atualizar estado do jogo
    processServerUpdate(result);

    // Verificar se o jogo terminou
    if (result.winner) {
      const isWinner = result.winner === onlineState.nick;
      showMessage(isWinner ? "Vitória! Parabéns!" : `Derrota. ${result.winner} venceu.`);
      onlineState.pollingActive = false;
      onlineState.isOnline = false;

      document.getElementById("rollDiceBtn").disabled = true;
      document.getElementById("passTurnBtn").disabled = true;
      document.getElementById("giveUpBtn").disabled = true;

      if (typeof saveScore === "function") {
        saveScore(onlineState.nick, isWinner ? "Vitória" : "Derrota");
      }

      // Mostrar popup de configuração após 2 segundos para iniciar novo jogo
      setTimeout(() => {
        const configPopup = document.getElementById("configPopup");
        if (configPopup) {
          configPopup.classList.remove("hidden");
        }
      }, 2000);

      return;
    }

    // Continuar polling
    setTimeout(onlineGameLoop, 500);

  } catch (err) {
    console.error("Erro na comunicação:", err);
    setTimeout(onlineGameLoop, 2000);
  }
}

// Processa atualização do servidor e atualiza a UI
function processServerUpdate(data) {
  // Atualizar dado
  if (data.dice !== undefined && data.dice !== null) {
    gameState.diceValue = data.dice;
    document.getElementById('diceResult').innerText = `Dado: ${data.dice}`;
  }

  // Verificar de quem é a vez
  onlineState.myTurn = (data.turn === onlineState.nick);

  // Atualizar controlos baseado na vez
  const isMyTurn = onlineState.myTurn;
  document.getElementById("rollDiceBtn").disabled = !isMyTurn;
  document.getElementById("passTurnBtn").disabled = !isMyTurn;
  document.getElementById("giveUpBtn").disabled = false; // sempre pode desistir

  // Atualizar mensagem de estado
  if (isMyTurn) {
    if (data.dice) {
      showMessage(`É a tua vez! Dado: ${data.dice}. Clica numa peça para mover.`);
    } else {
      showMessage("É a tua vez! Lança o dado.");
    }
  } else {
    showMessage(`Vez de ${data.turn}. A aguardar...`);
  }

  // Atualizar tabuleiro com peças do servidor
  if (data.pieces) {
    renderPiecesFromServer(data.pieces, gameState.size);
  }

  // Realçar a seleção do adversário (se existir)
  if (data.selected !== undefined && data.selected !== null && !onlineState.myTurn) {
    const row = Math.floor(data.selected / gameState.size);
    const col = data.selected % gameState.size;
    const opponentCell = document.querySelector(
      `.cell[data-row="${row}"][data-col="${col}"]`
    );
    if (opponentCell) {
      opponentCell.classList.add('highlight-opponent');
    }
  }

  // Guardar a cor do jogador
  if (data.players) {
    const playerIndex = data.players.indexOf(onlineState.nick);
    onlineState.myColor = playerIndex === 0 ? 'blue' : 'red';
  }
}

// Renderiza as peças a partir do formato do servidor
function renderPiecesFromServer(pieces, size) {
  // Resetar tabuleiro
  gameState.board = Array.from({ length: 4 }, () => Array(size).fill(null));

  // pieces é um objeto com posições das peças
  // Formato esperado: { "player1": [pos1, pos2, ...], "player2": [pos1, pos2, ...] }
  if (typeof pieces === 'object') {
    const players = Object.keys(pieces);
    players.forEach((player, idx) => {
      const color = idx === 0 ? 'blue' : 'red';
      const positions = pieces[player];

      if (Array.isArray(positions)) {
        positions.forEach(pos => {
          const row = Math.floor(pos / size);
          const col = pos % size;
          if (row >= 0 && row < 4 && col >= 0 && col < size) {
            gameState.board[row][col] = { color };
          }
        });
      }
    });
  }

  renderPieces(gameState.board);
}

// mostra uma mensagem na área do jogo
function showMessage(msg) {
  const area = document.getElementById("messageArea");
  if (area) area.innerText = msg;
}

// tenta passar a vez, se não houver jogadas válidas
async function passTurn() {
  // Modo online
  if (onlineState.isOnline) {
    if (!onlineState.myTurn) {
      showMessage("Não é a tua vez.");
      return;
    }

    const res = await window.server.pass(onlineState.gameId, onlineState.nick, onlineState.password);
    const result = window.server.handlePass(res);

    if (!result.ok) {
      showMessage("Erro ao passar: " + result.error);
    }
    return;
  }

  // Modo local (lógica original)
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
async function giveUp() {
  if (!confirm("Tens a certeza que queres desistir?")) return;

  // Modo online
  if (onlineState.isOnline) {
    const res = await window.server.leave(onlineState.gameId, onlineState.nick, onlineState.password);
    onlineState.isOnline = false;
    onlineState.pollingActive = false;
    onlineState.gameId = null;

    showMessage("Saíste do jogo.");

    if (typeof saveScore === "function") saveScore(onlineState.nick, "Desistiu");

    document.getElementById("rollDiceBtn").disabled = true;
    document.getElementById("passTurnBtn").disabled = true;
    document.getElementById("giveUpBtn").disabled = true;
    return;
  }

  // Modo local (lógica original)
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

  // Mostrar popup de configuração após 2 segundos para iniciar novo jogo
  setTimeout(() => {
    const configPopup = document.getElementById("configPopup");
    if (configPopup) {
      configPopup.classList.remove("hidden");
    }
  }, 2000);
}

// Exporta funções para uso global
window.startGame = startGame;
window.showMessage = showMessage;
window.passTurn = passTurn;
window.giveUp = giveUp;
