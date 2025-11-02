// ai.js
function aiMove() {
  // safety turn check
  if (gameState.currentPlayer !== "ai") return;

  // Reset any leftover flags from the previous turn
  gameState.extramove = false;
  
  const aiColor = gameState.players.ai;
  console.log(`\n=== AI TURN START (${aiColor.toUpperCase()}) ===`);

  showMessage("IA a jogar...");

  // Give a short delay for realism
  setTimeout(() => {
    // Roll the dice if not rolled yet
    if (gameState.diceValue === null) {
      rollDice();
      console.log(`AI rolled the dice: ${gameState.diceValue}`);
    } else {
      console.log(`AI reusing dice value: ${gameState.diceValue}`);
    }

    const level = document.getElementById('aiLevel').value; // 'easy' | 'medium'

    // Wait briefly so dice result displays in the UI
    setTimeout(() => performAIMove(aiColor, level), 600);
  }, 600);
}

function performAIMove(color, level) {
  if (!gameState || gameState.currentPlayer !== 'ai') return;

  const dice = gameState.diceValue;
  console.log(`AI computing possible moves — Dice value: ${dice}`);

  const map = getPiecesMapByColor(color);
  const possibleMoves = [];

  // Compute valid moves
  for (const [piece, meta] of map) {
    const dest = computeDestination(meta.row, meta.col, dice, piece, gameState.size, true);
    if (!dest) continue;

    const target = gameState.board[dest.row][dest.col];
    if (!target || target.color !== color) {
      possibleMoves.push({
        from: { row: meta.row, col: meta.col },
        to: dest,
        piece,
        capture: target && target.color !== color
      });
    }
  }

  // If no valid moves, AI passes automatically
  if (possibleMoves.length === 0) {
    console.log("AI could not make any valid move. Passing turn...");
    showMessage("IA não tem jogadas válidas. Passa a vez.");
    gameState.diceValue = null;
    gameState.extramove = false;
    console.log("=== AI TURN END (pass) ===\n");
    return nextTurn();
  }

  // Select move based on difficulty
  let chosenMove;
  if (level === "medium") {
    const captureMoves = possibleMoves.filter(m => m.capture);
    chosenMove = captureMoves.length > 0
      ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
      : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  } else {
    // easy: fully random
    chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  const { from, to, capture } = chosenMove;
  console.log(
    `AI chose move: (${from.row},${from.col}) → (${to.row},${to.col}) ${
      capture ? "[capture]" : ""
    }`
  );

  // Visual preview (short highlight)
  highlightMove(from.row, from.col, to.row, to.col);

  // Execute chosen move
  setTimeout(() => {
    applyMove(chosenMove);
    showMessage(`IA (${color}) moveu uma peça.`);
    console.log(`AI executed move from [${from.row},${from.col}] to [${to.row},${to.col}]`);

  // Clear dice info for next turn
  gameState.diceValue = null;
  document.getElementById('diceResult').innerText = '';

  // Do not call nextTurn() here — applyMove() will handle it or start an extra move
  console.log("=== AI TURN END ===\n");

  }, 800);
}