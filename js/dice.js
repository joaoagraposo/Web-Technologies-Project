// lança o dado de paus e guarda o valor e a flag de jogada extra
async function rollDice() {
  // Modo online
  if (onlineState.isOnline) {
    if (!onlineState.myTurn) {
      showMessage("Não é a tua vez.");
      return;
    }

    if (gameState.diceValue !== null) {
      showMessage(`Dado deste turno: ${gameState.diceValue}`);
      return;
    }

    // Usar o módulo server.js que tem o URL correto
    const res = await window.server.roll(
      onlineState.gameId,
      onlineState.nick,
      onlineState.password
    );

    if (res.error) {
      showMessage("Erro ao lançar dado: " + res.error);
    }
    // O valor do dado virá no próximo update()
    return;
  }

  // Modo local (lógica original)
  if (gameState.diceValue === null) {
    const sticks = Array.from({ length: 4 }, () => Math.random() < 0.5 ? 0 : 1);
    const sum = sticks.reduce((a, b) => a + b, 0);
    const value = (sum === 0) ? 6 : sum;
    const extradice = [6, 1, 4].includes(value);
    gameState.extramove = extradice;
    gameState.diceValue = value;
    document.getElementById('diceResult').innerText = `Dado: ${value}`;

    // Adicionar ao histórico
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
