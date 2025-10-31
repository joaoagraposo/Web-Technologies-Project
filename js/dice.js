// dice.js
function rollDice() {
  if(gameState.diceValue===null){
  const sticks = Array.from({ length: 4 }, () => Math.random() < 0.5 ? 0 : 1);
  const sum = sticks.reduce((a, b) => a + b, 0);
  const value = (sum === 0) ? 6 : sum;
  const extradice = [6, 1, 4].includes(value);
  gameState.extramove = extradice;
  gameState.diceValue = value;
  document.getElementById('diceResult').innerText = `Dado: ${value}`;
  
  }
  else {
    showMessage(`Dado deste turno: ${gameState.diceValue}`);
  }
}
 