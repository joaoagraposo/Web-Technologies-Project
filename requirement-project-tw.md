# Requisitos do Projeto de Tecnologias Web - Jogo SeWenta/Tâb
# Fonte: https://www.dcc.fc.up.pt/~zp/SeWenta/TW-25-26/
# Extraído em: 14/12/2025

================================================================================
## REGRAS DO JOGO (SeWenta/Tâb)
================================================================================

### TABULEIRO:
- 4 linhas com 8 casas cada
- Cores das casas alternadas

### PEÇAS:
- 7 peças por jogador
- Cores distintas para cada jogador (ex: azul, vermelho)
- As peças começam na primeira linha do lado de cada jogador

### DADO DE PAUS:
- Utiliza 4 paus
- Os valores possíveis são de 1 (Tâb) a 4 (e 6)
- Obter 1, 4 ou 6 num lançamento permite ao jogador lançar novamente

### INÍCIO DO MOVIMENTO:
- A primeira vez que uma peça se move tem de ser com um lançamento de 1 (Tâb)
- Se o valor do dado não for 1 mas 4 ou 6, o jogador deve repetir o lançamento até obter um valor diferente ou 1
- A casa de destino não pode ter peças do próprio jogador
- Começam-se a mover as peças que estão mais à direita na linha inicial

### PROGRESSÃO DAS PEÇAS:
- 1ª e 3ª linhas: as peças movem-se da esquerda para a direita
- 2ª e 4ª linhas: as peças movem-se da direita para a esquerda
- Ao sair da 1ª linha, a peça passa para a 2ª; da 2ª passa para a 3ª
- Ao sair da 3ª linha, a peça pode passar para a 4ª linha OU voltar para a 2ª linha (o jogador escolhe)
- Ao sair da 4ª linha, a peça volta para a 3ª linha

### RESTRIÇÕES DE MOVIMENTO:
- Só pode haver uma peça em cada casa
- As peças só podem entrar uma única vez na 4ª e última linha
- Uma peça na 4ª linha só se pode mover se o jogador não tiver mais peças da sua cor na sua linha inicial (a primeira linha)
- Uma peça não pode regressar à linha inicial do jogador

### PASSAR A VEZ:
- Se o valor do dado não permitir qualquer jogada válida e também não permitir novo lançamento (não foi 1, 4 ou 6), o jogador terá de passar a vez
- O jogador não pode passar a vez se houver uma jogada válida possível ou se tiver a possibilidade de lançar novamente o dado

### CAPTURAR PEÇAS:
- Se existir uma peça do adversário na casa de destino de um movimento, a peça do adversário é capturada
- Peças capturadas desaparecem do tabuleiro

### FIM DO JOGO:
- O jogo termina quando um jogador fica sem nenhuma peça no tabuleiro
- Ganha o jogador que ainda tiver peças em jogo

================================================================================
## PRIMEIRA ENTREGA DO PROJETO
================================================================================

### REQUISITOS GERAIS:
- O jogo deve ser uma Aplicação de Página Única (Single-Page Application - SPA)
- Toda a apresentação deve estar contida numa única página HTML; não devem ser carregadas outras páginas HTML
- A formatação (CSS) e o código (JavaScript) devem estar em ficheiros independentes, ligados ao HTML
- Os ficheiros HTML e CSS devem ser validados

### ÁREAS DA INTERFACE GRÁFICA:

1. LOGOTIPO:
   - Apresentar o nome do jogo (Tâb ou um nome específico da implementação) de forma destacada (texto formatado ou imagem)

2. CONFIGURAÇÃO:
   Permitir ao jogador configurar:
   - Tamanho do tabuleiro
   - Modo de jogo: contra o computador (obrigatório na primeira entrega) ou contra outro jogador (para a segunda entrega)
   - Qual o primeiro jogador a jogar
   - Nível da Inteligência Artificial (IA)

3. COMANDOS:
   Botões ou controlos para:
   - Visualizar as instruções do jogo
   - Iniciar o jogo com as configurações selecionadas
   - Passar a vez (só quando for impossível jogar)
   - Desistir do jogo (dando a vitória ao adversário)
   - Visualizar as classificações

4. IDENTIFICAÇÃO:
   - Área para autenticação do jogador (identificador e senha) - para a segunda entrega
   - Na primeira entrega, esta área deve ser criada e formatada, mas a autenticação não é necessária
   - Após autenticação (futuramente), mostrará o identificador e permitirá terminar sessão

