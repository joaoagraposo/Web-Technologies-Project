const SERVER = "http://twserver.alunos.dcc.fc.up.pt:8008";

/* POST helper */
async function post(path, body) {
    try {
        const response = await fetch(`${SERVER}/${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        return response.json();
    } catch (err) {
        return { error: "Network error" };
    }
}

/* GET helper */
async function get(path, params = {}) {
    const qs = new URLSearchParams(params);
    try {
        const response = await fetch(`${SERVER}/${path}?${qs}`);
        return response.json();
    } catch (err) {
        return { error: "Network error" };
    }
}

/* ------------------- register ------------------- */
export function register(nick, password) {
    return post("register", { nick, password });
}

/* ------------------- join ----------------------- */
/*
 * Pedido correto segundo enunciado:
 * {
 *   "group": <int>,
 *   "nick": "<string>",
 *   "password": "<string>",
 *   "size": <int-impar>
 * }
 */
export function join(group, size, nick, password) {
    return post("join", { group, size, nick, password });
}

/* ------------------- leave ----------------------- */
/*
 * {
 *   "nick": "...",
 *   "password": "...",
 *   "game": "..."
 * }
 */
export function leave(game, nick, password) {
    return post("leave", { nick, password, game });
}

/* ------------------- roll ------------------------ */
/*
 * {
 *   "nick": "...",
 *   "password": "...",
 *   "game": "..."
 * }
 */
export function roll(game, nick, password) {
    return post("roll", { nick, password, game });
}

/* ---------------- notify (mover peça) ------------ */
/*
 * IMPORTANTE:
 *  O pedido NÃO envia "step"
 *  O pedido NÃO envia "move"
 *  Somente:
 *  {
 *      "nick": "...",
 *      "password": "...",
 *      "game": "...",
 *      "cell": <int>
 *  }
 */
export function notify(game, nick, password, cell) {
    return post("notify", { nick, password, game, cell });
}

/* ---------------- pass ---------------------------- */
/*
 * Quando jogador passa:
 * {
 *   "nick": "...",
 *   "password": "...",
 *   "game": "..."
 * }
 */
export function pass(game, nick, password) {
    return post("pass", { nick, password, game });
}

/* ---------------- update (long-polling) ----------- */
/*
 * GET: /update?nick=...&game=...
 */
export function update(game, nick) {
    return get("update", { nick, game });
}

/* ---------------- ranking -------------------------- */
/*
 * GET ranking?group=<int>&size=<int>
 */
export function ranking(group, size) {
    return get("ranking", { group, size });
}
