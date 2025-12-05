const SERVER = "http://twserver.alunos.dcc.fc.up.pt:8008";

/**
 * Função auxiliar para pedidos POST em JSON
 */
async function post(path, bodyObj) {
    try {
        const response = await fetch(`${SERVER}/${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyObj)
        });

        const data = await response.json();
        return data; // normalmente {} ou { error: "..." }

    } catch (error) {
        console.error(`Erro no pedido POST /${path}:`, error);
        return { error: "Network error" };
    }
}

/**
 * Função auxiliar para pedidos GET com query string
 */
async function get(path, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${SERVER}/${path}?${query}` : `${SERVER}/${path}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Erro no pedido GET /${path}:`, error);
        return { error: "Network error" };
    }
}

/**
 * register
 * Regista/verifica um jogador com nick + password.
 * args: nick, password (strings)
 */
export function register(nick, password) {
    if (typeof nick !== "string" || typeof password !== "string") {
        return Promise.resolve({ error: "Arguments must be strings" });
    }
    return post("register", { nick, password });
}

/**
 * join
 * Entra num jogo de um certo grupo.
 * args: group (número ou string), nick, password
 * normalmente resposta tem algo tipo { game: "id-do-jogo" } ou error
 */
export function join(group, nick, password) {
    return post("join", { group, nick, password });
}

/**
 * leave
 * Sai de um jogo em curso.
 * args: game (id do jogo), nick, password
 */
export function leave(game, nick, password) {
    return post("leave", { game, nick, password });
}

/**
 * roll
 * Exemplo: se o teu jogo tiver um lançamento de dados / rolagem.
 * args: game, nick, password, info extra da jogada (opcional)
 * Ajusta o body conforme o enunciado do teu jogo.
 */
export function roll(game, nick, password, extra = {}) {
    return post("roll", { game, nick, password, ...extra });
}

/**
 * notify
 * Notifica o servidor de uma jogada.
 * args: game, nick, password, move (objeto com info da jogada)
 */
export function notify(game, nick, password, move) {
    return post("notify", { game, nick, password, move });
}

/**
 * pass
 * Passar a vez (se o jogo tiver esse conceito).
 * args: game, nick, password
 */
export function pass(game, nick, password) {
    return post("pass", { game, nick, password });
}

/**
 * update
 * Vai buscar atualizações do estado do jogo (long polling).
 * args: game, nick (normalmente o servidor pede pelo menos o game, às vezes também o nick)
 */
export function update(game, nick) {
    return get("update", { game, nick });
}

/**
 * ranking
 * Vai buscar ranking do grupo.
 * args: group
 */
export function ranking(group) {
    return get("ranking", { group });
}