5. DADO DE PAUS (Interface):
   - Área para lançar o dado de paus e mostrar o seu valor
   - Lançamento pode ser ativado por clique nesta área
   - Visualização pode mostrar a face de cada pau
   - O estado do dado deve ser revertido ao inicial no final de cada jogada (antes do próximo lançamento)

6. TABULEIRO (Interface):
   - Área principal da interação
   - CODIFICAÇÃO:
     - Numa primeira fase, pode ser HTML+CSS para linhas e peças
     - Numa segunda fase, deve ser gerado por JavaScript (usando DOM e CSS in JS) a partir de uma estrutura de dados, permitindo tabuleiros de diferentes tamanhos conforme a configuração
     - A abordagem orientada a objetos é valorizada na representação do tabuleiro e da aplicação
   - MODOS DE INTERAÇÃO:
     - O clique no tabuleiro terá efeitos diferentes consoante o estado do jogo (ex: selecionar peça para mover, selecionar casa de destino da 3ª linha - 2ª ou 4ª)
     - O utilizador deve ser informado do modo atual (cursores, mensagens)

7. INSTRUÇÕES:
   - Área para apresentar as regras do jogo

8. CLASSIFICAÇÕES:
   - Área para mostrar classificações

9. MENSAGENS:
   - Área para feedback ao utilizador sobre o estado do jogo e ações

NOTA: Estas áreas não precisam estar sempre visíveis e podem sobrepor-se temporariamente.

### INTELIGÊNCIA ARTIFICIAL (IA):
- Além da interface, deve ser implementada uma IA para o modo de jogo contra o computador

================================================================================
## SEGUNDA ENTREGA
================================================================================

### OBJETIVO:
- Jogo distribuído com jogadores em diferentes computadores
- Servidor web em: http://twserver.alunos.dcc.fc.up.pt:8008/

### API DO SERVIDOR:
Pedidos POST com JSON (exceto update):

1. REGISTER: (nick, password)
   - Regista ou verifica utilizador

2. JOIN: (group, nick, password, size)
   - Junta jogadores para iniciar jogo
   - group = número do grupo de TW
   - size = número de colunas do tabuleiro

3. LEAVE: (nick, password, game)
   - Desistir de jogo não terminado
   - game = id do jogo

4. ROLL: (nick, password, game)
   - Lança o dado de paus

5. PASS: (nick, password, game)
   - Passar a vez de jogar

6. NOTIFY: (nick, password, game, move)
   - Notifica servidor de uma jogada
   - move = objeto com detalhes da jogada

7. UPDATE: (nick, game)
   - Atualiza situação do jogo
   - GET com Server-Sent Events
   - Dados urlencoded

8. RANKING: (group, size)
   - Retorna tabela classificativa

### PARÂMETROS DOS PEDIDOS (Detalhes):

- nick: Identificador do jogador (string)
- password: Senha do jogador (string)
- size: Número de colunas do tabuleiro (integer)
- game: Hash identificador do jogo (string)
- cell: Objeto com:
  - square: Índice da casa (0 a rows*cols-1)
  - position: Índice dentro do array pieces
- group: Número do grupo de TW (integer)

### RESPOSTAS DA API (Formato JSON):

- cell: Objeto com "square" e "position"
- dice: Objeto com:
  - stickValues: Array com valores de cada pau [0 ou 1]
  - value: Soma total (1-4 ou 6)
  - keepPlaying: Booleano - se pode lançar novamente (true se value = 1, 4 ou 6)
- error: Mensagem de erro (quando HTTP != 200)
- game: Hash identificador do jogo (string)
- initial: Nick do jogador que começa
- mustPass: Booleano - true se o jogador tem de passar a vez
- pieces: Array representando o tabuleiro, cada elemento é:
  - null (casa vazia)
  - Objeto com:
    - color: Cor da peça ("blue" ou "red")
    - inMotion: Booleano - se a peça já saiu da linha inicial
    - reachedLastRow: Booleano - se a peça já entrou na 4ª linha
- players: Objeto com nicks como chaves e cores como valores
  Exemplo: {"jogador1": "blue", "jogador2": "red"}
- ranking: Lista de objetos com:
  - nick: Nome do jogador
  - games: Número de jogos
  - victories: Número de vitórias
