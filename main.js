// ------------------------------
//  CONFIG
// ------------------------------
const GRID_SIZE = 4;
const START_TILES = 2;

const ICONS = {
  2: "☕",
  4: "📎",
  8: "📝",
  16: "📁",
  32: "📂",
  64: "🖨️",
  128: "🖥️",
  256: "💼",
  512: "🏢",
  1024: "🚀",
  2048: "👑"
};

let grid = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

let level = 1;
let movesSinceLastLevel = 0;

// ------------------------------
//  LOAD GAME SCREEN
// ------------------------------
function loadGame() {
  document.getElementById("game-container").innerHTML = `
    <div id="game-wrapper" style="
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      margin-top:20px;
    ">
      <h2>Shift Merge 2048 ☕</h2>
      <p style="max-width:600px;font-size:15px;">
        Merge matching tiles to survive your shift!  
        Each level increases difficulty — fewer merges, more chaos.  
        Reach higher ranks by combining office tools.  
      </p>

      <div id="score-area" style="margin-bottom:15px;">
        <strong>Score:</strong> <span id="score">0</span>  
        &nbsp;&nbsp;|&nbsp;&nbsp;  
        <strong>Best:</strong> <span id="best">${bestScore}</span>  
        &nbsp;&nbsp;|&nbsp;&nbsp;  
        <strong>Level:</strong> <span id="level">1</span>
      </div>

      <button onclick="restartGame()" style="
        padding:10px 20px;
        background-color:#ffd966;
        border:none;
        border-radius:8px;
        font-size:16px;
        cursor:pointer;
        margin-bottom:20px;
      ">Restart</button>

      <div id="board" style="
        display:grid;
        grid-template-columns:repeat(4,80px);
        grid-template-rows:repeat(4,80px);
        gap:10px;
        justify-content:center;
      "></div>
    </div>

    <div id="game-over" style="
      position:fixed;
      top:0;left:0;right:0;bottom:0;
      background:rgba(0,0,0,0.6);
      display:none;
      align-items:center;
      justify-content:center;
    ">
      <div style="
        background:white;
        padding:25px;
        border-radius:10px;
        text-align:center;
        width:80%;
        max-width:350px;
      ">
        <h2>Shift Completed! 🎉</h2>
        <p>Your Score: <span id="finalScore"></span></p>
        <p>Best Score: <span id="finalBest"></span></p>
        <button onclick="restartGame()" style="
          padding:10px 20px;
          background-color:#ffd966;
          border:none;
          border-radius:8px;
          font-size:16px;
          cursor:pointer;
          margin-top:10px;
        ">Restart Shift</button>
        <br><br>
        <button onclick="backToMenu()" style="
          padding:8px 18px;
          background-color:#ccc;
          border:none;
          border-radius:8px;
          font-size:15px;
          cursor:pointer;
        ">Back to Menu</button>
      </div>
    </div>
  `;

  startGame();
}

// ------------------------------
//  INIT GAME
// ------------------------------
function startGame() {
  grid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0));

  score = 0;
  level = 1;
  movesSinceLastLevel = 0;

  document.getElementById("score").textContent = score;
  document.getElementById("level").textContent = level;

  for (let i = 0; i < START_TILES; i++) addRandomTile();
  drawBoard();

  // Attach key listener once
  document.addEventListener("keydown", handleKeyPress);
}

// ------------------------------
//  RESTART GAME
// ------------------------------
function restartGame() {
  document.getElementById("game-over").style.display = "none";
  startGame();
}

// ------------------------------
//  BACK TO MENU
// ------------------------------
function backToMenu() {
  location.reload();
}

// ------------------------------
//  DRAW BOARD
// ------------------------------
function drawBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const value = grid[r][c];
      const tile = document.createElement("div");

      tile.style.width = "80px";
      tile.style.height = "80px";
      tile.style.background = value ? "#ffe8b3" : "#f3e6c5";
      tile.style.display = "flex";
      tile.style.justifyContent = "center";
      tile.style.alignItems = "center";
      tile.style.fontSize = "30px";
      tile.style.borderRadius = "8px";
      tile.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

      tile.textContent = value ? ICONS[value] : "";

      board.appendChild(tile);
    }
  }
}

