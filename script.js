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
  constructor(symbol, id) {
    super(symbol, id);
    this.isAI = true;
    this.repr = "<img src='./images/dog.png'>";
    this.name = "AI";
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

  move(board) {
    let nextMove = -1;
    if (isPlaying) {
      switch (difficulty) {
        case 0:
          nextMove = this.getRandomMove(board);
          break;
      }
    }

    if (nextMove > -1) {
      const gridItem = document.getElementById(nextMove);
      board[nextMove] = this.symbol;
      gridItem.innerHTML = this.repr;
    }
  }
}

function resetBoard() {
  board.fill("");
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
  let opponent = players[1 - currentPlayerIndex];
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
    opponent = players[1 - currentPlayerIndex];

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
  const resultDiv = document.getElementById("resultDiv");
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

function initialRender(board) {
  const boardDiv = document.getElementById("gameBoard");
  let counter = 0;

  board.forEach((square) => {
    const gridItem = document.createElement("div");

    gridItem.classList.add("boardSquare");
    gridItem.id = counter;

    gridItem.addEventListener("click", playerMove);

    boardDiv.appendChild(gridItem);
    counter++;
  });
}

let masterBoard = new Array(9).fill("");
// let players = [Player("X", 0), AIPlayer("O", 1)];
//board = ["X", "X", "O", "X", "", "", "O", "", ""];
let players = [];
players.push(new Player("X", 0));
players.push(new AIPlayer("O", 1));
players[0].name = "Player";
let currentPlayerIndex = 0;
let isPlaying = true;
let difficulty = 0;

initialRender(masterBoard);
