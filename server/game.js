/**
 * Game logic module for SeWenta/Tâb server
 * Handles game mechanics: join, leave, roll, pass, notify, update
 */

const auth = require('./auth');
const data = require('./data');

// SSE connections for real-time updates
const sseConnections = new Map(); // gameId -> Map<nick, response>

/**
 * Roll 4 sticks (each 0 or 1)
 * @returns {{ stickValues: number[], value: number, keepPlaying: boolean }}
 */
function rollDice() {
    const stickValues = [];
    let sum = 0;

    for (let i = 0; i < 4; i++) {
        // Each stick has ~50% chance of 0 or 1
        const val = Math.random() < 0.5 ? 0 : 1;
        stickValues.push(val);
        sum += val;
    }

    // Special case: if all sticks are 0, value is 6 (Yut!)
    // If all sticks are 1, value is 4 (Mo)
    // Otherwise value is the count of 1s (Tâb=1, Do=2, Se=3)
    let value;
    if (sum === 0) {
        value = 6; // Yut - all backs
    } else {
        value = sum; // 1-4
    }

    // Can roll again if got 1 (Tâb), 4 (Mo), or 6 (Yut)
    const keepPlaying = value === 1 || value === 4 || value === 6;

    return { stickValues, value, keepPlaying };
}

/**
 * Initialize pieces for a game board
 * @param {number} size - number of columns
 * @returns {Array} - pieces array
 */
function initializePieces(size) {
    const pieces = new Array(4 * size).fill(null);

    // Blue pieces on row 3 (indices 3*size to 4*size-1)
    // Red pieces on row 0 (indices 0 to size-1)
    for (let col = 0; col < size; col++) {
        // Red pieces (player 1) - row 0
        pieces[col] = {
            color: 'red',
            inMotion: false,
            reachedLastRow: false
        };

        // Blue pieces (player 2) - row 3
        pieces[3 * size + col] = {
            color: 'blue',
            inMotion: false,
            reachedLastRow: false
        };
    }

    return pieces;
}

/**
 * Join a game (matchmaking)
 * @param {number} group
 * @param {string} nick
 * @param {string} password
 * @param {number} size
 * @returns {Object}
 */
function join(group, nick, password, size) {
    // Verify user
    if (!auth.verifyUser(nick, password)) {
        return { error: 'Authentication failed' };
    }

    // Validate size (must be odd)
    if (!size || size < 5 || size % 2 === 0) {
        return { error: 'Size must be an odd number >= 5' };
    }

    const games = data.getGames();

    // Look for a pending game with same group and size
    for (const [gameId, game] of Object.entries(games)) {
        if (game.status === 'pending' &&
            game.group === group &&
            game.size === size &&
            !game.players[nick]) {

            // Found a pending game - join as second player
            const player1 = Object.keys(game.players)[0];
            game.players[nick] = 'blue';
            game.status = 'active';
            game.initial = Math.random() < 0.5 ? player1 : nick;
            game.turn = game.initial;
            game.pieces = initializePieces(size);

            data.setGame(gameId, game);

            // Notify waiting player via SSE
            broadcastToGame(gameId, getGameState(gameId, player1));

            return {
                game: gameId,
                ...getGameState(gameId, nick)
            };
        }
    }

    // No pending game found - create new one
    const gameId = auth.generateGameId(`${group}_${size}_${nick}_${Date.now()}`);

    const newGame = {
        id: gameId,
        group,
        size,
        status: 'pending',
        players: { [nick]: 'red' },
        initial: null,
        turn: null,
        pieces: null,
        dice: null,
        mustPass: false,
        winner: null,
        step: null,
        selected: [],
        createdAt: Date.now()
    };

    data.setGame(gameId, newGame);

    return {
        game: gameId
    };
}

/**
 * Leave a game
 * @param {string} nick
 * @param {string} password
 * @param {string} gameId
 * @returns {Object}
 */
function leave(nick, password, gameId) {
    if (!auth.verifyUser(nick, password)) {
        return { error: 'Authentication failed' };
    }

    const game = data.getGame(gameId);
    if (!game) {
        return { error: 'Game not found' };
    }

    if (!game.players[nick]) {
        return { error: 'Player not in this game' };
    }

    // If game is active, the other player wins
    if (game.status === 'active') {
        const otherPlayer = Object.keys(game.players).find(p => p !== nick);
        if (otherPlayer) {
            game.winner = otherPlayer;
            game.status = 'finished';

            // Update rankings
            data.updateRanking(game.group, game.size, nick, false);
            data.updateRanking(game.group, game.size, otherPlayer, true);

            data.setGame(gameId, game);

            // Notify other player
            broadcastToGame(gameId, getGameState(gameId, otherPlayer));
        }
    } else if (game.status === 'pending') {
        // Just delete the pending game
        data.deleteGame(gameId);
    }

    // Close SSE connection for this player
    closeSSEConnection(gameId, nick);

    return {};
}

