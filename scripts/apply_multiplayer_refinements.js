const fs = require('fs');

let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');

// 1. Guard against rolling on opponent's turn in rollDice
const oldRollStart = 'function rollDice(gestureParams = null) {';
const newRollStart = `function rollDice(gestureParams = null) {
      if (typeof ludoNetwork !== 'undefined' && (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE)) {
        if (gameState.activeTurn !== ludoNetwork.myPlayerIndex) {
          showToast("⏳ Opponent's Turn! Please wait...");
          return;
        }
      }`;

if (html.includes(oldRollStart) && !html.includes("Opponent's Turn! Please wait...")) {
  html = html.replace(oldRollStart, newRollStart);
  console.log('Added opponent turn roll guard');
}

// 2. Update isAiTurn for multiplayer
const oldIsAiTurn = `    function isAiTurn() {
      const human = (gameState.userPlayerId !== undefined) ? gameState.userPlayerId : 0;
      return gameState.mode === GAME_MODES.VS_AI && gameState.activeTurn !== human;
    }`;

const newIsAiTurn = `    function isAiTurn() {
      if (gameState.mode === GAME_MODES.VS_AI) {
        const human = (gameState.userPlayerId !== undefined) ? gameState.userPlayerId : 0;
        return gameState.activeTurn !== human;
      }
      if (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE) {
        const p = PLAYERS[gameState.activeTurn];
        const isBotSlot = !p || !p.isOnlineHuman;
        return isBotSlot && (typeof ludoNetwork !== 'undefined' && ludoNetwork.isHost);
      }
      return false;
    }`;

if (html.includes(oldIsAiTurn)) {
  html = html.replace(oldIsAiTurn, newIsAiTurn);
  console.log('Updated isAiTurn for multiplayer host-bot delegation');
}

fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Applied multiplayer refinements to both files!');
