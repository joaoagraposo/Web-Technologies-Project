// Estado global para modo online
const onlineState = {
    isOnline: false,        // true quando a jogar online
    nick: null,             // username do jogador
    password: null,         // password para chamadas API
    gameId: null,           // ID do jogo atual (do servidor)
    group: null,            // número do grupo para matchmaking
    pollingActive: false,   // controla o loop de update
    myTurn: false,          // true quando é a vez deste jogador
    myTurn: false,          // true quando é a vez deste jogador
    myColor: null,          // cor atribuída pelo servidor
    lastProcessedDiceId: null // ID do último lançamento de dado processado
};

// Exporta para uso global
window.onlineState = onlineState;