- selected: Array de inteiros (índices de pieces) - casas selecionadas/válidas
- step: String indicando fase da jogada:
  - "from": Selecionar peça a mover
  - "to": Selecionar destino
  - "take": Capturar peça adversária
- turn: Nick do jogador com a vez
- winner: Nick do vencedor (ou null se jogo em curso)

### EXEMPLOS DE UTILIZAÇÃO:

1. REGISTO:
   Pedido: POST /register
   Body: {"nick": "jogador1", "password": "senha123"}
   Resposta: {} (sucesso) ou {"error": "mensagem"} (erro)

2. INÍCIO DE JOGO (JOIN):
   Pedido: POST /join
   Body: {"group": 99, "nick": "jogador1", "password": "senha123", "size": 8}
   Resposta: {"game": "hash123...", "players": {...}, "initial": "jogador1", ...}

3. SAÍDA (LEAVE):
   Pedido: POST /leave
   Body: {"nick": "jogador1", "password": "senha123", "game": "hash123..."}
   Resposta: {} (sucesso)

4. LANÇAR DADO (ROLL):
   Pedido: POST /roll
   Body: {"nick": "jogador1", "password": "senha123", "game": "hash123..."}
   Resposta: {"dice": {"stickValues": [0,1,0,1], "value": 2, "keepPlaying": false}, ...}

5. PASSAR VEZ (PASS):
   Pedido: POST /pass
   Body: {"nick": "jogador1", "password": "senha123", "game": "hash123..."}
   Resposta: {"turn": "jogador2", ...}

6. MOVER PEÇA (NOTIFY):
   Pedido: POST /notify
   Body: {"nick": "jogador1", "password": "senha123", "game": "hash123...", 
          "move": {"cell": {"square": 5, "position": 5}}}
   Resposta: {"pieces": [...], "selected": [...], "step": "to", ...}

7. UPDATE (Server-Sent Events):
   Pedido: GET /update?nick=jogador1&game=hash123...
   Resposta: Stream de eventos SSE com atualizações do estado do jogo

8. RANKING:
   Pedido: POST /ranking
   Body: {"group": 99, "size": 8}
   Resposta: {"ranking": [{"nick": "jogador1", "games": 10, "victories": 7}, ...]}

================================================================================
## VALORIZAÇÕES (Funcionalidades Extra)
================================================================================

- Implementação de funcionalidades extra para valorização da nota
- Detalhes específicos a consultar na documentação do projeto

================================================================================
## TERCEIRA ENTREGA
================================================================================

### OBJETIVO:
- Implementar servidor Node.js próprio para o jogo
- Servidor publicado em twserver.alunos.dcc.fc.up.pt:81XX (XX = nº grupo)

### RESPOSTAS DO SERVIDOR:
- Devem seguir a especificação da secção "Respostas" da Segunda Entrega
- Códigos de estado HTTP:
  - 200: OK (sucesso)
  - 400: Bad Request (pedido inválido)
  - 401: Unauthorized (autenticação falhada)
  - 404: Not Found (recurso não encontrado)

### ESTRUTURAÇÃO DO SERVIDOR:
- Servidor organizado em módulos
- Ficheiro principal: index.js
  - Carrega módulos
  - Define processamento de pedidos
  - Inicia escuta na porta

### PERSISTÊNCIA DE DADOS:
- Dados da aplicação serializados em JSON
- Persistidos em ficheiros usando módulo 'fs'
- Em aplicação real usaria:
  - NoSQL: Redis
  - SQL: MySQL, MariaDB

### HASH E CIFRAS:
- game (ID do jogo): Gerar com:
  crypto.createHash('md5').update(value).digest('hex')
- passwords: DEVEM ser cifradas antes de guardar
  - Usar módulo 'crypto' do Node.js

### SERVIDOR - PUBLICAÇÃO:
- Endereço: twserver.alunos.dcc.fc.up.pt:81XX (XX = número do grupo)
- Alojado no back-end do twserver (máquina twserver-be)

### ACESSO AO SERVIDOR (SSH via Jump Server):
- Jump server: ssh.alunos.dcc.fc.up.pt

ACESSO SHELL:
ssh -J up999999999@ssh.alunos.dcc.fc.up.pt up999999999@twserver-be
(autenticação 2 vezes)

CÓPIA DE FICHEIROS:
scp -J up999999999@ssh.alunos.dcc.fc.up.pt * up999999999@twserver-be:pasta
(autenticação 2 vezes)

