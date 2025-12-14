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
