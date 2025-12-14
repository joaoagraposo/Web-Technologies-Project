// ============================================
// APP.JS - Inicialização e gestão da interface
// ============================================

// Histórico de jogadas (máximo 10)
let moveHistory = [];

// Cleanup quando a tab é fechada - sai do jogo automaticamente
window.addEventListener("beforeunload", () => {
  if (onlineState.isOnline && onlineState.gameId && onlineState.nick) {
    // Usar sendBeacon para garantir que o request é enviado mesmo ao fechar
    const data = JSON.stringify({
      nick: onlineState.nick,
      password: onlineState.password,
      game: onlineState.gameId
    });
    navigator.sendBeacon(window.server?.SERVER + "/leave" || "http://localhost:8118/leave", data);
  }
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("App initialized - New UI");

  // Elementos principais
  const loginOverlay = document.getElementById("loginOverlay");
  const loginBtn = document.getElementById("loginBtn");
  const skipLoginBtn = document.getElementById("skipLoginBtn");
  const openLoginBtn = document.getElementById("openLogin");
  const userStatusText = document.getElementById("userStatusText");

  const gameModeSelect = document.getElementById("gameMode");
  const groupRow = document.getElementById("groupRow");
  const localOnlyOptions = document.getElementById("localOnlyOptions");
  const colorRow = document.getElementById("colorRow");
  const aiRow = document.getElementById("aiRow");

  const startGameBtn = document.getElementById("startGameBtn");
  const rollDiceBtn = document.getElementById("rollDiceBtn");
  const passTurnBtn = document.getElementById("passTurnBtn");
  const giveUpBtn = document.getElementById("giveUpBtn");

  const openRulesBtn = document.getElementById("openRules");
  const openScoresBtn = document.getElementById("openScores");

  const winPopup = document.getElementById("winPopup");
  const playAgainBtn = document.getElementById("playAgainBtn");

  // ============================================
  // LOGIN
  // ============================================

  // Função de login (reutilizável)
  async function doLogin() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value;

    if (user === "") {
      alert("Por favor, introduz um nome de utilizador.");
      return;
    }

    try {
      const res = await window.server.register(user, pass);
      const result = window.server.handleRegister(res);

      if (!result.ok) {
        alert("Erro de autenticação: " + result.error);
        return;
      }

      // Guardar credenciais
      onlineState.nick = user;
      onlineState.password = pass;

      updateUserDisplay();
      loginOverlay.classList.add("hidden");
      showMessage(`Bem-vindo, ${user}!`);
    } catch (err) {
      alert("Erro de ligação ao servidor. Verifique se o servidor está ativo.");
    }
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", doLogin);
  }

  // Enter para fazer login
  document.getElementById("username")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLogin();
  });
  document.getElementById("password")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLogin();
  });

  if (skipLoginBtn) {
    skipLoginBtn.addEventListener("click", () => {
      loginOverlay.classList.add("hidden");
      showMessage("Modo offline - apenas jogos locais disponíveis");
    });
  }

  if (openLoginBtn) {
    openLoginBtn.addEventListener("click", () => {
      if (onlineState.nick) {
        // Logout
        if (onlineState.isOnline && onlineState.gameId) {
          window.server.leave(onlineState.gameId, onlineState.nick, onlineState.password);
        }
        onlineState.nick = null;
        onlineState.password = null;
        onlineState.isOnline = false;
        onlineState.pollingActive = false;
        onlineState.gameId = null;
        updateUserDisplay();
        showMessage("Sessão terminada");
      } else {
        loginOverlay.classList.remove("hidden");
      }
    });
  }

  function updateUserDisplay() {
    if (onlineState.nick) {
      userStatusText.innerHTML = `Autenticado como: <span class="nick">${onlineState.nick}</span>`;
      openLoginBtn.textContent = "🚪 Terminar Sessão";
    } else {
      userStatusText.textContent = "Não autenticado";
      openLoginBtn.textContent = "👤 Login";
    }
  }

  // ============================================
  // MODO DE JOGO
  // ============================================
  if (gameModeSelect) {
    gameModeSelect.addEventListener("change", () => {
      const isOnline = gameModeSelect.value === "online";
      groupRow.classList.toggle("hidden", !isOnline);
      localOnlyOptions.classList.toggle("hidden", isOnline);
      colorRow.classList.toggle("hidden", isOnline);
      aiRow.classList.toggle("hidden", isOnline);
    });
  }

  // ============================================
  // INICIAR JOGO
  // ============================================
  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => startGame());
  }

  // Enter para iniciar jogo
  document.getElementById("groupNumber")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startGame();
  });
  document.getElementById("boardSize")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startGame();
  });

  // ============================================
  // CONTROLOS DO JOGO
  // ============================================
  if (rollDiceBtn) rollDiceBtn.addEventListener("click", rollDice);
  if (passTurnBtn) passTurnBtn.addEventListener("click", passTurn);
  if (giveUpBtn) giveUpBtn.addEventListener("click", giveUp);

  // ============================================
  // NAVEGAÇÃO
  // ============================================
  if (openRulesBtn) {
    openRulesBtn.addEventListener("click", () => {
      document.getElementById("rulesPanel").classList.remove("hidden");
    });
  }

  if (openScoresBtn) {
    openScoresBtn.addEventListener("click", () => {
      if (typeof loadScores === "function") loadScores();
      document.getElementById("scoresPanel").classList.remove("hidden");
    });
  }

  // Fechar painéis
  document.querySelectorAll(".closePanel").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".panel").classList.add("hidden");
    });
  });

  // ============================================
  // WIN POPUP
  // ============================================
  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
      winPopup.classList.add("hidden");
      clearMoveHistory();
    });
  }

  // ============================================
  // SCOREBOARD INIT
  // ============================================
  if (typeof initScoreboard === "function") initScoreboard();

  console.log("UI setup complete");
});

