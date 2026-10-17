const fs = require('fs');

let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');

// 1. Hook sendDiceRoll in rollDice
const oldRollSend = "gameState.diceValue = rolled;";
const newRollSend = `gameState.diceValue = rolled;
      if (typeof ludoNetwork !== 'undefined' && (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE)) {
        if (gameState.activeTurn === ludoNetwork.myPlayerIndex) {
          ludoNetwork.sendDiceRoll(rolled);
        }
      }`;

if (html.includes(oldRollSend) && !html.includes('ludoNetwork.sendDiceRoll')) {
  html = html.replace(oldRollSend, newRollSend);
  console.log('Hooked sendDiceRoll in rollDice');
}

// 2. Hook sendPawnMove in movePawn
const oldMovePawn = "function movePawn(pawn, steps) {";
const newMovePawn = `function movePawn(pawn, steps, isRemote = false) {
      if (!isRemote && typeof ludoNetwork !== 'undefined' && (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE)) {
        if (pawn && pawn.userData && pawn.userData.playerId === ludoNetwork.myPlayerIndex) {
          ludoNetwork.sendPawnMove(pawn.userData.pawnIndex, steps);
        }
      }`;

if (html.includes(oldMovePawn) && !html.includes('isRemote = false')) {
  html = html.replace(oldMovePawn, newMovePawn);
  console.log('Hooked sendPawnMove in movePawn');
}

// 3. Hook sendChat in sendLudoChatMessage
const oldSendChat = "handleBotChatReaction(cleanText, isEmoji);";
const newSendChat = `handleBotChatReaction(cleanText, isEmoji);
      if (typeof ludoNetwork !== 'undefined' && (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE)) {
        ludoNetwork.sendChat(cleanText, isEmoji);
      }`;

if (html.includes(oldSendChat) && !html.includes('ludoNetwork.sendChat')) {
  html = html.replace(oldSendChat, newSendChat);
  console.log('Hooked sendChat in sendLudoChatMessage');
}

// 4. Hook isHuman checking in updateTurnUI and rollDice for remote player
// In multiplayer, it is human only if it is YOUR player ID
const oldIsHumanTurn = "const isHuman = (gameState.mode === GAME_MODES.LOCAL) || (gameState.activeTurn === humanId);";
const newIsHumanTurn = `const isNetworkGame = (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE);
      const isHuman = isNetworkGame ? (gameState.activeTurn === (ludoNetwork?.myPlayerIndex ?? 0)) : ((gameState.mode === GAME_MODES.LOCAL) || (gameState.activeTurn === humanId));`;

if (html.includes(oldIsHumanTurn)) {
  html = html.replace(oldIsHumanTurn, newIsHumanTurn);
  console.log('Updated isHuman logic in updateTurnUI for multiplayer');
}

// 5. Replace old private table click handlers with full lobby & tabs logic
const oldPrivateHandlers = `    document.getElementById('btn-create-private-room')?.addEventListener('click', () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      gameState.roomId = code;
      closeAllModals();
      showToast(\`Private Table Created! Code: \${code}\`);
      startMatch(GAME_MODES.PRIVATE, 4, 1000);
    });
    document.getElementById('btn-join-private-room')?.addEventListener('click', () => {
      const code = document.getElementById('input-room-code')?.value;
      if (!code || code.length !== 6) {
        showToast('Please enter a 6-digit room code');
        return;
      }
      gameState.roomId = code;
      closeAllModals();
      showToast(\`Joined Table: \${code}\`);
      startMatch(GAME_MODES.PRIVATE, 4, 1000);
    });`;

