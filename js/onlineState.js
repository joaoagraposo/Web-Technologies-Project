// Global state for online mode
const onlineState = {
    isOnline: false,        // true when playing online
    nick: null,             // player username
    password: null,         // password for API calls
    gameId: null,           // current game ID (from server)
    group: null,            // group number for matchmaking
    pollingActive: false,   // controls update loop

    myTurn: false,          // true when it's this player's turn
    myColor: null,          // color assigned by server
    lastProcessedDiceId: null // ID of last processed dice roll
};

// Export for global use
window.onlineState = onlineState;
