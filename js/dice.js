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

    // Importar server dinamicamente (já está disponível via app.js)
    const res = await fetch(`http://twserver.alunos.dcc.fc.up.pt:8008/roll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nick: onlineState.nick,
        password: onlineState.password,
        game: onlineState.gameId
      })
    });
    const data = await res.json();

    if (data.error) {
      showMessage("Erro ao lançar dado: " + data.error);
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
  }
  else {
    showMessage(`Dado deste turno: ${gameState.diceValue}`);
  }
}
