// scoreboard.js
// Handles game score persistence and UI updates

function saveScore(player, result) {
  const date = new Date().toLocaleString('pt-PT');
  const tbody = document.querySelector("#scoreTable tbody");

  // Create new row entry
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${player}</td>
    <td>${result}</td>
    <td>${date}</td>
  `;
  tbody.appendChild(row);

  // Save to localStorage
  const newEntry = { player, result, date };
  const savedScores = JSON.parse(localStorage.getItem("tabScores") || "[]");
  savedScores.push(newEntry);
  localStorage.setItem("tabScores", JSON.stringify(savedScores));
}

function loadScores() {
  const tbody = document.querySelector("#scoreTable tbody");
  tbody.innerHTML = ""; // clear existing scores

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

function clearScores() {
  if (confirm("Tens a certeza que queres limpar as classificações?")) {
    localStorage.removeItem("tabScores");
    loadScores();
  }
}

// Called once on startup
function initScoreboard() {
  const clearBtn = document.getElementById("clearScores");
  clearBtn.addEventListener("click", clearScores);
  loadScores();
}

// Export globally (for app.js to use)
window.saveScore = saveScore;
window.loadScores = loadScores;
window.clearScores = clearScores;
window.initScoreboard = initScoreboard;