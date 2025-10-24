function rollDice() {
  const sticks = Array.from({ length: 4 }, () => Math.random() < 0.5 ? 0 : 1);
  const sum = sticks.reduce((a, b) => a + b, 0);
  const value = (sum === 0) ? 6 : sum;
  gameState.diceValue = value;
  document.getElementById('diceResult').innerText = `Dado: ${value}`;
  showMessage(`Saiu ${value}.`);
}
