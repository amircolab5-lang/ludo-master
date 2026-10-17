const fs = require('fs');

let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');

const idx1 = html.indexOf("document.getElementById('btn-lobby-start-game')?.addEventListener('click'");
const idx2 = html.indexOf("// Match Config Selectors");

if (idx1 !== -1 && idx2 !== -1) {
  const newLobbyBlock = `document.getElementById('btn-lobby-start-game')?.addEventListener('click', () => {
      if (!ludoNetwork.isHost || !ludoNetwork.currentRoom) return;
      sounds.playWin();

      // Properly fill any vacant slots with smart bots
      if (ludoNetwork.roomPlayerCount === 2) {
        if (!ludoNetwork.roomPlayers.find(p => p.index === 2)) {
          ludoNetwork.roomPlayers.push({
            index: 2,
            name: 'Hamza (BOT)',
            avatarIndex: 2,
            flag: '🇦🇪 UAE',
            isHost: false,
            isReady: true,
            isOnlineHuman: false,
            clientId: 'bot_2'
          });
        }
      } else {
        const availableSlots = [1, 2, 3];
        const botNames = { 1: 'Ayesha (BOT)', 2: 'Hamza (BOT)', 3: 'David (BOT)' };
        const botFlags = { 1: '🇮🇳 India', 2: '🇦🇪 UAE', 3: '🇬🇧 UK' };
        availableSlots.forEach(s => {
          if (!ludoNetwork.roomPlayers.find(p => p.index === s)) {
            ludoNetwork.roomPlayers.push({
              index: s,
              name: botNames[s] || ('Bot ' + s),
              avatarIndex: s,
              flag: botFlags[s] || '🤖',
              isHost: false,
              isReady: true,
              isOnlineHuman: false,
              clientId: 'bot_' + s
            });
          }
        });
      }

      // Broadcast game start to all joined devices
      ludoNetwork.publish(\`ludomaster/rooms/\${ludoNetwork.currentRoom}\`, {
        type: 'GAME_START',
        roomCode: ludoNetwork.currentRoom,
        stake: ludoNetwork.roomStake,
        playerCount: ludoNetwork.roomPlayerCount,
        players: ludoNetwork.roomPlayers
      });

      // Launch on Host device
      document.getElementById('modal-room-lobby')?.classList.remove('active');
      closeAllModals();
      startMultiplayerMatch(GAME_MODES.PRIVATE, ludoNetwork.roomPlayerCount, ludoNetwork.roomStake, 0, ludoNetwork.roomPlayers);
    });

    document.getElementById('btn-lobby-leave')?.addEventListener('click', () => {
      ludoNetwork.leaveRoom();
    });
    document.getElementById('btn-lobby-close')?.addEventListener('click', () => {
      ludoNetwork.leaveRoom();
    });

    // Online World Cancel
    document.getElementById('btn-cancel-matchmaking')?.addEventListener('click', () => {
      ludoNetwork.cancelMatchmaking();
    });`;

  html = html.substring(0, idx1) + newLobbyBlock + "\n\n    " + html.substring(idx2);
  console.log('Replaced lobby start block and removed duplicate join listener!');
} else {
  console.error('Could not find range markers:', idx1, idx2);
}

// 2. Add leaveRoom to btn-leave-game if not already added
if (!html.includes("ludoNetwork.leaveRoom()")) {
  html = html.replace(
    "if (confirm('Leave match and return to Main Menu?')) {",
    "if (confirm('Leave match and return to Main Menu?')) {\n        if (typeof ludoNetwork !== 'undefined' && (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE)) {\n          ludoNetwork.leaveRoom();\n        }"
  );
}

fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Files updated and saved successfully!');
