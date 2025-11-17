// Main.js for Agent Survival Kit — Shift Merge 2048 polished

// Function to load a game
function loadGame(game) {
  const container = document.getElementById('game-container');
  container.innerHTML = ''; // Clear previous content

  if (game === 'game1') {
    startShiftMerge2048(container);
  }
  // Later we can add game2 and game3
}

// Shift Merge 2048 game
function startShiftMerge2048(container) {
  container.innerHTML = ''; // Clear container

  // 4x4 grid data
  let tileGrid = [
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', '']
  ];

  // Tile progression mapping
  const tileProgression = {
    '☕': '☕☕',
    '☕☕': '💻',
    '💻': '📧',
    '📧': '🏆'
  };

  const tileScore = {
    '☕': 2,
    '☕☕': 4,
    '💻': 8,
    '📧': 16,
    '🏆': 32
  };

  let score = 0;
  let level = 1;
  let movesSinceLevelUp = 0;

  // Score + Notification container
  const topContainer = document.createElement('div');
  topContainer.style.display = 'flex';
  topContainer.style.alignItems = 'center';
  topContainer.style.justifyContent = 'center';
  topContainer.style.gap = '20px';
  topContainer.style.marginTop = '20px';
  container.appendChild(topContainer);

  // Score div
  const scoreDiv = document.createElement('div');
  scoreDiv.style.fontSize = '24px';
  scoreDiv.style.fontWeight = 'bold';
  scoreDiv.textContent = `Score: ${score} | Level: ${level}`;
  topContainer.appendChild(scoreDiv);

  // Notification div
  const notification = document.createElement('div');
  notification.style.padding = '10px 20px';
  notification.style.backgroundColor = '#ff5722';
  notification.style.color = '#fff';
  notification.style.borderRadius = '10px';
  notification.style.fontSize = '20px';
  notification.style.fontWeight = 'bold';
  notification.style.textAlign = 'center';
  notification.style.display = 'none';
  topContainer.appendChild(notification);

  function showNotification(message) {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 1500);
  }

  // Tiles grid
  const grid = document.createElement('div');
  grid.id = 'grid';
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(4, 80px)';
  grid.style.gridTemplateRows = 'repeat(4, 80px)';
  grid.style.gap = '5px';
  grid.style.justifyContent = 'center';
  grid.style.margin = '20px auto';

  const tiles = [];
  for (let i = 0; i < 16; i++) {
    const tile = document.createElement('div');
    tile.style.width = '80px';
    tile.style.height = '80px';
    tile.style.backgroundColor = '#eee';
    tile.style.display = 'flex';
    tile.style.alignItems = 'center';
    tile.style.justifyContent = 'center';
    tile.style.fontSize = '30px';
    tile.style.borderRadius = '8px';
    tile.textContent = '';
    grid.appendChild(tile);
    tiles.push(tile);
  }

  container.appendChild(grid);

  // Starting tiles
  tileGrid[0][0] = '☕';
  tileGrid[0][1] = '🗂️';

  function renderGrid() {
    tiles.forEach((tile, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const value = tileGrid[row][col];
      tile.textContent = value;

      // Tile colors
      switch(value) {
        case '☕': tile.style.backgroundColor = '#ffee99'; break;
        case '☕☕': tile.style.backgroundColor = '#ffd966'; break;
        case '💻': tile.style.backgroundColor = '#a9d18e'; break;
        case '📧': tile.style.backgroundColor = '#6fa8dc'; break;
        case '🏆': tile.style.backgroundColor = '#f4b183'; break;
        default: tile.style.backgroundColor = '#eee';
      }
    });

    scoreDiv.textContent = `Score: ${score} | Level: ${level}`;
  }

  renderGrid();

  function mergeLine(line) {
    let newLine = line.filter(tile => tile !== '');
    for (let i = 0; i < newLine.length - 1; i++) {
      if (newLine[i] === newLine[i + 1]) {
        if (tileProgression[newLine[i]]) {
          newLine[i] = tileProgression[newLine[i]];
          score += tileScore[newLine[i]] || 0;
        }
        newLine[i + 1] = '';

        if (newLine[i] === '💻') showNotification("Laptop upgrade! 📈");
        if (newLine[i] === '📧') showNotification("Inbox mastered! 📬");
        if (newLine[i] === '🏆') showNotification("Perfect Shift! 🏆");
      }
    }
    newLine = newLine.filter(tile => tile !== '');
    while (newLine.length < 4) newLine.push('');
    return newLine;
  }

  function copyGrid(grid) {
    return grid.map(row => [...row]);
  }

  function gridsAreEqual(a, b) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (a[r][c] !== b[r][c]) return false;
      }
    }
    return true;
  }

  function moveTiles(direction) {
    const oldGrid = copyGrid(tileGrid);

    switch(direction) {
      case 'left':
        for (let r = 0; r < 4; r++) tileGrid[r] = mergeLine(tileGrid[r]);
        break;
      case 'right':
        for (let r = 0; r < 4; r++) tileGrid[r] = mergeLine(tileGrid[r].reverse()).reverse();
        break;
      case 'up':
        for (let c = 0; c < 4; c++) {
          let col = [tileGrid[0][c], tileGrid[1][c], tileGrid[2][c], tileGrid[3][c]];
          col = mergeLine(col);
          for (let r = 0; r < 4; r++) tileGrid[r][c] = col[r];
        }
        break;
      case 'down':
        for (let c = 0; c < 4; c++) {
          let col = [tileGrid[0][c], tileGrid[1][c], tileGrid[2][c], tileGrid[3][c]];
          col = mergeLine(col.reverse()).reverse();
          for (let r = 0; r < 4; r++) tileGrid[r][c] = col[r];
        }
        break;
    }

    // Only count moves if grid actually changed
    if (!gridsAreEqual(oldGrid, tileGrid)) {
      movesSinceLevelUp++;
      if (movesSinceLevelUp >= 10) {
        level++;
        movesSinceLevelUp = 0;
        showNotification(`Level Up! You are now Level ${level} 🎉`);
      }
    }

    // Add new tile
    const emptyTiles = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (tileGrid[r][c] === '') emptyTiles.push([r, c]);
      }
    }
    if (emptyTiles.length > 0) {
      const [r, c] = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
      const tileChance = Math.random();
      if (level >= 3 && tileChance > 0.5) tileGrid[r][c] = '☕☕';
      else tileGrid[r][c] = Math.random() > 0.5 ? '☕' : '🗂️';
    }

    renderGrid();
  }

  // Arrow keys listener
  document.addEventListener('keydown', (event) => {
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) {
      event.preventDefault();
      switch(event.key) {
        case 'ArrowUp': moveTiles('up'); break;
        case 'ArrowDown': moveTiles('down'); break;
        case 'ArrowLeft': moveTiles('left'); break;
        case 'ArrowRight': moveTiles('right'); break;
      }
    }
  });
}
