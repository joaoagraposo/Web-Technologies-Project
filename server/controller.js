/**
 * Request controller for SeWenta/Tâb server
 * Routes requests to appropriate handlers
 */

const { parseBody, sendJson, sendError, parseQuery, getPath } = require('./utils');
const auth = require('./auth');
const data = require('./data');
const game = require('./game');

/**
 * Handle incoming HTTP request
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function handleRequest(req, res) {
    const path = getPath(req.url);
    const method = req.method;

    console.log(`${method} ${path}`);

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        });
        res.end();
        return;
    }

    try {
        // Route based on path
        switch (path) {
            case '/register':
                await handleRegister(req, res);
                break;

            case '/join':
                await handleJoin(req, res);
                break;

            case '/leave':
                await handleLeave(req, res);
                break;

            case '/roll':
                await handleRoll(req, res);
                break;

            case '/pass':
                await handlePass(req, res);
                break;

            case '/notify':
                await handleNotify(req, res);
                break;

            case '/update':
                handleUpdate(req, res);
                break;

            case '/ranking':
                handleRanking(req, res);
                break;

            default:
                sendError(res, 'Endpoint not found', 404);
        }
    } catch (e) {
        console.error('Request error:', e);
        sendError(res, 'Internal server error', 500);
    }
}

/**
 * POST /register
 */
async function handleRegister(req, res) {
    if (req.method !== 'POST') {
        return sendError(res, 'Method not allowed', 405);
    }

    const body = await parseBody(req);
    const { nick, password } = body;

    if (!nick || !password) {
        return sendError(res, 'Nick and password are required', 400);
    }

    const result = auth.register(nick, password);

    if (!result.success) {
        return sendError(res, result.error, 401);
    }

    sendJson(res, {});
}

/**
 * POST /join
 */
async function handleJoin(req, res) {
    if (req.method !== 'POST') {
        return sendError(res, 'Method not allowed', 405);
    }

    const body = await parseBody(req);
    const { group, nick, password, size } = body;

    if (!group || !nick || !password || !size) {
        return sendError(res, 'Group, nick, password, and size are required', 400);
    }

    const result = game.join(group, nick, password, size);

    if (result.error) {
        return sendError(res, result.error, 400);
    }

    sendJson(res, result);
}

/**
 * POST /leave
 */
async function handleLeave(req, res) {
    if (req.method !== 'POST') {
        return sendError(res, 'Method not allowed', 405);
    }

    const body = await parseBody(req);
    const { nick, password, game: gameId } = body;

    if (!nick || !password || !gameId) {
        return sendError(res, 'Nick, password, and game are required', 400);
    }

    const result = game.leave(nick, password, gameId);

    if (result.error) {
        return sendError(res, result.error, 400);
    }

    sendJson(res, result);
}

/**
 * POST /roll
 */
async function handleRoll(req, res) {
    if (req.method !== 'POST') {
        return sendError(res, 'Method not allowed', 405);
    }

    const body = await parseBody(req);
    const { nick, password, game: gameId } = body;

    if (!nick || !password || !gameId) {
        return sendError(res, 'Nick, password, and game are required', 400);
    }

    const result = game.roll(nick, password, gameId);

    if (result.error) {
        return sendError(res, result.error, 400);
    }

    sendJson(res, result);
}

/**
 * POST /pass
 */
async function handlePass(req, res) {
    if (req.method !== 'POST') {
        return sendError(res, 'Method not allowed', 405);
    }

    const body = await parseBody(req);
    const { nick, password, game: gameId } = body;

    if (!nick || !password || !gameId) {
        return sendError(res, 'Nick, password, and game are required', 400);
    }

    const result = game.pass(nick, password, gameId);

    if (result.error) {
        return sendError(res, result.error, 400);
    }

    sendJson(res, result);
}

/**
 * POST /notify
 */
async function handleNotify(req, res) {
    if (req.method !== 'POST') {
        return sendError(res, 'Method not allowed', 405);
    }

    const body = await parseBody(req);
    const { nick, password, game: gameId, move } = body;

    if (!nick || !password || !gameId) {
        return sendError(res, 'Nick, password, and game are required', 400);
    }

    const result = game.notify(nick, password, gameId, move);

    if (result.error) {
        return sendError(res, result.error, 400);
    }

    sendJson(res, result);
}

/**
 * GET /update (Polling - returns JSON immediately)
 * Note: The spec mentions SSE, but our client uses polling
 */
function handleUpdate(req, res) {
    if (req.method !== 'GET') {
        return sendError(res, 'Method not allowed', 405);
    }

    const query = parseQuery(req.url);
    const { nick, game: gameId } = query;

    if (!nick || !gameId) {
        return sendError(res, 'Nick and game are required', 400);
    }

    // Get current game state and return immediately (polling mode)
    const gameData = data.getGame(gameId);

    if (!gameData) {
        return sendError(res, 'Game not found', 404);
    }

    // Return the game state
    const state = {
        pieces: gameData.pieces,
        players: gameData.players,
        initial: gameData.initial,
        turn: gameData.turn,
        dice: gameData.dice,
        mustPass: gameData.mustPass,
        step: gameData.step,
        selected: gameData.selected,
        winner: gameData.winner
    };

    sendJson(res, state);
}

/**
 * GET /ranking
 */
function handleRanking(req, res) {
    // Accept both GET and POST for ranking
    const query = req.method === 'GET'
        ? parseQuery(req.url)
        : null;

    if (req.method === 'GET') {
        const { group, size } = query;

        if (!group || !size) {
            return sendError(res, 'Group and size are required', 400);
        }

        const ranking = data.getRankingList(group, size);
        sendJson(res, { ranking });
    } else if (req.method === 'POST') {
        parseBody(req).then(body => {
            const { group, size } = body;

            if (!group || !size) {
                return sendError(res, 'Group and size are required', 400);
            }

            const ranking = data.getRankingList(group, size);
            sendJson(res, { ranking });
        }).catch(() => {
            sendError(res, 'Invalid request body', 400);
        });
    } else {
        sendError(res, 'Method not allowed', 405);
    }
}

module.exports = { handleRequest };