// ============================================
// FUNÇÕES DE JOGO
// ============================================

async function startGame() {
  const mode = document.getElementById("gameMode").value;
  const size = parseInt(document.getElementById("boardSize").value);

  clearMoveHistory();

  if (mode === "online") {
    if (!onlineState.nick) {
      alert("Precisas de fazer login primeiro para jogar online!");
      document.getElementById("loginOverlay").classList.remove("hidden");
      return;
    }
    await startOnlineGame(size);
  } else {
    startLocalGame(size);
  }
}

function startLocalGame(size) {
  const firstPlayer = document.getElementById("firstPlayer").value;
  const humanColor = document.getElementById("humanColor").value;
  const aiColor = humanColor === "blue" ? "red" : "blue";

  onlineState.isOnline = false;
  onlineState.pollingActive = false;

  createBoard(size);
  initGame(size, { firstPlayer, humanColor, aiColor });

  document.getElementById("rollDiceBtn").disabled = false;
  document.getElementById("passTurnBtn").disabled = false;
  document.getElementById("giveUpBtn").disabled = false;

  showMessage("Jogo local iniciado! Lança o dado.");
  addMoveToHistory("Sistema", "Jogo iniciado", "system");
}

async function startOnlineGame(size) {
  const group = parseInt(document.getElementById("groupNumber").value) || 18;

  onlineState.group = group;
  onlineState.isOnline = true;

  showMessage("A procurar adversário...");
  addMoveToHistory("Sistema", "A aguardar oponente...", "system");

  document.getElementById("rollDiceBtn").disabled = true;
  document.getElementById("passTurnBtn").disabled = true;
  document.getElementById("giveUpBtn").disabled = true;

  createBoard(size);
  gameState.size = size;

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
  addMoveToHistory("Sistema", "Jogo online iniciado!", "system");

  onlineGameLoop();
}

async function onlineGameLoop() {
  if (!onlineState.pollingActive || !onlineState.gameId) return;

  try {
    const res = await window.server.update(onlineState.gameId, onlineState.nick);
    const result = window.server.handleUpdate(res);

    if (!result.ok) {
      console.error("Erro no update:", result.error);
      setTimeout(onlineGameLoop, 2000);
      return;
    }

    processServerUpdate(result);

    if (result.winner) {
      const isWinner = result.winner === onlineState.nick;
      showWinPopup(result.winner, isWinner);
      onlineState.pollingActive = false;
      onlineState.isOnline = false;

      document.getElementById("rollDiceBtn").disabled = true;
      document.getElementById("passTurnBtn").disabled = true;
      document.getElementById("giveUpBtn").disabled = true;

      if (typeof saveScore === "function") {
        saveScore(onlineState.nick, isWinner ? "Vitória" : "Derrota");
      }
      return;
    }

    setTimeout(onlineGameLoop, 500);
  } catch (err) {
    console.error("Erro na comunicação:", err);
    setTimeout(onlineGameLoop, 2000);
  }
}

