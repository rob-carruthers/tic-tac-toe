const resultDiv = document.getElementById("resultDiv");
const aiSwitch = document.getElementById("aiSwitch");
const playerXButton = document.getElementById("playerX");
const playerOButton = document.getElementById("playerO");
const resetButton = document.getElementById("resetButton");
const difficultyButtons = document.getElementById("difficulty");
const beginnerButton = document.getElementById("beginner");
const intermediateButton = document.getElementById("intermediate");
const masterButton = document.getElementById("master");

let masterBoard = new Array(9).fill("");
let players = [];
let currentPlayerIndex = 0;
let isPlaying = true;
let difficulty = 0;

class Player {
  constructor(symbol, id) {
    this.symbol = symbol;
    this.id = id;
    this.name = "";
    this.isAI = false;
    this.repr = "<img src='./images/cat.png'>";
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = value;
  }

  get symbol() {
    return this._symbol;
  }

  set symbol(value) {
    this._symbol = value;
  }

  get repr() {
    return this._repr;
  }

  set repr(value) {
    this._repr = value;
  }
}

class AIPlayer extends Player {
  constructor(symbol, id, opponent) {
    super(symbol, id);
    this.isAI = true;
    this.repr = "<img src='./images/dog.png'>";
    this.name = "AI";
    this.opponent = opponent;
  }

  getRandomMove(board) {
    let possibleMoves = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        possibleMoves.push(i);
      }
    }

    const randomMove = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[randomMove];
  }

  minimax(board, depth, isMax, AISymbol, playerSymbol) {
    if (checkForWin(board, this)) {
      return 100 - depth;
    }

    if (checkForWin(board, this.opponent)) {
      return -100 + depth;
    }

    if (board.indexOf("") === -1) {
      return 0;
    }

    if (isMax) {
      let best = -1000;
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = AISymbol;
          let score = this.minimax(
            board,
            depth + 1,
            !isMax,
            AISymbol,
            playerSymbol
          );
          board[i] = "";
          best = Math.max(best, score);
        }
      }
      return best;
    } else {
      let best = 1000;
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = playerSymbol;
          let score = this.minimax(
            board,
            depth + 1,
            !isMax,
            AISymbol,
            playerSymbol
          );
          board[i] = "";
          best = Math.min(best, score);
        }
      }
      return best;
    }
  }

  getMiniMaxMove = (board, AISymbol, playerSymbol) => {
    let bestScore = -1000;
    let bestMove = -1;
    // Race condition 1: If available, AI should choose centre
    if (board.join("").length === 1 && board[4] != playerSymbol) {
      bestMove = 4;
      return bestMove;
    }

    // Find best move using minimax algorithm (limited by RC2 above if needed)
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = AISymbol;
        let score = this.minimax(board, 0, false, AISymbol, playerSymbol);
        board[i] = "";
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    // Race condition 2: Check whether X has a win on the next turn and should be blocked
    // (This overrides a previous best move calculated by minimax)

    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = playerSymbol;
        if (checkForWin(board, this.opponent)) {
          bestMove = i;
        }
        board[i] = "";
      }
    }

    // Race condition 3: Prefer AI win over draw or blocking player
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = AISymbol;

        if (checkForWin(board, this)) {
          bestMove = i;
        }

        board[i] = "";
      }
    }

    return bestMove;
  };

  move(board) {
    let nextMove = -1;
    if (isPlaying) {
      switch (difficulty) {
        case 0:
          nextMove = this.getRandomMove(board);
          break;
        case 1:
          let intermediatePossibleMoves = [];
          intermediatePossibleMoves.push(this.getRandomMove(board));
          intermediatePossibleMoves.push(
            this.getMiniMaxMove([...board], this.symbol, this.opponent.symbol)
          );

          nextMove =
            intermediatePossibleMoves[
              Math.floor(Math.random() * intermediatePossibleMoves.length)
            ];
          break;
        case 2: {
          nextMove = this.getMiniMaxMove(
            [...board],
            this.symbol,
            this.opponent.symbol
          );
        }
      }
    }

    if (nextMove > -1) {
      const gridItem = document.getElementById(nextMove);
      board[nextMove] = this.symbol;
      gridItem.innerHTML = this.repr;
    }
  }
}

function checkForWin(board, player) {
  let winStatus = false;

  const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6],
  ];

  winCombos.forEach((combo) => {
    if (
      board[combo[0]] + board[combo[1]] + board[combo[2]] ===
      player.symbol.repeat(3)
    ) {
      winStatus = [];
      combo.forEach((square) => winStatus.push(square));
    }
  });

  return winStatus;
}