/**
 * Roll dice
 * @param {string} nick
 * @param {string} password
 * @param {string} gameId
 * @returns {Object}
 */
function roll(nick, password, gameId) {
    if (!auth.verifyUser(nick, password)) {
        return { error: 'Authentication failed' };
    }

    const game = data.getGame(gameId);
    if (!game) {
        return { error: 'Game not found' };
    }

    if (game.status !== 'active') {
        return { error: 'Game is not active' };
    }

    if (game.turn !== nick) {
        return { error: 'Not your turn' };
    }

    // Roll the dice
    const dice = rollDice();
    dice.id = Date.now(); // Unique ID to prevent duplicate history entries
    game.dice = dice;

    // Check if player must pass
    game.mustPass = checkMustPass(game, nick);

    // Determine step
    game.step = 'from'; // Player needs to select piece to move

    // Find valid pieces to select
    game.selected = findValidPieces(game, nick);

    data.setGame(gameId, game);

    // Broadcast to all players
    broadcastToGame(gameId, getGameState(gameId, nick));

    return {
        dice,
        mustPass: game.mustPass,
        ...getGameState(gameId, nick)
    };
}

/**
 * Pass turn
 * @param {string} nick
 * @param {string} password
 * @param {string} gameId
 * @returns {Object}
 */
function pass(nick, password, gameId) {
    if (!auth.verifyUser(nick, password)) {
        return { error: 'Authentication failed' };
    }

    const game = data.getGame(gameId);
    if (!game) {
        return { error: 'Game not found' };
    }

    if (game.status !== 'active') {
        return { error: 'Game is not active' };
    }

    if (game.turn !== nick) {
        return { error: 'Not your turn' };
    }

    // Verify if player is allowed to pass
    if (!game.mustPass && !checkMustPass(game, nick)) {
        return { error: 'You have valid moves, cannot pass' };
    }

    // Switch turn to other player
    const players = Object.keys(game.players);
    game.turn = players.find(p => p !== nick);
    game.dice = null;
    game.mustPass = false;
    game.step = null;
    game.selected = [];

    data.setGame(gameId, game);

    // Broadcast to all players
    broadcastToGame(gameId, getGameState(gameId, nick));

    return getGameState(gameId, nick);
}

/**
 * Notify a move
 * @param {string} nick
 * @param {string} password
 * @param {string} gameId
 * @param {Object} move
 * @returns {Object}
 */
function notify(nick, password, gameId, move) {
    if (!auth.verifyUser(nick, password)) {
        return { error: 'Authentication failed' };
    }

    const game = data.getGame(gameId);
    if (!game) {
        return { error: 'Game not found' };
    }

    if (game.status !== 'active') {
        return { error: 'Game is not active' };
    }

    if (game.turn !== nick) {
        return { error: 'Not your turn' };
    }

    if (!move || !move.cell) {
        return { error: 'Invalid move format' };
    }

    const { square, position } = move.cell;
    const playerColor = game.players[nick];

    // Check for re-selection (clicking another own piece while in 'to' step)
    if (game.step === 'to') {
        const targetPiece = game.pieces[square];
        if (targetPiece && targetPiece.color === playerColor) {
            // Switch back to selection mode
            game.step = 'from';
            // Clear previous selection state if needed
            game.selected = [];
            delete game.fromSquare;
        }
    }

    // Process the move based on current step
    if (game.step === 'from') {
        // Player is selecting a piece to move
        const piece = game.pieces[square];
        if (!piece || piece.color !== playerColor) {
            return { error: 'Invalid piece selection' };
        }

        // Calculate valid destinations
        const validDests = calculateValidDestinations(game, square);
        if (validDests.length === 0) {
            return { error: 'No valid moves for this piece' };
        }

        game.selected = validDests;
        game.step = 'to';
        game.fromSquare = square; // Store the selected piece position

    } else if (game.step === 'to') {
        // Player is selecting destination
        if (!game.selected.includes(square)) {
            return { error: 'Invalid destination' };
        }

        // Execute the move
        const fromSquare = game.fromSquare;
        const piece = game.pieces[fromSquare];

        // Check for capture
        const targetPiece = game.pieces[square];
        if (targetPiece && targetPiece.color !== playerColor) {
            // Capture - remove enemy piece
            game.pieces[square] = null;
        }

        // Move the piece
        game.pieces[square] = piece;
        game.pieces[fromSquare] = null;

        // Update piece state
        piece.inMotion = true;

        // Check if reached last row
        const size = game.size;
        const isLastRow = (playerColor === 'blue' && square < size) ||
            (playerColor === 'red' && square >= 3 * size);
        if (isLastRow) {
            piece.reachedLastRow = true;
        }

        // Check for win
        const winner = checkWinner(game);
        if (winner) {
            game.winner = winner;
            game.status = 'finished';

            // Update rankings
            const players = Object.keys(game.players);
            for (const p of players) {
                data.updateRanking(game.group, game.size, p, p === winner);
            }
        }

        // Check if player gets another roll (dice was 1, 4, or 6)
        if (!winner && game.dice && game.dice.keepPlaying) {
            // Keep same turn, but need new roll
            game.dice = null;
            game.step = null;
            game.selected = [];
        } else if (!winner) {
            // Switch turn
            const players = Object.keys(game.players);
            game.turn = players.find(p => p !== nick);
            game.dice = null;
            game.step = null;
            game.selected = [];
        }

        delete game.fromSquare;
    }

    data.setGame(gameId, game);

    // Broadcast to all players
    broadcastToGame(gameId, getGameState(gameId, nick));

    return getGameState(gameId, nick);
}

