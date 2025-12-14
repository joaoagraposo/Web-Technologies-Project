const SERVER = "http://twserver.alunos.dcc.fc.up.pt:8118";
// const SERVER = "http://localhost:8118";

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
function register(nick, password) {
    return post("register", { nick, password });
}

/* ------------------- join ----------------------- */
/*
 * Correct request according to spec:
 * {
 *   "group": <int>,
 *   "nick": "<string>",
 *   "password": "<string>",
 *   "size": <int-impar>
 * }
 */
function join(group, size, nick, password) {
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
function leave(game, nick, password) {
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
function roll(game, nick, password) {
    return post("roll", { nick, password, game });
}

/* ---------------- notify (mover peça) ------------ */
/* ---------------- notify (mover peça) ------------ */
/*
 * Structure according to spec:
 *  {
 *      "nick": "...",
 *      "password": "...",
 *      "game": "...",
 *      "cell": <int>
 *  }
 */
function notify(game, nick, password, cell) {
    return post("notify", { nick, password, game, cell });
}

/* ---------------- pass ---------------------------- */
/*
 * When player passes:
 * {
 *   "nick": "...",
 *   "password": "...",
 *   "game": "..."
 * }
 */
function pass(game, nick, password) {
    return post("pass", { nick, password, game });
}

/* ---------------- update (long-polling) ----------- */
/*
 * GET: /update?nick=...&game=...
 */
function update(game, nick) {
    return get("update", { nick, game });
}

/* ---------------- ranking -------------------------- */
/*
 * GET ranking?group=<int>&size=<int>
 */
function ranking(group, size) {
    return get("ranking", { group, size });
}

/* ---------------- responses ---------------------- */
function handleRegister(res) {
    if (res.error) return { ok: false, error: res.error };
    return { ok: true };
}

function handleJoin(res) {
    if (res.error) return { ok: false, error: res.error };
    return { ok: true, game: res.game };
}

function handleLeave(res) {
    if (res.error) return { ok: false, error: res.error };
    return { ok: true };
}

function handleRoll(res) {
    if (res.error) return { ok: false, error: res.error };
    return { ok: true };
}

function handlePass(res) {
    if (res.error) return { ok: false, error: res.error };
    return { ok: true };
}

function handleNotify(res) {
    if (res.error) return { ok: false, error: res.error };
    return { ok: true };
}

function handleUpdate(res) {
    if (res.error) return { ok: false, error: res.error };

    return {
        ok: true,
        cell: res.cell,
        dice: res.dice,
        initial: res.initial,
        mustPass: res.mustPass,
        pieces: res.pieces,
        players: res.players,
        selected: res.selected,
        step: res.step,
        turn: res.turn,
        winner: res.winner
    };
}

function handleRanking(res) {
    if (res.error) return { ok: false, error: res.error };
    return { ok: true, ranking: res.ranking };
}

// Export functions globally to use in app.js
window.server = {
    SERVER,
    register,
    join,
    leave,
    roll,
    notify,
    pass,
    update,
    ranking,
    handleRegister,
    handleJoin,
    handleLeave,
    handleRoll,
    handlePass,
    handleNotify,
    handleUpdate,
    handleRanking
};