function processServerUpdate(data) {
  if (data.dice !== undefined && data.dice !== null) {
    // Extrair valor numérico do objeto de dado (suporta formatos novos e antigos)
    let diceStruct = data.dice.value !== undefined ? data.dice.value : data.dice;
    // Se ainda for um objeto com propriedade .value (do rollDice no server), extrair
    let diceVal = (typeof diceStruct === 'object' && diceStruct.value !== undefined)
      ? diceStruct.value
      : diceStruct;

    gameState.diceValue = diceVal;
    document.getElementById('diceResult').innerText = `Dado: ${diceVal}`;

    // Adicionar ao histórico (com proteção contra duplicados)
    if (data.turn) {
      const diceId = data.dice.id;
      // Se tiver ID, usa-o para filtrar duplicados
      if (diceId) {
        if (diceId !== onlineState.lastProcessedDiceId) {
          addMoveToHistory(data.turn, `Lançou ${diceVal}`, data.players?.[data.turn] || "system");
          onlineState.lastProcessedDiceId = diceId;
        }
      } else {
        // Fallback para legado
        const lastEntry = moveHistory[0];
        const isDuplicate = lastEntry &&
          lastEntry.player === data.turn &&
          lastEntry.action === `Lançou ${diceVal}`;

        if (!isDuplicate) {
          addMoveToHistory(data.turn, `Lançou ${diceVal}`, data.players?.[data.turn] || "system");
        }
      }
    }
  } else {
    // Se data.dice for null, limpar o estado do dado localmente
    gameState.diceValue = null;
    document.getElementById('diceResult').innerText = "Dado: -";
  }

  onlineState.myTurn = (data.turn === onlineState.nick);

  const isMyTurn = onlineState.myTurn;
  document.getElementById("rollDiceBtn").disabled = !isMyTurn;
  document.getElementById("passTurnBtn").disabled = !isMyTurn;
  document.getElementById("giveUpBtn").disabled = false;

  if (isMyTurn) {
    if (gameState.diceValue) {
      showMessage(`É a tua vez! Dado: ${gameState.diceValue}. Clica numa peça.`);
    } else {
      showMessage("É a tua vez! Lança o dado.");
    }
  } else {
    if (data.turn === null) {
      showMessage("A aguardar adversário...");
      document.getElementById("rollDiceBtn").disabled = true;
      document.getElementById("passTurnBtn").disabled = true;
    } else {
      showMessage(`Vez de ${data.turn}. A aguardar...`);
    }
  }

  if (data.pieces) {
    renderPiecesFromServer(data.pieces, gameState.size);

    // Re-aplicar seleção se o servidor indicar uma peça selecionada (evita flash)
    if (data.fromSquare !== undefined && data.fromSquare !== null) {
      const row = Math.floor(data.fromSquare / gameState.size);
      const col = data.fromSquare % gameState.size;
      const pieceEl = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"] .piece`);
      if (pieceEl) {
        pieceEl.classList.add('selected');
      }
    }
  }

  // Destacar movimentos válidos (data.selected do servidor)
  if (data.selected && Array.isArray(data.selected)) {
    if (onlineState.myTurn) {
      // Se for a minha vez, destacar como destinos possíveis
      data.selected.forEach(squareIndex => {
        const row = Math.floor(squareIndex / gameState.size);
        const col = squareIndex % gameState.size;
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) cell.classList.add('highlight-move');
      });
    } else {
      // Se não for a minha vez, destacar apenas o que o oponente selecionou?
      // O servidor envia 'selected' como destinos válidos quando step='to'.
      // Mas também pode enviar 'fromSquare' como a seleção atual.
      // Para o oponente, podemos destacar o fromSquare.
      if (data.fromSquare !== undefined && data.fromSquare !== null) {
        const row = Math.floor(data.fromSquare / gameState.size);
        const col = data.fromSquare % gameState.size;
        const opponentCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (opponentCell) {
          opponentCell.classList.add('highlight-opponent');
        }
      }
    }
  }

  gameState.step = data.step; // Guardar step atual do servidor

  if (data.players) {
    onlineState.myColor = data.players[onlineState.nick] || null;
  }
}

function renderPiecesFromServer(pieces, size) {
  gameState.board = Array.from({ length: 4 }, () => Array(size).fill(null));

  if (Array.isArray(pieces)) {
    pieces.forEach((piece, index) => {
      if (piece) {
        const row = Math.floor(index / size);
        const col = index % size;
        if (row >= 0 && row < 4 && col >= 0 && col < size) {
          gameState.board[row][col] = {
            color: piece.color,
            hasMoved: piece.inMotion || false,
            hasVisitedLastRow: piece.reachedLastRow || false
          };
        }
      }
    });
  }

  renderPieces(gameState.board);
}

