// scoreboard.js
function saveScore(player, result) {
  const date = new Date().toLocaleString("pt-PT");
  const tbody = document.querySelector("#scoreTable tbody");

  // Create new row entry in the table
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${player}</td>
    <td>${result}</td>
    <td>${date}</td>
  `;
  tbody.appendChild(row);

  // Build new score entry
  const newEntry = { player, result, date };

  // Read saved scores
  const savedScores = JSON.parse(localStorage.getItem("tabScores") || "[]");
  savedScores.push(newEntry);

  // Save to localStorage
  localStorage.setItem("tabScores", JSON.stringify(savedScores));

  // Export JSON
  exportScoresJSON(savedScores);
}

// Loads saved scores from localStorage and renders them into the table.
function loadScores() {
  const tbody = document.querySelector("#scoreTable tbody");
  tbody.innerHTML = ""; // clear existing rows

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

// Deletes all scores (after confirmation).

function clearScores() {
  if (confirm("Tens a certeza que queres limpar as classificações?")) {
    localStorage.removeItem("tabScores");
    loadScores();
  }
}

// Exports scores to a JSON file so user can save it into /scores directory.

function exportScoresJSON(scoresData) {
  try {
    const blob = new Blob([JSON.stringify(scoresData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "scores.json"; // downloaded file name
    link.style.display = "none";
    document.body.appendChild(link);
    link.click(); // trigger download
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Error exporting scores.json:", err);
  }
}

// Called once on startup to initialize scoreboard listeners.
function initScoreboard() {
  const clearBtn = document.getElementById("clearScores");
  if (clearBtn) clearBtn.addEventListener("click", clearScores);
  loadScores();
}

window.saveScore = saveScore;
window.loadScores = loadScores;
window.clearScores = clearScores;
window.initScoreboard = initScoreboard;