/**
 * Handle SSE update connection
 * @param {string} nick
 * @param {string} gameId
 * @param {http.ServerResponse} res
 */
function handleUpdate(nick, gameId, res) {
    const game = data.getGame(gameId);
    if (!game) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Game not found' }));
        return;
    }

    // Set up SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    // Store connection
    if (!sseConnections.has(gameId)) {
        sseConnections.set(gameId, new Map());
    }
    sseConnections.get(gameId).set(nick, res);

    // Send initial state
    const state = getGameState(gameId, nick);
    res.write(`data: ${JSON.stringify(state)}\n\n`);

    // Handle connection close
    res.on('close', () => {
        closeSSEConnection(gameId, nick);
    });
}

/**
 * Close SSE connection
 */
function closeSSEConnection(gameId, nick) {
    if (sseConnections.has(gameId)) {
        sseConnections.get(gameId).delete(nick);
        if (sseConnections.get(gameId).size === 0) {
            sseConnections.delete(gameId);
        }
    }
}

/**
 * Broadcast game state to all connected players
 */
function broadcastToGame(gameId, state) {
    if (!sseConnections.has(gameId)) return;

    for (const [nick, res] of sseConnections.get(gameId)) {
        try {
            const playerState = getGameState(gameId, nick);
            res.write(`data: ${JSON.stringify(playerState)}\n\n`);
        } catch (e) {
            // Connection might be closed
            closeSSEConnection(gameId, nick);
        }
    }
}

/**
 * Get game state for a player
 */
function getGameState(gameId, nick) {
    const game = data.getGame(gameId);
    if (!game) return null;

    return {
        pieces: game.pieces,
        players: game.players,
        initial: game.initial,
        turn: game.turn,
        dice: game.dice,
        mustPass: game.mustPass,
        step: game.step,
        selected: game.selected,
        fromSquare: game.fromSquare,
        winner: game.winner
    };
}

/**
 * Check if player must pass
 */
function checkMustPass(game, nick) {
    const validPieces = findValidPieces(game, nick);
    return validPieces.length === 0;
}

/**
 * Find valid pieces that can be moved
 */
function findValidPieces(game, nick) {
    const playerColor = game.players[nick];
    const valid = [];

    for (let i = 0; i < game.pieces.length; i++) {
        const piece = game.pieces[i];
        if (piece && piece.color === playerColor) {
            const dests = calculateValidDestinations(game, i);
            if (dests.length > 0) {
                valid.push(i);
            }
        }
    }

    return valid;
}

/**
 * Calculate valid destinations for a piece
 * Full implementation including all game rules
 */
