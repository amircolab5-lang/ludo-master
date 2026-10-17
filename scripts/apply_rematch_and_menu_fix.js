const fs = require('fs');

let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');

// 1. Update btn-rematch
const oldRematch = `    document.getElementById('btn-rematch')?.addEventListener('click', () => {
      closeAllModals();
      startMatch(gameState.mode, gameState.playerCount, gameState.stake);
    });`;

const newRematch = `    document.getElementById('btn-rematch')?.addEventListener('click', () => {
      closeAllModals();
      if (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE) {
        if (typeof ludoNetwork !== 'undefined' && ludoNetwork.currentRoom) {
          if (ludoNetwork.isHost) {
            sounds.playWin();
            ludoNetwork.publish(\`ludomaster/rooms/\${ludoNetwork.currentRoom}\`, {
              type: 'GAME_START',
              roomCode: ludoNetwork.currentRoom,
              stake: ludoNetwork.roomStake,
              playerCount: ludoNetwork.roomPlayerCount,
              players: ludoNetwork.roomPlayers
            });
            startMultiplayerMatch(gameState.mode, ludoNetwork.roomPlayerCount, ludoNetwork.roomStake, 0, ludoNetwork.roomPlayers);
          } else {
            showToast('⏳ Waiting for Host to start rematch...');
          }
          return;
        }
      }
      startMatch(gameState.mode, gameState.playerCount, gameState.stake);
    });`;

if (html.includes(oldRematch)) {
  html = html.replace(oldRematch, newRematch);
  console.log('Updated btn-rematch handler!');
} else {
  console.warn('Exact old rematch block not found, checking normalized...');
}

// 2. Update btn-back-to-menu-after-win
const oldBackWin = `    document.getElementById('btn-back-to-menu-after-win')?.addEventListener('click', () => {
      closeAllModals();
      document.getElementById('game-hud').style.display = 'none';
      document.getElementById('menu-screen').style.display = 'flex';
    });`;

const newBackWin = `    document.getElementById('btn-back-to-menu-after-win')?.addEventListener('click', () => {
      closeAllModals();
      if (typeof ludoNetwork !== 'undefined' && (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE)) {
        ludoNetwork.leaveRoom();
      }
      document.getElementById('game-hud').style.display = 'none';
      document.getElementById('menu-screen').style.display = 'flex';
      document.getElementById('top-bar').style.display = 'flex';
      user.updateHeaderUI();
    });`;

if (html.includes(oldBackWin)) {
  html = html.replace(oldBackWin, newBackWin);
  console.log('Updated btn-back-to-menu-after-win handler!');
} else {
  console.warn('Exact old backWin block not found');
}

fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Saved both files!');
