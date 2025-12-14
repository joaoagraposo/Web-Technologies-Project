// rolls the sticks and saves value and extra move flag
async function rollDice() {
  // Online mode
  if (onlineState.isOnline) {
    if (!onlineState.myTurn) {
      showMessage("Não é a tua vez.");
      return;
    }

    if (gameState.diceValue !== null) {
      showMessage(`Dado deste turno: ${gameState.diceValue}`);
      return;
    }

    // Use server.js module which has correct URL
    const res = await window.server.roll(
      onlineState.gameId,
      onlineState.nick,
      onlineState.password
    );

    if (res.error) {
      showMessage("Erro ao lançar dado: " + res.error);
    }
    // Dice value will come in next update()
    return;
  }

  // Local mode (original logic)
  if (gameState.diceValue === null) {
    const sticks = Array.from({ length: 4 }, () => Math.random() < 0.5 ? 0 : 1);
    const sum = sticks.reduce((a, b) => a + b, 0);
    const value = (sum === 0) ? 6 : sum;
    const extradice = [6, 1, 4].includes(value);
    gameState.extramove = extradice;
    gameState.diceValue = value;
    document.getElementById('diceResult').innerText = `Dado: ${value}`;

    // Add to history
    const player = gameState.currentPlayer === 'human' ? 'Humano' : 'IA';
    const color = gameState.currentColor;
    const extraMsg = extradice ? ' (jogada extra!)' : '';
    if (typeof addMoveToHistory === 'function') {
      addMoveToHistory(player, `Lançou ${value}${extraMsg}`, color);
    }
  }
  else {
    showMessage(`Dado deste turno: ${gameState.diceValue}`);
  }
}
