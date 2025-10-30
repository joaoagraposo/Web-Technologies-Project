**Trabalho Prático**

O objetivo deste trabalho é o desenvolvimento de uma aplicação web em todas as suas vertentes. O trabalho será dividido em três fases, com entregas ao longo do semestre, correspondendo à sequência de tecnologias web apresentadas nas aulas teóricas. O trabalho consiste numa versão web do jogo Tâb.

---

### Regras do Tâb

**Descrição geral**  
Tâb é um jogo de tabuleiro para dois jogadores.  
O tabuleiro tem 4 linhas e um número ímpar de colunas (entre 7 e 15, geralmente 9).  
Cada jogador tem tantas peças quanto o número de colunas, e cada um joga com peças de uma cor diferente. O tabuleiro mostrado ao jogador está ajustado à sua perspetiva (para o adversário o tabuleiro está rodado 180º).

**Estado das peças**  
Cada peça pode estar em três estados:  
- Ainda não foi movida.  
- Já foi movida, mas não chegou à última linha.  
- Já esteve na última linha (4ª linha).  

O estado pode ser representado visualmente, por exemplo, com diferentes níveis de transparência.

---

### Dado de Paus

São usados 4 paus com duas faces: uma escura (arredondada) e outra clara (plana).  
Os paus são lançados simultaneamente; o número de lados claros voltados para cima determina o valor do dado.  
Os valores possíveis são 0, 1, 2, 3 e 4, correspondendo ao número de casas que uma peça se deve mover.

**Tabela de valores e probabilidades**

| Soma | Valor | Nome     | Repete | Probabilidade |
|------|--------|----------|--------|----------------|
| 0    | 6      | Sitteh   | Sim    | 6%             |
| 1    | 1      | Tâb      | Sim    | 25%            |
| 2    | 2      | Itneyn   | Não    | 38%            |
| 3    | 3      | Teláteh  | Não    | 25%            |
| 4    | 4      | Arba'ah  | Sim    | 6%             |

---

### Movimentação das Peças

Antes de mover uma peça é necessário lançar o dado. A peça escolhida avança o número de casas indicado.

**Início do movimento**  
- Uma peça só pode começar a mover-se com valor 1 (Tâb).  
- Se sair 4 ou 6, o jogador repete o lançamento.  
- A casa de destino não pode conter peças do próprio jogador.

**Progressão das peças**  
- Peças movem-se da esquerda para a direita na 1ª e 3ª linhas.  
- Da direita para a esquerda na 2ª e 4ª.  
- Ao sair da 1ª linha, passam para a 2ª; da 2ª, para a 3ª; da 3ª podem ir para a 2ª ou 4ª; e da 4ª voltam à 3ª.

**Restrições**  
- Cada casa só pode conter uma peça.  
- As peças entram apenas uma vez na 4ª linha.  
- Uma peça nessa linha só pode mover-se se não houver peças suas na 1ª linha.  
- Uma peça nunca regressa à linha inicial.

**Passar a vez**  
Se o valor do dado não permitir nenhuma jogada válida e não der direito a repetir o lançamento, o jogador passa a vez.

**Capturar peças**  
Se uma peça mover-se para uma casa ocupada pelo adversário, a peça inimiga é capturada e removida do tabuleiro.

**Fim de jogo**  
O jogo termina quando um jogador não tem mais peças. Ganha o jogador que ainda as tiver.

---

### Primeira Entrega

A aplicação deve ser uma **single-page application (SPA)** em HTML, CSS e JavaScript.

**Estrutura da página**  
A página deverá ter áreas distintas, podendo algumas sobrepor-se temporariamente:
- Logotipo  
- Configuração  
- Comandos  
- Identificação  
- Dado  
- Tabuleiro  
- Instruções  
- Classificações  
- Mensagens  

---

### Requisitos de Implementação

**Aplicação web**  
- Toda a aplicação deve residir numa única página HTML.  
- O CSS e o JavaScript devem estar em ficheiros independentes.  
- Todos os ficheiros devem ser validados.

**Logotipo**  
Deve mostrar o nome do jogo “Tâb” ou uma variação, podendo ser apenas texto destacado ou imagem.

**Configuração**  
Permitir definir:
- Tamanho do tabuleiro.  
- Tipo de adversário (computador ou outro jogador).  
- Primeiro jogador.  
- Nível da IA.

Na primeira entrega: apenas jogo contra o computador.

**Comandos**  
Funções a disponibilizar:
- Visualizar instruções.  
- Iniciar jogo.  
- Passar a vez (quando permitido).  
- Desistir.  
- Ver classificações.

**Instruções**  
Painel que apresenta regras do jogo e instruções. Pode sobrepor-se a outras áreas e deve poder ser fechado.

**Identificação**  
Permitir autenticação através de identificador e senha.  
Na primeira entrega esta funcionalidade será apenas estrutural (sem autenticação real).

**Dado de paus (interação)**  
Área que mostra o dado e o valor sorteado.  
O lançamento pode ser feito com um clique.  
Após cada jogada, deve regressar ao estado inicial.

**Tabuleiro**  
Área principal da interface.  
- Inicialmente, pode ser construído em HTML e CSS.  
- Numa fase posterior, deve ser gerado dinamicamente via JavaScript (DOM).  
- Deve ter estrutura de dados correspondente.

**Modos do tabuleiro**  
A ação de clicar numa casa depende do momento do jogo.  
Deve haver controlo do modo atual através de variáveis de estado, mensagens ou cursores.

**Classificações**  
Tabela com resultados dos jogos contra a IA.  
Em fases posteriores, os rankings serão obtidos do servidor.

**Mensagens**  
Área para mensagens de estado do jogo como:
- “É a vez do jogador...”  
- “Jogada inválida”  
- “Peça capturada”  
- “Jogo terminado”  
- “Jogador desistiu”

---

### Inteligência Artificial (IA)

Para a primeira entrega, os jogadores enfrentam o computador.  
O comportamento da IA pode variar entre:  
- Escolher jogadas válidas aleatoriamente.  
- Dar prioridade a jogadas que permitem capturas.  
Pode ser combinada aleatoriedade e preferência estratégica para ajustar o nível de dificuldade.

---

### Envio para Avaliação

**Submissão**  
- O trabalho é submetido online como um ficheiro ZIP.  
- Apenas a última submissão conta para avaliação.  
- O ficheiro ZIP deve conter:  
  - `index.html`  
  - Um ou mais ficheiros `.css`  
  - Um ou mais ficheiros `.js`  
- Comando sugerido:
  ```
  cd $PASTA_TRABALHO
  zip trabalho.zip index.html *.{css,js}
  ```

**Autenticação e verificação**  
- Autenticação através do LDAP do LabCC.  
- Se o ficheiro ZIP estiver correto, o sistema mostrará “Accepted”.  
- Em caso de erro (“Compile Time Error”), será possível ver a causa.