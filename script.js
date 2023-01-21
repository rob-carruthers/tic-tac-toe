const gameBoard = (() => {
  const board = ["X", "O", "X", "X", "O", "O", "X", "X", "O"];
  return { board };
})();

const displayController = (() => {
  const render = () => {
    const boardDiv = document.getElementById("gameBoard");
    let counter = 0;

    gameBoard.board.forEach((square) => {
      const gridItem = document.createElement("div");
      gridItem.textContent = square;
      gridItem.classList.add("boardSquare");
      gridItem.id = "square-" + counter.toString();
      boardDiv.appendChild(gridItem);
      counter++;
    });
  };

  return { render };
})();

displayController.render();
