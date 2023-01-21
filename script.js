const Player = (name) => {
  return {name};
}

const gameBoard = (() => {
  const board = new Array(9).fill("");
  const players = [Player("X"), Player("O")]
  let currentPlayerIndex = 0;
  return { board, players, currentPlayerIndex };
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
        if (event.target.textContent === "") {
          event.target.textContent = 
            gameBoard.players[gameBoard.currentPlayerIndex].name;
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