// ============================================
// HISTÓRICO DE JOGADAS
// ============================================

function addMoveToHistory(player, action, color) {
  const entry = { player, action, color, time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) };
  moveHistory.unshift(entry);

  if (moveHistory.length > 10) {
    moveHistory.pop();
  }

  renderMoveHistory();
}

function renderMoveHistory() {
  const list = document.getElementById("moveList");
  if (!list) return;

  if (moveHistory.length === 0) {
    list.innerHTML = '<li style="opacity:0.5;">Nenhuma jogada ainda...</li>';
    return;
  }

  list.innerHTML = moveHistory.map(entry => {
    let className = "";
    if (entry.color === "red") className = "red-move";
    else if (entry.color === "blue") className = "blue-move";
    else if (entry.action.includes("Passou") || entry.action.includes("sem jogadas")) className = "pass-move";

    return `<li class="${className}"><strong>${entry.player}</strong>: ${entry.action} <small style="opacity:0.6;">(${entry.time})</small></li>`;
  }).join("");
}

function clearMoveHistory() {
  moveHistory = [];
  renderMoveHistory();
}

// ============================================
// WIN POPUP
// ============================================

function showWinPopup(winner, isVictory) {
  const popup = document.getElementById("winPopup");
  const winnerName = document.getElementById("winnerName");

  if (isVictory) {
    winnerName.innerHTML = `🎉 <strong>Parabéns!</strong><br>Venceste o jogo!`;
  } else {
    winnerName.innerHTML = `<strong>${winner}</strong> venceu o jogo.`;
  }

  addMoveToHistory("Sistema", `${winner} venceu!`, "system");
  popup.classList.remove("hidden");
}

// ============================================
// CONTROLOS
// ============================================

function showMessage(msg) {
  const area = document.getElementById("messageArea");
  if (area) area.innerText = msg;
}

async function passTurn() {
  if (onlineState.isOnline) {
    if (!onlineState.myTurn) {
      showMessage("Não é a tua vez.");
      return;
    }

    const res = await window.server.pass(onlineState.gameId, onlineState.nick, onlineState.password);
    const result = window.server.handlePass(res);

    if (!result.ok) {
      showMessage("Erro ao passar: " + result.error);
    } else {
      addMoveToHistory(onlineState.nick, "Passou a vez", onlineState.myColor);
    }
    return;
  }

  // Modo local
  if (gameState.diceValue === null) {
    showMessage("Tens de lançar o dado antes de passar a vez.");
    return;
  }

  if (gameState.extramove === true) {
    gameState.extramove = false;
    gameState.diceValue = null;
    document.getElementById('diceResult').innerText = '';
    showMessage("Jogada extra cancelada.");
    return;
  }

  const color = gameState.currentColor;

  if (canAnyMove(color)) {
    showMessage("Ainda tens uma jogada válida, não podes passar.");
    return;
  }

  addMoveToHistory(gameState.currentPlayer === 'human' ? 'Humano' : 'IA', 'Passou (sem jogadas)', color);
  showMessage("Vez passada.");
  gameState.diceValue = null;
  document.getElementById('diceResult').innerText = '';
  nextTurn();
}

async function giveUp() {
  if (!confirm("Tens a certeza que queres desistir?")) return;

  if (onlineState.isOnline) {
    await window.server.leave(onlineState.gameId, onlineState.nick, onlineState.password);
    onlineState.isOnline = false;
    onlineState.pollingActive = false;
    onlineState.gameId = null;

    showMessage("Saíste do jogo.");
    addMoveToHistory(onlineState.nick, "Desistiu", onlineState.myColor);

    if (typeof saveScore === "function") saveScore(onlineState.nick, "Desistiu");

    document.getElementById("rollDiceBtn").disabled = true;
    document.getElementById("passTurnBtn").disabled = true;
    document.getElementById("giveUpBtn").disabled = true;
    return;
  }

  // Modo local
  showMessage("Jogador desistiu. O computador venceu!");
  addMoveToHistory("Humano", "Desistiu", gameState.players?.human);
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

// Exportar funções globais
window.startGame = startGame;
window.showMessage = showMessage;
window.passTurn = passTurn;
window.giveUp = giveUp;
window.addMoveToHistory = addMoveToHistory;
window.showWinPopup = showWinPopup;
