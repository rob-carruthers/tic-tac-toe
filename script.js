const Player = (symbol, id) => {
  let name = "";
  let isAI = false;
  return { name, symbol, id, isAI };
};

const AIPlayer = (symbol, id) => {
  const prototype = Player(symbol, id);

  prototype.isAI = true;
  prototype.name = "AI";

  const getMiniMaxMove = () => {
    let board = [...gameBoard.board];
    let scores = {};

    for (let i = 0; i < 9; i++) {
      scores[i] = 0;
    }

    if (board.indexOf("") != -1) {
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = "O";

          const result = gameBoard.checkForWin(board);

          if (result) {
            if (result.winner === "AI") {
              scores[i] += 10;
            } else {
              scores[i] -= 10;
            }
          }

          board[i] = "";
        }
      }
    }
    console.log(scores);
  };

  const move = () => {
    if (gameBoard.isPlaying()) {
      let possibleMoves = [];
      for (let i = 0; i < 9; i++) {
        if (gameBoard.board[i] === "") {
          possibleMoves.push(i);
        }
      }
      const randomSquare =
        possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const gridItem = document.getElementById(randomSquare);
      gameBoard.board[randomSquare] = prototype.symbol;
      gridItem.innerHTML = "<p>" + prototype.symbol + "</p>";
    }
  };
  return Object.assign({}, prototype, { move, getMiniMaxMove });
};

const gameBoard = (() => {
  // let board = new Array(9).fill("");
  let board = ["X", "X", "", "O", "O", "", "X", "O", ""];
  const players = [Player("X", 0), AIPlayer("O", 1)];
  let currentPlayerIndex = 0;
  let playing = true;

  const isPlaying = () => playing;

  const setPlaying = () => {
    playing = true;
  };

  const resetBoard = () => {
    board.fill("");
  };

  const checkForWin = (board) => {
    let winner = null;
    let winSquares = [];

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
      players.forEach((player) => {
        if (
          board[combo[0]] + board[combo[1]] + board[combo[2]] ===
          player.symbol.repeat(3)
        ) {
          const inputName = document.getElementById(
            "player" + (player.id + 1)
          ).value;

          if (inputName === "") {
            if (player.name === "") {
              player.name = "Player " + (player.id + 1);
            }
          } else {
            player.name = inputName;
          }

          winner = player.name;
          combo.forEach((square) => winSquares.push(square));
          playing = false;
        }
      });
    });

    // check for draw - if win check is passed, check if grid is full
    if (gameBoard.board.indexOf("") === -1 && playing) {
      winner = "draw";
      playing = false;
    }
    if (winner) return { winner, winSquares };
  };

  return {
    board,
    playing,
    isPlaying,
    players,
    currentPlayerIndex,
    checkForWin,
    setPlaying,
    resetBoard,
  };
})();

const displayController = (() => {
  const render = () => {
    const boardDiv = document.getElementById("gameBoard");
    let counter = 0;

    gameBoard.board.forEach((square) => {
      const gridItem = document.createElement("div");

      gridItem.textContent = square;
      gridItem.classList.add("boardSquare");
      gridItem.id = counter;

      gridItem.addEventListener("click", (event) => {
        if (event.target.textContent === "" && gameBoard.isPlaying()) {
          event.target.innerHTML =
            "<p>" +
            gameBoard.players[gameBoard.currentPlayerIndex].symbol +
            "</p>";
          gameBoard.board[event.target.id] = event.target.textContent;
          let result = gameBoard.checkForWin(gameBoard.board);
          if (result) {
            drawResult(result);
          }
          gameBoard.currentPlayerIndex = 1 - gameBoard.currentPlayerIndex;

          if (
            gameBoard.players[gameBoard.currentPlayerIndex].isAI &&
            gameBoard.isPlaying()
          ) {
            gameBoard.players[gameBoard.currentPlayerIndex].move();
            gameBoard.currentPlayerIndex = 1 - gameBoard.currentPlayerIndex;
            result = gameBoard.checkForWin(gameBoard.board);
            if (result) {
              drawResult(result);
            }
          }
        }
      });

      boardDiv.appendChild(gridItem);
      counter++;
    });
  };

  const drawResult = (result) => {
    const resultDiv = document.getElementById("resultDiv");
    if (result.winner === "draw") {
      resultDiv.textContent = "It's a draw!";
      resultDiv.style.display = "flex";
    } else {
      result.winSquares.forEach((n) => {
        const square = document.getElementById(n);
        square.style.backgroundColor = "rgb(140, 250, 156)";
      });

      resultDiv.textContent = result.winner + " wins!";
      resultDiv.style.display = "flex";
    }
  };

  const reset = () => {
    gameBoard.resetBoard();
    for (let square of document.getElementsByClassName("boardSquare")) {
      square.innerHTML = "";
      square.style.backgroundColor = "white";
    }
    gameBoard.setPlaying();
    gameBoard.currentPlayerIndex = 0;
    const resultDiv = document.getElementById("resultDiv");
    resultDiv.style.display = "none";
  };

  const resetButton = document.getElementById("resetButton");
  resetButton.addEventListener("click", reset);

  return { render };
})();

displayController.render();
gameBoard.players[1].getMiniMaxMove();

const aiSwitch = document.getElementById("aiSwitch");
aiSwitch.addEventListener("click", (e) => {
  if (e.target.textContent === "1 player") {
    e.target.textContent = "2 player";
    document.getElementById("player2Div").style.display = "block";
  } else {
    e.target.textContent = "1 player";
    document.getElementById("player2Div").value = "";
    document.getElementById("player2Div").style.display = "none";
  }
});