function playerMove(event) {
  let currentPlayer = players[currentPlayerIndex];
  if (event.target.textContent === "" && isPlaying) {
    event.target.innerHTML = currentPlayer.repr;
    masterBoard[event.target.id] = currentPlayer.symbol;
    let result = checkForWin(masterBoard, currentPlayer);
    if (result) {
      drawResult(currentPlayer, result);
    }

    // swap players around
    currentPlayerIndex = 1 - currentPlayerIndex;
    currentPlayer = players[currentPlayerIndex];

    if (currentPlayer.isAI && isPlaying) {
      currentPlayer.move(masterBoard);
      result = checkForWin(masterBoard, currentPlayer);
      if (result) {
        drawResult(currentPlayer, result);
      }

      currentPlayerIndex = 1 - currentPlayerIndex;
    }
  }
}

function drawResult(player, result) {
  if (result === "draw") {
    resultDiv.textContent = "It's a draw!";
    resultDiv.style.display = "flex";
  } else {
    result.forEach((n) => {
      const square = document.getElementById(n);
      square.style.backgroundColor = "rgb(140, 250, 156)";
    });

    resultDiv.textContent = player.name + " wins!";
    resultDiv.style.display = "flex";
  }

  isPlaying = false;
}

function reset() {
  masterBoard.fill("");

  for (let square of document.getElementsByClassName("boardSquare")) {
    square.innerHTML = "";
    square.style.backgroundColor = "white";
  }

  isPlaying = true;
  resultDiv.style.display = "none";
  currentPlayerIndex = 0;
}

function initialRender() {
  const boardDiv = document.getElementById("gameBoard");
  let counter = 0;

  masterBoard.forEach(() => {
    const gridItem = document.createElement("div");

    gridItem.classList.add("boardSquare");
    gridItem.id = counter;

    gridItem.addEventListener("click", playerMove);

    boardDiv.appendChild(gridItem);
    counter++;
  });

  players.push(new Player("X", 0));
  players.push(new AIPlayer("O", 1, players[0]));
  players[0].name = "Player";
}

aiSwitch.addEventListener("click", (e) => {
  if (e.target.textContent === "1 player") {
    e.target.textContent = "2 player";
    document.getElementById("player2Div").style.display = "block";
    players[0].symbol = "X";
    players[0].repr = "<img src='./images/cat.png'>";
    players[1] = new Player("O", 1);
    players[1].repr = "<img src='./images/dog.png'>";
    playerXButton.style.display = "none";
    playerOButton.style.display = "none";
    difficultyButtons.style.display = "none";
    reset();
  } else {
    e.target.textContent = "1 player";
    document.getElementById("player2Div").value = "";
    document.getElementById("player2Div").style.display = "none";
    players[0].symbol = "X";
    players[1] = new AIPlayer("O", 1, players[0]);
    playerXButton.style.display = "block";
    playerOButton.style.display = "block";
    playerXButton.classList.add("activated");
    playerOButton.classList.remove("activated");
    difficultyButtons.style.display = "flex";
    reset();
  }
});

resetButton.addEventListener("click", reset);

playerXButton.addEventListener("click", (e) => {
  if (masterBoard.join("") === "" || !isPlaying) {
    players[0].symbol = "X";
    players[0].repr = "<img src='./images/cat.png'>";
    players[1].symbol = "O";
    players[1].repr = "<img src='./images/dog.png'>";
    playerXButton.classList.add("activated");
    playerOButton.classList.remove("activated");
  }
});

playerOButton.addEventListener("click", (e) => {
  if (masterBoard.join("") === "" || !isPlaying) {
    players[0].symbol = "O";
    players[0].repr = "<img src='./images/dog.png'>";
    players[1].symbol = "X";
    players[1].repr = "<img src='./images/cat.png'>";
    playerOButton.classList.add("activated");
    playerXButton.classList.remove("activated");
  }
});

playerXButton.addEventListener("mouseover", (e) => {
  if (masterBoard.join("") != "" && isPlaying) {
    e.target.classList.add("disabled");
  }
});

playerXButton.addEventListener("mouseout", (e) => {
  if (masterBoard.join("") != "" && isPlaying) {
    e.target.classList.remove("disabled");
  }
});

playerOButton.addEventListener("mouseover", (e) => {
  if (masterBoard.join("") != "" && isPlaying) {
    e.target.classList.add("disabled");
  }
});

playerOButton.addEventListener("mouseout", (e) => {
  if (masterBoard.join("") != "" && isPlaying) {
    e.target.classList.remove("disabled");
  }
});

beginnerButton.addEventListener("click", (e) => {
  e.target.classList.add("activated");
  masterButton.classList.remove("activated");
  intermediateButton.classList.remove("activated");
  difficulty = 0;
});

intermediateButton.addEventListener("click", (e) => {
  e.target.classList.add("activated");
  beginnerButton.classList.remove("activated");
  masterButton.classList.remove("activated");
  difficulty = 1;
});

masterButton.addEventListener("click", (e) => {
  e.target.classList.add("activated");
  beginnerButton.classList.remove("activated");
  intermediateButton.classList.remove("activated");
  difficulty = 2;
});

initialRender(masterBoard);
