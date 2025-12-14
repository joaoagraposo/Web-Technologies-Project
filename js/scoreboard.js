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

  // Restaurar cabeçalhos originais para modo local
  const thead = document.querySelector("#scoreTable thead tr");
  if (thead) {
    thead.innerHTML = `
      <th>Jogador</th>
      <th>Resultado</th>
      <th>Data</th>
    `;
  }

  // Carregar do localStorage (lógica original)
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

// carrega ranking do servidor
async function loadServerRanking() {
  // Ler valores dos selectores UI
  const groupInput = document.getElementById("rankingGroup");
  const sizeSelect = document.getElementById("rankingSize");

  const group = groupInput ? parseInt(groupInput.value) || 18 : 18;
  const size = sizeSelect ? parseInt(sizeSelect.value) || 7 : 7;

  // Atualizar cabeçalhos da tabela para modo servidor
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
    // Usar o módulo server.js que tem o URL correto
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
