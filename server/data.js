/**
 * Data persistence module for SeWenta/Tâb server
 * Handles loading and saving data to JSON files
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// In-memory storage
let users = {};
let games = {};
let rankings = {};

/**
 * Load data from JSON files
 */
function loadData() {
    try {
        const usersPath = path.join(DATA_DIR, 'users.json');
        if (fs.existsSync(usersPath)) {
            users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        }
    } catch (e) {
        console.error('Error loading users:', e.message);
        users = {};
    }

    try {
        const gamesPath = path.join(DATA_DIR, 'games.json');
        if (fs.existsSync(gamesPath)) {
            games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));
        }
    } catch (e) {
        console.error('Error loading games:', e.message);
        games = {};
    }

    try {
        const rankingsPath = path.join(DATA_DIR, 'rankings.json');
        if (fs.existsSync(rankingsPath)) {
            rankings = JSON.parse(fs.readFileSync(rankingsPath, 'utf8'));
        }
    } catch (e) {
        console.error('Error loading rankings:', e.message);
        rankings = {};
    }

    console.log(`Loaded ${Object.keys(users).length} users, ${Object.keys(games).length} games`);
}

/**
 * Save users to file
 */
function saveUsers() {
    try {
        fs.writeFileSync(
            path.join(DATA_DIR, 'users.json'),
            JSON.stringify(users, null, 2)
        );
    } catch (e) {
        console.error('Error saving users:', e.message);
    }
}

/**
 * Save games to file
 */
function saveGames() {
    try {
        fs.writeFileSync(
            path.join(DATA_DIR, 'games.json'),
            JSON.stringify(games, null, 2)
        );
    } catch (e) {
        console.error('Error saving games:', e.message);
    }
}

/**
 * Save rankings to file
 */
function saveRankings() {
    try {
        fs.writeFileSync(
            path.join(DATA_DIR, 'rankings.json'),
            JSON.stringify(rankings, null, 2)
        );
    } catch (e) {
        console.error('Error saving rankings:', e.message);
    }
}

/**
 * Get all users
 */
function getUsers() {
    return users;
}

/**
 * Set user (for registration)
 */
function setUser(nick, passwordHash) {
    users[nick] = passwordHash;
    saveUsers();
}

/**
 * Get user password hash
 */
function getUser(nick) {
    return users[nick];
}

/**
 * Get all games
 */
function getGames() {
    return games;
}

/**
 * Set game
 */
function setGame(gameId, gameData) {
    games[gameId] = gameData;
    saveGames();
}

/**
 * Get game by ID
 */
function getGame(gameId) {
    return games[gameId];
}

/**
 * Delete game
 */
function deleteGame(gameId) {
    delete games[gameId];
    saveGames();
}

/**
 * Get rankings
 */
function getRankings() {
    return rankings;
}

/**
 * Update player ranking
 */
function updateRanking(group, size, nick, won) {
    const key = `${group}_${size}`;
    if (!rankings[key]) {
        rankings[key] = {};
    }

    if (!rankings[key][nick]) {
        rankings[key][nick] = { nick, games: 0, victories: 0 };
    }

    rankings[key][nick].games++;
    if (won) {
        rankings[key][nick].victories++;
    }

    saveRankings();
}

/**
 * Get ranking list for group and size
 */
function getRankingList(group, size) {
    const key = `${group}_${size}`;
    const data = rankings[key] || {};

    return Object.values(data)
        .sort((a, b) => b.victories - a.victories || a.games - b.games);
}

module.exports = {
    loadData,
    getUsers,
    setUser,
    getUser,
    getGames,
    setGame,
    getGame,
    deleteGame,
    getRankings,
    updateRanking,
    getRankingList
};