function calculateValidDestinations(game, squareIndex) {
    const piece = game.pieces[squareIndex];
    if (!piece) return [];

    const size = game.size;
    const diceValue = game.dice ? game.dice.value : 0;
    if (diceValue === 0) return [];

    const color = piece.color;
    const row = Math.floor(squareIndex / size);
    const col = squareIndex % size;

    // If piece hasn't moved yet, it needs dice value of 1 to start
    if (!piece.inMotion && diceValue !== 1) {
        return [];
    }

    // RULE: "Uma peça na 4ª linha só se pode mover se o jogador não tiver mais peças na sua linha inicial"
    // Check if piece is in the 4th line (last row for this color)
    const lastRow = (color === 'blue') ? 0 : 3;
    const startRow = (color === 'blue') ? 3 : 0;

    if (row === lastRow) {
        // Check if there are still pieces in the starting row
        const hasStartRowPieces = hasPiecesInRow(game, color, startRow, size);
        if (hasStartRowPieces) {
            // Cannot move this piece yet
            return [];
        }
    }

    // Calculate all possible destinations considering branching
    let positions = [{ row, col }];

    for (let step = 0; step < diceValue; step++) {
        const nextPositions = [];

        for (const pos of positions) {
            const next = moveOneStep(pos.row, pos.col, size, color);

            if (Array.isArray(next)) {
                // Multiple destinations (branching at 3rd line exit)
                next.forEach(p => {
                    // Check if this branch is valid
                    if (isValidBranch(piece, p, color, size)) {
                        nextPositions.push(p);
                    }
                });
            } else {
                if (isValidBranch(piece, next, color, size)) {
                    nextPositions.push(next);
                }
            }
        }

        positions = nextPositions;
        if (positions.length === 0) break;
    }

    // Filter destinations: remove those occupied by own pieces and apply additional rules
    const validDestinations = [];

    for (const pos of positions) {
        const destSquare = pos.row * size + pos.col;
        const destPiece = game.pieces[destSquare];

        // Can't land on own piece
        if (destPiece && destPiece.color === color) {
            continue;
        }

        // RULE: Pieces can only enter the 4th line once
        // If piece already visited last row and left, can't go back
        if (piece.reachedLastRow && pos.row === lastRow && row !== lastRow) {
            continue;
        }

        validDestinations.push(destSquare);
    }

    // Remove duplicates
    return [...new Set(validDestinations)];
}

/**
 * Check if a color has pieces in a specific row
 */
function hasPiecesInRow(game, color, targetRow, size) {
    const startIndex = targetRow * size;
    const endIndex = startIndex + size;

    for (let i = startIndex; i < endIndex; i++) {
        const piece = game.pieces[i];
        if (piece && piece.color === color) {
            return true;
        }
    }
    return false;
}

/**
 * Check if a branch destination is valid for the piece
 */
function isValidBranch(piece, destination, color, size) {
    const lastRow = (color === 'blue') ? 0 : 3;

    // If piece already left the last row, can't go back
    if (piece.reachedLastRow && destination.row === lastRow) {
        // Allow staying in last row if already there
        // This check is for branches that would lead back to last row
        return false;
    }

    return true;
}

/**
 * Move one step on the board following Tâb rules
 */
function moveOneStep(row, col, size, color) {
    // Direction based on color and row
    // Blue: rows 0,2 move right, rows 1,3 move left
    // Red: rows 1,3 move right, rows 0,2 move left

    const isForwardRow = (color === 'blue')
        ? (row === 1 || row === 3)
        : (row === 0 || row === 2);

    const dir = (color === 'red') ? -1 : 1;
    let nextCol, atEdge;

    if (isForwardRow) {
        nextCol = col + dir;
        atEdge = (dir === 1) ? (nextCol >= size) : (nextCol < 0);
    } else {
        nextCol = col - dir;
        atEdge = (dir === 1) ? (nextCol < 0) : (nextCol >= size);
    }

    if (!atEdge) {
        return { row, col: nextCol };
    }

    // Row transitions
    if (color === 'blue') {
        if (row === 0) return { row: 1, col };
        if (row === 1) return [{ row: 0, col }, { row: 2, col }];
        if (row === 2) return { row: 1, col };
        if (row === 3) return { row: 2, col };
    } else {
        if (row === 0) return { row: 1, col };
        if (row === 1) return { row: 2, col };
        if (row === 2) return { row: 1, col };
        // Red cannot enter row 3
    }

    return { row, col };
}

/**
 * Check for winner
 */
function checkWinner(game) {
    let hasBlue = false;
    let hasRed = false;

    for (const piece of game.pieces) {
        if (piece) {
            if (piece.color === 'blue') hasBlue = true;
            if (piece.color === 'red') hasRed = true;
        }
    }

    if (!hasBlue) {
        // Blue has no pieces, red player wins
        return Object.entries(game.players).find(([_, c]) => c === 'red')?.[0];
    }
    if (!hasRed) {
        // Red has no pieces, blue player wins
        return Object.entries(game.players).find(([_, c]) => c === 'blue')?.[0];
    }

    return null;
}

module.exports = {
    join,
    leave,
    roll,
    pass,
    notify,
    handleUpdate,
    rollDice
};