const newPrivateHandlers = `    // Real-Time Private Table & Multiplayer Handlers
    let privStake = 1000;
    let privPlayerCount = 4;

    // Tabs toggle
    document.getElementById('tab-btn-create-room')?.addEventListener('click', () => {
      document.getElementById('tab-btn-create-room').classList.add('active');
      document.getElementById('tab-btn-join-room').classList.remove('active');
      document.getElementById('panel-create-room').style.display = 'block';
      document.getElementById('panel-join-room').style.display = 'none';
      sounds.playClick();
    });

    document.getElementById('tab-btn-join-room')?.addEventListener('click', () => {
      document.getElementById('tab-btn-join-room').classList.add('active');
      document.getElementById('tab-btn-create-room').classList.remove('active');
      document.getElementById('panel-join-room').style.display = 'block';
      document.getElementById('panel-create-room').style.display = 'none';
      sounds.playClick();
    });

    // Player Count
    document.getElementById('priv-cfg-p2')?.addEventListener('click', () => {
      privPlayerCount = 2;
      document.getElementById('priv-cfg-p2').style.background = 'var(--primary-color)';
      document.getElementById('priv-cfg-p4').style.background = '#1e293b';
      sounds.playClick();
    });
    document.getElementById('priv-cfg-p4')?.addEventListener('click', () => {
      privPlayerCount = 4;
      document.getElementById('priv-cfg-p4').style.background = 'var(--primary-color)';
      document.getElementById('priv-cfg-p2').style.background = '#1e293b';
      sounds.playClick();
    });

    // Stakes
    document.querySelectorAll('.priv-stake-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        privStake = parseInt(btn.getAttribute('data-stake'), 10) || 1000;
        document.querySelectorAll('.priv-stake-btn').forEach(b => {
          b.style.background = (b === btn) ? 'var(--primary-color)' : '#1e293b';
        });
        sounds.playClick();
      });
    });

    // Create Room Button
    document.getElementById('btn-create-private-room')?.addEventListener('click', () => {
      if (user.coins < privStake) {
        showToast(\`🪙 Need 🪙 \${privStake.toLocaleString()} Coins to create room!\`);
        openShopModal();
        return;
      }
      sounds.playClick();
      ludoNetwork.createRoom(privStake, privPlayerCount);
    });

    // Paste Code Button
    document.getElementById('btn-paste-room-code')?.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clipText = await navigator.clipboard.readText();
          const clean = (clipText || '').replace(/\\D/g, '').substring(0, 6);
          if (clean) {
            document.getElementById('input-room-code').value = clean;
            showToast('📋 Code Pasted!');
            return;
          }
        }
      } catch (e) {}
      const manual = prompt('Enter 6-digit Room Code:');
      if (manual) {
        document.getElementById('input-room-code').value = manual.replace(/\\D/g, '').substring(0, 6);
      }
    });

    // Join Room Button
    document.getElementById('btn-join-private-room')?.addEventListener('click', () => {
      const codeInput = document.getElementById('input-room-code');
      const code = (codeInput?.value || '').trim();
      if (!code || code.length !== 6) {
        showToast('⚠️ Please enter a valid 6-digit room code');
        return;
      }
      sounds.playClick();
      ludoNetwork.joinRoom(code);
    });

    // Lobby Buttons
    document.getElementById('btn-copy-lobby-code')?.addEventListener('click', () => {
      const code = ludoNetwork.currentRoom;
      if (!code) return;
      if (window.AndroidBridge && typeof window.AndroidBridge.copyToClipboard === 'function') {
        window.AndroidBridge.copyToClipboard(code);
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
        showToast(\`📋 Room Code \${code} Copied to Clipboard!\`);
      } else {
        showToast(\`Room Code: \${code}\`);
      }
      sounds.playClick();
    });

    document.getElementById('btn-share-lobby-code')?.addEventListener('click', () => {
      const code = ludoNetwork.currentRoom;
      if (!code) return;
      if (window.AndroidBridge && typeof window.AndroidBridge.shareRoomCode === 'function') {
        window.AndroidBridge.shareRoomCode(code, ludoNetwork.roomStake);
      } else if (navigator.share) {
        navigator.share({
          title: 'Join Ludo Master Room',
          text: \`🎲 Join my Ludo Master room! Room Code: \${code} (Entry: 🪙 \${ludoNetwork.roomStake}). Enter code in Private Table to play with me in real-time!\`
        }).catch(() => {});
      } else {
        const text = encodeURIComponent(\`Join my Ludo Master match! Room Code: \${code}. Open the app -> Private Table -> Join Room!\`);
        window.open(\`https://api.whatsapp.com/send?text=\${text}\`, '_blank');
      }
      sounds.playClick();
    });

    document.getElementById('btn-lobby-start-game')?.addEventListener('click', () => {
      if (!ludoNetwork.isHost || !ludoNetwork.currentRoom) return;
      sounds.playWin();
      
      // Fill any remaining empty slots with Smart AI Bots
      while (ludoNetwork.roomPlayers.length < ludoNetwork.roomPlayerCount) {
        const idx = ludoNetwork.roomPlayers.length;
        const botNames = ['Ayesha (BOT)', 'Hamza (BOT)', 'David (BOT)'];
        ludoNetwork.roomPlayers.push({
          index: idx,
          name: botNames[idx - 1] || \`Bot \${idx}\`,
          avatarIndex: idx,
          flag: '🤖',
          isHost: false,
          isReady: true,
          clientId: 'bot_' + idx
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

      gameState.roomId = ludoNetwork.currentRoom;
      gameState.userPlayerId = 0;
      startMatch(GAME_MODES.PRIVATE, ludoNetwork.roomPlayerCount, ludoNetwork.roomStake);
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

if (html.includes(oldPrivateHandlers)) {
  html = html.replace(oldPrivateHandlers, newPrivateHandlers);
  console.log('Replaced old private handlers with real multiplayer handlers');
} else {
  console.log('Using regex replace for private handlers');
  html = html.replace(
    /document\.getElementById\('btn-create-private-room'\)\?\.addEventListener\('click'[\s\S]*?startMatch\(GAME_MODES\.PRIVATE, 4, 1000\);\s*\}\);/,
    newPrivateHandlers
  );
}

// 6. Hook Online World Matchmaking in btn-start-game-match
const oldStartMatchBtn = `    document.getElementById('btn-start-game-match')?.addEventListener('click', () => {
      closeAllModals();
      startMatch(pendingMode, gameState.playerCount, gameState.stake);
    });`;

const newStartMatchBtn = `    document.getElementById('btn-start-game-match')?.addEventListener('click', () => {
      closeAllModals();
      if (pendingMode === GAME_MODES.ONLINE) {
        ludoNetwork.startWorldMatchmaking(gameState.stake, gameState.playerCount);
      } else {
        startMatch(pendingMode, gameState.playerCount, gameState.stake);
      }
    });`;

if (html.includes(oldStartMatchBtn)) {
  html = html.replace(oldStartMatchBtn, newStartMatchBtn);
  console.log('Hooked startWorldMatchmaking in btn-start-game-match');
}

fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Multiplayer logic successfully wired into index.html files!');
