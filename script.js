const Player = (symbol, id) => {
  let name = "";
  let isAI = false;

  const setSymbol = (newSymbol) => {
    symbol = newSymbol;
  };

  return { name, symbol, id, isAI, setSymbol };
};

const AIPlayer = (symbol, id) => {
  let name = "AI";
  let isAI = true;

  const setSymbol = (newSymbol) => {
    symbol = newSymbol;
  };

  const minimax = (board, depth, isMax, AISymbol, playerSymbol) => {
    let result = gameBoard.checkForWin(board);
    if (result) {
      if (result.winner === "AI") {
        return 100 - depth;
      } else if (result.winner === "draw") {
        return 0;
      } else {
        return -100 + depth;
      }
    }

    if (isMax) {
      let best = -1000;
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = playerSymbol;
          let score = minimax(board, depth + 1, !isMax);
          board[i] = "";
          best = Math.max(best, score);
        }
      }
      return best;
    } else {
      let best = 1000;
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = AISymbol;
          let score = minimax(board, depth + 1, !isMax);
          board[i] = "";
          best = Math.min(best, score);
        }
      }
      return best;
    }
  };

  const getMiniMaxMove = (board, AISymbol, playerSymbol) => {
    let bestScore = -1000;
    let bestMove = -1;
    // Race condition 1: If player goes to a corner first, AI should choose centre
    if (
      board.join("").length === 1 &&
      [0, 2, 6, 8].includes(board.indexOf(playerSymbol))
    ) {
      bestMove = 4;
      return bestMove;
    }

    // Race condition 2: Check if X has taken 2 corners and if so, prevent a win
    let allowedMoves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let playerCornerCounter = 0;

    [0, 2, 6, 8].forEach((i) => {
      if (board[i] === playerSymbol) {
        playerCornerCounter++;
      }
    });

    if (playerCornerCounter > 1) {
      allowedMoves = [1, 3, 4, 5, 7];
    }

    // Find best move using minimax algorithm (limited by RC2 above if needed)
    allowedMoves.forEach((i) => {
      if (board[i] === "") {
        board[i] = AISymbol;
        let score = minimax(board, 0, true);
        board[i] = "";
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    });

    // Race condition 3: Check whether X has a win on the next turn and should be blocked
    // (This overrides a previous best move calculated by minimax)
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = playerSymbol;
        let result = gameBoard.checkForWin(board);
        if (result) {
          if (result.winner != "AI" && result.winner != "draw") {
            bestMove = i;
          }
        }
        board[i] = "";
      }
    }

    // Race condition 4: Prefer AI win over draw or blocking player
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = AISymbol;
        let result = gameBoard.checkForWin(board);
        if (result) {
          if (result.winner === "AI") {
            bestMove = i;
          }
        }
        board[i] = "";
      }
    }

    return bestMove;
  };

  const move = () => {
    if (gameBoard.isPlaying()) {
      const nextMove = getMiniMaxMove(
        [...gameBoard.board],
        symbol,
        gameBoard.players[0].symbol
      );
      const gridItem = document.getElementById(nextMove);
      gameBoard.board[nextMove] = symbol;
      gridItem.innerHTML = "<p>" + symbol + "</p>";
    }
  };
  return { name, symbol, id, isAI, move, minimax, setSymbol };
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

  const setNotPlaying = () => {
    playing = false;
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
        }
      });
    });

    // check for draw - if win check is passed, check if grid is full
    if (gameBoard.board.indexOf("") === -1 && !winner) {
      winner = "draw";
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
    setNotPlaying,
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
          console.log(gameBoard.players[gameBoard.currentPlayerIndex]);
          event.target.innerHTML =
            "<p>" +
            gameBoard.players[gameBoard.currentPlayerIndex].symbol +
            "</p>";
          gameBoard.board[event.target.id] = event.target.textContent;
          let result = gameBoard.checkForWin(gameBoard.board);
          if (result) {
            drawResult(result);
            gameBoard.setNotPlaying();
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
              gameBoard.setNotPlaying();
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
    console.log(gameBoard.players);
  };

  const resetButton = document.getElementById("resetButton");
  resetButton.addEventListener("click", reset);

  return { render };
})();

displayController.render();

const aiSwitch = document.getElementById("aiSwitch");
const playerXButton = document.getElementById("playerX");
const playerOButton = document.getElementById("playerO");

aiSwitch.addEventListener("click", (e) => {
  if (e.target.textContent === "1 player") {
    e.target.textContent = "2 player";
    document.getElementById("player2Div").style.display = "block";
    gameBoard.players[0].symbol = "X";
    gameBoard.players[0].setSymbol("X");
    gameBoard.players[1] = Player("O", 1);
    playerXButton.style.display = "none";
    playerOButton.style.display = "none";
  } else {
    e.target.textContent = "1 player";
    document.getElementById("player2Div").value = "";
    document.getElementById("player2Div").style.display = "none";
    gameBoard.players[0].symbol = "X";
    gameBoard.players[0].setSymbol("X");
    gameBoard.players[1] = AIPlayer("O", 1);
    playerXButton.style.display = "block";
    playerOButton.style.display = "block";
    playerXButton.classList.add("activated");
    playerOButton.classList.remove("activated");
  }
});

playerXButton.addEventListener("click", (e) => {
  if (gameBoard.board.join("") === "" || !gameBoard.isPlaying()) {
    gameBoard.players[0].symbol = "X";
    gameBoard.players[0].setSymbol("X");
    gameBoard.players[1].symbol = "O";
    gameBoard.players[1].setSymbol("O");
    e.target.classList.add("activated");
    playerOButton.classList.remove("activated");
  }
});

playerOButton.addEventListener("click", (e) => {
  if (gameBoard.board.join("") === "" || !gameBoard.isPlaying()) {
    gameBoard.players[0].symbol = "O";
    gameBoard.players[0].setSymbol("O");
    gameBoard.players[1].symbol = "X";
    gameBoard.players[1].setSymbol("X");
    e.target.classList.add("activated");
    playerXButton.classList.remove("activated");
  }
});

playerXButton.addEventListener("mouseover", (e) => {
  if (gameBoard.board.join("") != "" && gameBoard.isPlaying()) {
    e.target.classList.add("disabled");
  }
});

playerXButton.addEventListener("mouseout", (e) => {
  if (gameBoard.board.join("") != "" && gameBoard.isPlaying()) {
    e.target.classList.remove("disabled");
  }
});

playerOButton.addEventListener("mouseover", (e) => {
  if (gameBoard.board.join("") != "" && gameBoard.isPlaying()) {
    e.target.classList.add("disabled");
  }
});

playerOButton.addEventListener("mouseout", (e) => {
  if (gameBoard.board.join("") != "" && gameBoard.isPlaying()) {
    e.target.classList.remove("disabled");
  }
});