### VALORIZAÇÃO (TERCEIRA ENTREGA):
- Objetivo MÍNIMO: register, ranking
- VALORIZAÇÃO: join, leave, notify, update
- PARTICULARMENTE VALORIZADA: 
  Integração do trabalho da primeira entrega com o servidor Node.js em twserver

### SUBMISSÃO (TERCEIRA ENTREGA):
- Arquivo ZIP contendo:
  - Módulos JS do servidor
  - index.js (na raiz)
  - index.html
  - CSS da interface (primeira entrega)
  - JS do cliente (primeira entrega)
- JS do cliente configurado para comunicar com o servidor Node.js do grupo em twserver
- NOTA: Trabalho da primeira entrega NÃO será reavaliado

================================================================================
## NOTAS ADICIONAIS
================================================================================

- URL do projeto/documentação: https://www.dcc.fc.up.pt/~zp/SeWenta/TW-25-26/
- Servidor de jogo: http://twserver.alunos.dcc.fc.up.pt:8008/

### ESTRUTURA DO TABULEIRO (Representação):
- O tabuleiro é representado como um array linear de 4*cols elementos
- Linha 0 (índices 0 a cols-1): Linha inicial do jogador 1
- Linha 1 (índices cols a 2*cols-1): Segunda linha
- Linha 2 (índices 2*cols a 3*cols-1): Terceira linha
- Linha 3 (índices 3*cols a 4*cols-1): Linha inicial do jogador 2 / última linha

### FLUXO DE JOGO ONLINE:
1. Registar utilizador (register)
2. Entrar numa partida (join) - aguarda outro jogador
3. Receber atualizações via SSE (update)
4. Quando for a sua vez:
   a. Lançar dado (roll)
   b. Se mustPass=true, passar (pass)
   c. Senão, selecionar peça e destino (notify)
5. Repetir até haver vencedor


Registo

URL	Objeto no pedido	Objeto na resposta	Observações
.../register	{"nick": "zp", "password": "secret"}	{}	Registo sucedido
.../register	{"nick": "zp", "password": "just checking"}	{ "error": "User registered with a different password"}	Registo falhado
.../register	{"nick": "zp", "password": "secret"}	{}	Confirmação da password
.../register	{"nick": "jpleal", "password": "another"}	{}	Outro registo


Início

URL	Objeto no pedido	Objeto na resposta	Observações
.../join	{"group": 99, "nick": "zp", "password": "secret" }	{"error": "undefined size"}	Tamanho não definido
.../join	{ ... , "size": "large" }	{"error": "invalid size 'large'"}	Tamanho tem de ser inteiro impar
.../join	{"group": 99, "nick": "zp", "password": "secret", "size": 9 }	{"game": "fa93b40..."}	Novo jogo criado com tamanho 9 para o grupo 99
.../update?nick=zp&game=averseda		{ "error": "Invalid game reference"}	Exemplo de possível erro
.../update?nick=zp&game=fa93b40...			Primeiro jogador fica à espera
.../join	{"group": 99, "nick": "jpleal", "password": "another", "size": 9 }	{"game": "fa93b40..."}	Emparelhado com último jogo de tamanho 9 do grupo 99
Atualização de ambos os jogadores		{"pieces":[{...}, ...],"initial":"zp", "step":"from", "turn":"zp", "players":{"zp":"Blue","jpleal":"Red"}}	Atualização quando jogadores são emparelhados


Saída

URL	Objeto no pedido	Objeto na resposta	Observações
.../join	{"group": 99, "nick": "zp", "password": "secret", "size": 9 }	{"game": "fa93b4..."}	Novo jogo criado
.../update?nick=zp&game=fa93b4...			Primeiro jogador fica à espera
.../leave	{"nick": "zp", "password": "secret", "game": "fa93b4..." }	{}	Desistiu da espera
Atualização do jogador		{ "winner": null }	Terminou sem vencedores
.../join	{"group": 99, "nick": "zp", "password": "secret", "size": 9 }	{"game": "2fd9d..."}	Novo jogo criado
.../update?nick=zp&game=2fd9d...			Primeiro jogador aguarda eventos
.../join	{"group": 99, "nick": "jpleal", "password": "another"," size": 9 }	{"game": "2fd9d..."}	Emparelhado último jogo
.../update?nick=jpleal&game=2fd9d...			Segundo jogador aguarda eventos
Atualização de ambos os jogadores		{ "pieces": [[...]], "turn": "zp", "step": "from", ... }	Começou o jogo
.../leave	{"nick": "zp", "password": "secret", "game": "2fd9d..." }	{}	Saiu do jogo
Atualização de ambos os jogadores		{ "winner": "jpleal" }	Adversário ganhou

