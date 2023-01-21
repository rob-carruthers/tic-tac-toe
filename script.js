const Player = (name) => {
  return { name };
};

const gameBoard = (() => {
  let board = new Array(9).fill("");
  const players = [Player("X"), Player("O")];
  let currentPlayerIndex = 0;
  let playing = true;

  const isPlaying = () => playing;

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
          player.name.repeat(3)
        ) {
          const resultDiv = document.getElementById("resultDiv");
          resultDiv.textContent = player.name + " wins!";
          playing = false;
        }
      });
    });
  };

  return {
    board,
    playing,
    isPlaying,
    players,
    currentPlayerIndex,
    checkForWin,
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
          event.target.textContent =
            gameBoard.players[gameBoard.currentPlayerIndex].name;
          gameBoard.board[event.target.id] = event.target.textContent;
          gameBoard.checkForWin();
          gameBoard.currentPlayerIndex = 1 - gameBoard.currentPlayerIndex;
        }
      });

      boardDiv.appendChild(gridItem);
      counter++;
    });
  };

  return { render };
})();

displayController.render();
