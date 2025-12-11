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

// carrega as entradas guardadas do localStorage ou do servidor
async function loadScores() {
  const serverCheckbox = document.getElementById("serverRanking");
  const useServer = serverCheckbox && serverCheckbox.checked;

  if (useServer) {
    await loadServerRanking();
    return;
  }

  // Carregar do localStorage (lógica original)
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

// carrega ranking do servidor
async function loadServerRanking() {
  // Ler valores dos selectores UI
  const groupInput = document.getElementById("rankingGroup");
  const sizeSelect = document.getElementById("rankingSize");

  const group = groupInput ? parseInt(groupInput.value) || 99 : 99;
  const size = sizeSelect ? parseInt(sizeSelect.value) || 9 : 9;

  const tbody = document.querySelector("#scoreTable tbody");
  tbody.innerHTML = "<tr><td colspan='3'>A carregar ranking do grupo " + group + " (tamanho " + size + ")...</td></tr>";

  try {
    const res = await fetch(`http://twserver.alunos.dcc.fc.up.pt:8008/ranking?group=${group}&size=${size}`);
    const data = await res.json();

    if (data.error) {
      if (data.error === "unknown GET request") {
        tbody.innerHTML = `<tr><td colspan='3'>Sem jogos registados no grupo ${group} (tamanho ${size}).</td></tr>`;
      } else {
        tbody.innerHTML = `<tr><td colspan='3'>Erro: ${data.error}</td></tr>`;
      }
      return;
    }

    tbody.innerHTML = "";

    if (!data.ranking || data.ranking.length === 0) {
      tbody.innerHTML = `<tr><td colspan='3'>Sem classificações no grupo ${group}.</td></tr>`;
      return;
    }

    data.ranking.forEach((entry, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}. ${entry.nick}</td>
        <td>${entry.victories} vitórias</td>
        <td>${entry.games} jogos</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan='3'>Erro de rede ao contactar servidor.</td></tr>`;
    console.error("Erro ao carregar ranking:", err);
  }
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

  const serverCheckbox = document.getElementById("serverRanking");
  const rankingFilters = document.getElementById("rankingFilters");
  const loadRankingBtn = document.getElementById("loadRankingBtn");

  if (serverCheckbox) {
    // Toggle visibilidade dos filtros e recarregar
    serverCheckbox.addEventListener("change", () => {
      if (rankingFilters) {
        rankingFilters.classList.toggle("hidden", !serverCheckbox.checked);
      }
      loadScores();
    });
  }

  // Botão para carregar ranking manualmente
  if (loadRankingBtn) {
    loadRankingBtn.addEventListener("click", loadServerRanking);
  }

  loadScores();
}

window.saveScore = saveScore;
window.loadScores = loadScores;
window.clearScores = clearScores;
window.initScoreboard = initScoreboard;
