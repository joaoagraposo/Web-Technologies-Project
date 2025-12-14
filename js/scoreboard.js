// saves an entry in table and localStorage
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

// loads saved entries from localStorage or server
async function loadScores() {
  const serverCheckbox = document.getElementById("serverRanking");
  const useServer = serverCheckbox && serverCheckbox.checked;

  if (useServer) {
    await loadServerRanking();
    return;
  }

  // Restore original headers for local mode
  const thead = document.querySelector("#scoreTable thead tr");
  if (thead) {
    thead.innerHTML = `
      <th>Jogador</th>
      <th>Resultado</th>
      <th>Data</th>
    `;
  }

  // Load from localStorage (original logic)
  const tbody = document.querySelector("#scoreTable tbody");
  tbody.innerHTML = "";

  const savedScores = JSON.parse(localStorage.getItem("tabScores") || "[]");

  if (savedScores.length === 0) {
    tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>Sem jogos locais registados.</td></tr>";
    return;
  }

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

// loads ranking from server
async function loadServerRanking() {
  // Read UI selector values
  const groupInput = document.getElementById("rankingGroup");
  const sizeSelect = document.getElementById("rankingSize");

  const group = groupInput ? parseInt(groupInput.value) || 18 : 18;
  const size = sizeSelect ? parseInt(sizeSelect.value) || 7 : 7;

  // Update table headers for server mode
  const thead = document.querySelector("#scoreTable thead tr");
  if (thead) {
    thead.innerHTML = `
      <th>#</th>
      <th>Jogador</th>
      <th>Vitórias</th>
      <th>Jogos</th>
      <th>Taxa</th>
    `;
  }

  const tbody = document.querySelector("#scoreTable tbody");
  tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>A carregar ranking...</td></tr>";

  try {
    // Use server.js module which has correct URL
    const data = await window.server.ranking(group, size);

    if (data.error) {
      if (data.error === "unknown GET request") {
        tbody.innerHTML = `<tr><td colspan='5' style='text-align:center;'>Sem jogos registados no grupo ${group}.</td></tr>`;
      } else {
        tbody.innerHTML = `<tr><td colspan='5' style='text-align:center;'>Erro: ${data.error}</td></tr>`;
      }
      return;
    }

    tbody.innerHTML = "";

    if (!data.ranking || data.ranking.length === 0) {
      tbody.innerHTML = `<tr><td colspan='5' style='text-align:center;'>Sem classificações no grupo ${group} (tamanho ${size}).</td></tr>`;
      return;
    }

    data.ranking.forEach((entry, index) => {
      const winRate = entry.games > 0 ? Math.round((entry.victories / entry.games) * 100) : 0;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="text-align:center; font-weight:bold;">${index + 1}º</td>
        <td>${entry.nick}</td>
        <td style="text-align:center;">${entry.victories}</td>
        <td style="text-align:center;">${entry.games}</td>
        <td style="text-align:center;">${winRate}%</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan='5' style='text-align:center;'>Erro de rede ao contactar servidor.</td></tr>`;
    console.error("Erro ao carregar ranking:", err);
  }
}

// deletes all saved entries
function clearScores() {
  if (confirm("Tens a certeza que queres limpar as classificações?")) {
    localStorage.removeItem("tabScores");
    loadScores();
  }
}

// binds scoreboard functions to interface on startup
function initScoreboard() {
  const clearBtn = document.getElementById("clearScores");
  clearBtn.addEventListener("click", clearScores);

  const serverCheckbox = document.getElementById("serverRanking");
  const rankingFilters = document.getElementById("rankingFilters");
  const loadRankingBtn = document.getElementById("loadRankingBtn");

  if (serverCheckbox) {
    // Toggle filter visibility and reload
    serverCheckbox.addEventListener("change", () => {
      if (rankingFilters) {
        rankingFilters.classList.toggle("hidden", !serverCheckbox.checked);
      }
      loadScores();
    });
  }

  // Button to manually load ranking
  if (loadRankingBtn) {
    loadRankingBtn.addEventListener("click", loadServerRanking);
  }

  loadScores();
}

window.saveScore = saveScore;
window.loadScores = loadScores;
window.clearScores = clearScores;
window.initScoreboard = initScoreboard;
