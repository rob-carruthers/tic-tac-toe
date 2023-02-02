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
  const currentPlayer = players[currentPlayerIndex];
  const opponent = players[1 - currentPlayerIndex];
  if (event.target.textContent === "" && isPlaying) {
    event.target.innerHTML = currentPlayer.repr;
  }
  board[event.target.id] = currentPlayer.symbol;
  let result = checkForWin(board, currentPlayer);
  if (result) {
    drawResult(currentPlayer, result);
  }

  //currentPlayerIndex = 1 - currentPlayerIndex;
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
}

function initialRender() {
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

let board = new Array(9).fill("");
// let players = [Player("X", 0), AIPlayer("O", 1)];
board = ["X", "X", "O", "X", "", "", "O", "", ""];
let players = [];
players.push(new Player("X", 0));
players[0].name = "Rob";
let currentPlayerIndex = 0;
let isPlaying = true;
let difficulty = 0;

initialRender();
