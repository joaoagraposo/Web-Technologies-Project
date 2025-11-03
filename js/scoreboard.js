// guarda uma entrada na tabela e no localStorage
function saveScore(player, result) {
  const date = new Date().toLocaleString('pt-PT');
  const tbody = document.querySelector("#scoreTable tbody");

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${player}</td>
    <td>${result}</td>
    <td>${date}</td>
  `;
  tbody.appendChild(row);

  const newEntry = { player, result, date };
  const savedScores = JSON.parse(localStorage.getItem("tabScores") || "[]");
  savedScores.push(newEntry);
  localStorage.setItem("tabScores", JSON.stringify(savedScores));
}

// carrega as entradas guardadas do localStorage
function loadScores() {
  const tbody = document.querySelector("#scoreTable tbody");
  tbody.innerHTML = "";

  const savedScores = JSON.parse(localStorage.getItem("tabScores") || "[]");
  savedScores.forEach(({ player, result, date }) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${player}</td>
      <td>${result}</td>
      <td>${date}</td>
    `;
    tbody.appendChild(row);
  });
}

// apaga todas as entradas guardadas
function clearScores() {
  if (confirm("Tens a certeza que queres limpar as classificações?")) {
    localStorage.removeItem("tabScores");
    loadScores();
  }
}

// liga as funções do scoreboard à interface no arranque
function initScoreboard() {
  const clearBtn = document.getElementById("clearScores");
  clearBtn.addEventListener("click", clearScores);
  loadScores();
}

window.saveScore = saveScore;
window.loadScores = loadScores;
window.clearScores = clearScores;
window.initScoreboard = initScoreboard;