// ------------------------------
//  ADD RANDOM TILE
// ------------------------------
function addRandomTile() {
  let emptyTiles = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) emptyTiles.push({ r, c });
    }
  }

  if (emptyTiles.length === 0) return;

  const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];

  const spawnChance = 0.1 + level * 0.05;
  grid[r][c] = Math.random() < spawnChance ? 4 : 2;
}

// ------------------------------
//  MOVE HANDLER (ARROW KEYS)
// ------------------------------
function handleKeyPress(e) {
  if (!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) return;

  e.preventDefault(); // prevent scrolling
  e.stopPropagation();

  let moved = false;

  switch (e.key) {
    case "ArrowUp": moved = moveUp(); break;
    case "ArrowDown": moved = moveDown(); break;
    case "ArrowLeft": moved = moveLeft(); break;
    case "ArrowRight": moved = moveRight(); break;
  }

  if (moved) {
    addRandomTile();
    drawBoard();
    trackLevelProgress();

    if (checkGameOver()) showGameOver();
  }
}

// ------------------------------
//  LEVEL PROGRESSION
// ------------------------------
function trackLevelProgress() {
  movesSinceLastLevel++;
  if (movesSinceLastLevel >= 12) {
    level++;
    movesSinceLastLevel = 0;
    document.getElementById("level").textContent = level;
  }
}

// ------------------------------
//  GAME OVER CHECK
// ------------------------------
function checkGameOver() {
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      if (grid[r][c] === 0) return false;

  const directions = [
    [0, 1],
    [1, 0]
  ];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let [dr, dc] of directions) {
        const nr = r + dr, nc = c + dc;
        if (nr < GRID_SIZE && nc < GRID_SIZE && grid[r][c] === grid[nr][nc]) {
          return false;
        }
      }
    }
  }

  return true;
}

// ------------------------------
//  GAME OVER POPUP
// ------------------------------
function showGameOver() {
  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalBest").textContent = bestScore;
  document.getElementById("game-over").style.display = "flex";
}

// ------------------------------
//  MOVEMENT LOGIC
// ------------------------------
function compress(row) {
  return row.filter(v => v !== 0).concat(Array(GRID_SIZE).fill(0));
}

function merge(row, reverse = false) {
  if (reverse) row = row.reverse();

  for (let i = 0; i < GRID_SIZE - 1; i++) {
    if (row[i] !== 0 && row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
      }
      row[i + 1] = 0;
      i++; // prevent double merge
    }
  }

  if (reverse) row = row.reverse();
  return row;
}

function moveLeft() {
  let moved = false;
  for (let r = 0; r < GRID_SIZE; r++) {
    const oldRow = [...grid[r]];
    let row = compress(grid[r]);
    row = merge(row);
    row = compress(row);
    grid[r] = row;
    if (row.toString() !== oldRow.toString()) moved = true;
  }
  return moved;
}

function moveRight() {
  let moved = false;
  for (let r = 0; r < GRID_SIZE; r++) {
    const oldRow = [...grid[r]];
    let row = compress(grid[r]);
    row = merge(row, true); // merge from right
    row = compress(row);
    grid[r] = row;
    if (row.toString() !== oldRow.toString()) moved = true;
  }
  return moved;
}

function moveUp() {
  let moved = false;
  for (let c = 0; c < GRID_SIZE; c++) {
    let col = [];
    for (let r = 0; r < GRID_SIZE; r++) col.push(grid[r][c]);

    const oldCol = [...col];

    col = compress(col);
    col = merge(col);
    col = compress(col);

    for (let r = 0; r < GRID_SIZE; r++) grid[r][c] = col[r];

    if (col.toString() !== oldCol.toString()) moved = true;
  }
  return moved;
}

function moveDown() {
  let moved = false;
  for (let c = 0; c < GRID_SIZE; c++) {
    let col = [];
    for (let r = 0; r < GRID_SIZE; r++) col.push(grid[r][c]);

    const oldCol = [...col];

    col = compress(col);
    col = merge(col, true); // merge from bottom
    col = compress(col);

    for (let r = 0; r < GRID_SIZE; r++) grid[r][c] = col[r];

    if (col.toString() !== oldCol.toString()) moved = true;
  }
  return moved;
}
