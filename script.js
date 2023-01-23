const Player = (symbol, id) => {
  let name = "";
  let isAI = false;
  return { name, symbol, id, isAI };
};

const AIPlayer = (symbol, id) => {
  const prototype = Player(symbol, id);

  prototype.isAI = true;

  const move = () => {
    if (gameBoard.isPlaying()) {
      let possibleMoves = [];
      for (let i = 0; i < 9; i++) {
        if (gameBoard.board[i] === "") {
          possibleMoves.push(i)
        }
      }
      const randomSquare = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const gridItem = document.getElementById(randomSquare);
      gameBoard.board[randomSquare] = prototype.symbol;
      gridItem.innerHTML =
              "<p>" +
              prototype.symbol +
              "</p>";

    }
  }
  return Object.assign({}, prototype, {move});
};

const gameBoard = (() => {
  let board = new Array(9).fill("");
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

  const checkForWin = () => {
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
          const resultDiv = document.getElementById("resultDiv");

          combo.forEach((n) => {
            const square = document.getElementById(n);
            square.style.backgroundColor = "rgb(140, 250, 156)";
          });

          const inputName = document.getElementById(
            "player" + (player.id + 1)
          ).value;

          if (inputName === "") {
            player.name = "Player " + (player.id + 1);
          } else {
            player.name = inputName;
          }

          resultDiv.textContent = player.name + " wins!";
          resultDiv.style.display = "flex";
          playing = false;
        }
      });
    });

    // check for draw - if win check is passed, check if grid is full
    if (gameBoard.board.indexOf("") === -1 && playing) {
      resultDiv.textContent = "It's a draw!";
      resultDiv.style.display = "flex";
      playing = false;
    }
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
          gameBoard.checkForWin();
          gameBoard.currentPlayerIndex = 1 - gameBoard.currentPlayerIndex;

          if (gameBoard.players[gameBoard.currentPlayerIndex].isAI) {
            gameBoard.players[gameBoard.currentPlayerIndex].move();
            gameBoard.currentPlayerIndex = 1 - gameBoard.currentPlayerIndex;
          }
        }
      });

      boardDiv.appendChild(gridItem);
      counter++;
    });
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