Lançar dado

URL	Objeto no pedido	Objeto na resposta	Observações
Atualização de ambos os jogadores		{ "turn": "zp", "pieces": [ ... ], ... }	Começou o jogo
.../roll	{ "nick": "jpleal", "password": "another", "game": "2fd9d..." }	{ "error": "Not your turn to play" }	Tentou lançar fora de vez
.../roll	{ "nick": "zp", ... }	{}	Lançamento válido
Atualização de ambos os jogadores		{ {"dice":{"stickValues":[false,false,false,false], "value":6,"keepPlaying":true},"turn":"zp","mustPass":null} }	Não pode mover nenhuma peça, mas pode voltar a lançar
.../roll	{ "nick": "zp", ... }	{}	Lançamento válido
Atualização de ambos os jogadores		{ {"dice":{"stickValues":[false,true,false,false], "value":1,"keepPlaying":true},"turn":"zp","mustPass":null} }	Saiu 1 (Tâb) e pode jogar a peça mais à direita

Passar a vez

URL	Objeto no pedido	Objeto na resposta	Observações
Atualização de ambos os jogadores		{ "turn": "jpleal", "pieces": [ ... ], ... }	Começou o jogo
.../roll	{ "nick": "jpleal", ... }	{}	lançamento válido
Atualização de ambos os jogadores		{"dice":{"stickValues":[false,true,false,true], "value":2,"keepPlaying": false},"turn":"jpleal", "mustPass":"jpleal"}	Ainda tem a vez mas tem de passar porque não pode mover nenhuma peça, nem pode voltar a lançar. "password": "another", "game": "2fd9d
.../pass	{ "nick": "zp", "password": "another", "game": "2fd9d..." }	{}	Passou a vez
Atualização de ambos os jogadores		{ "turn": "zp", ... } 	É a vez de jogar do adversário.
.../roll	{ "nick": "zp", ..." }	{}	lançamento válido
Atualização de ambos os jogadores		{"dice":{"stickValues":[false,false,false,false], "value":6,"keepPlaying":true}, "turn":"zp", "mustPass":null}	Saiu 6, não pode mover mas pode voltar a lançar
.../pass	{ "nick": "zp", ... }	{ "error": "You already rolled the dice but can roll it again"}	Não pode passar a vez
.../roll	{ "nick": "zp", ..." }	{}	
Atualização de ambos os jogadores		{"dice":{"stickValues":[false,true,false,false], "value":1, "keepPlaying":true},"turn":"zp", "mustPass": null }	Saiu 1 (Tâb) e pode jogar a peça mais à direita
.../pass	{ "nick": "zp", "password": "another", "game": "2fd9d..." }	{ "error": "You already rolled the dice and have valid moves"}	Não pode passar a vez

Mover - jogadas inválidas

URL	Objeto no pedido	Objeto na resposta	Observações
.../notify	{ "nick": "jpleal", "password": "another", "game": "2fd9d...", "cell": 26 }	{ "error": "not your turn to play" }	Jogada inválida
.../notify	{ "nick": "zp", "password": "secret", "game": "2fd9d...", "cell": true }	{ "error": "cell is not an integer" }	Jogada invalida
.../notify	{ "nick": "zp", "password": "secret", "game": "2fd9d...", "cell": -1 }	{ "error": "cell is negative" }	Jogada inválida
.../notify	{"nick": "zp", "password": "secret", "game": "2fd9d...", "cell": 0 }	{ "error": "cannot capture to your own piece"}	jogada inválida
.../notify	{"nick": "zp", "password": "secret", "game": "2fd9d...", "cell": 8 }	{}	Jogada válida
Atualização de ambos os jogadores		{ "turn": "zp", dice: null, "step": "from", initial: "zp" "pieces": [ ... ] }	Mantém turno mas dado já foi usado

Mover - começar

URL	Objeto no pedido	Objeto na resposta	Observações
.../notify	{"nick": "zp", "password": "secret", "game": "2fd9d...", "cell": 8 }	{}	Jogada válida
Atualização de ambos os jogadores		{ "cell": 8, "selected": [ 8, 9], "initial": "zp", dice: null, "step": "from", turn: "zp" "pieces": [ ... ], ... }	Mantém turno mas dado já foi usado
.../roll	{ "nick": "zp", ... }	{}	Novo lançamento
Atualização de ambos os jogadores		{ {"dice":{"stickValues":[false,true,false,true], "value":2,"keepPlaying":false},"turn":"zp","mustPass":null} }	Saiu 2 e só pode jogar a peça já movida.
.../notify	{"nick": "zp", "password": "secret", "game": "2fd9d...", "cell": 9 }	{}	Jogada válida
Atualização de ambos os jogadores		{ "cell": 9, "selected: [9, 11], dice: null, "initial": "jpleal", , "step": "from", turn: "zp" "pieces": [ ... ], ... }	Turno muda para adversário

Jogar - escolher

URL	Objeto no pedido	Objeto na resposta	Observações
Atualização de ambos os jogadores		{ "dice": { ...; "value": 3, ...}, "turn": "zp", "step": "from", "mustPass": false }	Está no passo de selecionar a peça (from).
.../notify	{"nick": "zp", ..., "cell": 25 }	{}	Jogada valida, mas incompleta.
Atualização de ambos os jogadores		{ "cell": 25, "selected": [28,10]"turn": "zp", "step": "to", "pieces": [ ... ], ... }	Pode selecionar 10 ou 28 como destino (to)
.../notify	{ "nick": "zp", ... , "cell": 26 }	{ "error": "Invalid move: must play the dice's value" }	Jogada inválida
.../notify	{ "nick": "zp", ... , "cell": 28 }	{}	Jogada válida
Atualização de ambos os jogadores		{ "cell": 25, "selected": [25, 28], "turn": "jpleal", "step": "from", ... }	Muda a vez, selecionar peça a mover

Jogar - reverter seleção

URL	Objeto no pedido	Objeto na resposta	Observações
Atualização de ambos os jogadores		{ "turn": "zp", "step": "from", "pieces": [ ... ], ... }	Mudou a vez, selecionar peça
.../notify	{"nick": "zp", "password": "secret", "game": "2fd9d...", "cell": 25 }	{}	Jogada válida de seleção de peça, mas requer o passo de escolha do destino
Atualização de ambos os jogadores		{ "cell": 25, ..., "turn": "zp", "step": "to", ... }	Notificação da jogada, selecionar destino (tabuleiro não é modificado)
.../notify	{"nick": "zp", ..., "cell": 25 }	{}	Escolheu peça correntemente selecionada, anulando a seleção
Atualização de ambos os jogadores		{ ..., "turn": "zp", "step": "from", ... }	Notificação da reversão, tem de selecionar uma peça (novamente)

Ganhar

URL	Objeto no pedido	Objeto na resposta	Observações
Atualização de ambos os jogadores		{ "turn": "jpleal", "step": "from", "pieces": [...], ... }	Recebe a vez
.../roll	{ "nick": "jplea", "password": "another", "game": "2fd9d..." }	{}	lançamento válido
Atualização de ambos os jogadores		{ {"dice":{"stickValues":[false,false,false,false], "value":6,"keepPlaying":true},"turn":"zp","mustPass":null} }	Lançamento válido
.../notify	{ "nick": "jpleal", "password": "another", "game": "2fd9d...", "cell": 12 }	{}	Captura última peça
Atualização de ambos os jogadores		{ "winner": "jpleal", "pieces": [...], ... }	Venceu
Não esquecer de fechar server sent events deste jogo

Tabela classificativa

URL	Objeto no pedido	Objeto na resposta	Observações
.../ranking	{}	{ "error": "Undefined group" }	Pedido invalido
.../ranking	{ "group": 99 }	{ "error": "Invalid size 'undefined'" }	Pedido invalido
.../ranking	{ "group": 99, "size": 3.1416 }	{ "error": "Invalid size '3.1416'" }	Pedido invalido
.../ranking	{ "group": "2 of us", "size": 3 }	{ "error": "Invalid group '2 of us'" }	Pedido invalido
.../ranking	{"group": 99, "size": 5 }	{ ranking: [] }	Ainda sem tabela classificativa
.../ranking	{ "group": 99, "size": 9 }	{ "ranking": [{"nick":"jpleal","victories":2,"games":2},{"nick":"zp","victories":0,"games":2}] }	Tabela classificativa
