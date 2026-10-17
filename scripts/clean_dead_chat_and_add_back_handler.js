const fs = require('fs');

let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');

const startMarker = "// IN-GAME LIVE CHAT & EMOJI SYSTEM (Multiplayer Switcher, Live Ticker, Both Modes)";
const endMarker = "document.getElementById('btn-in-game-cam-toggle')";

const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker);

if (start !== -1 && end !== -1) {
  const replacement = `// Unified Ludo King Chat Open Hook
    document.getElementById('btn-open-game-chat')?.addEventListener('click', () => {
      if (typeof openLudoChat === 'function') openLudoChat();
    });

    function initRoomChatListener() {
      // Room chat is handled via ludoNetwork MQTT & WebSockets
    }

    // Android System Back Button & Gesture Handler
    window.onAndroidBackPressed = function() {
      // 1. Close any open modal overlay
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        if (activeModal.id === 'modal-room-lobby') {
          if (confirm('Leave room lobby?')) {
            if (typeof ludoNetwork !== 'undefined') ludoNetwork.leaveRoom();
            activeModal.classList.remove('active');
          }
        } else if (activeModal.id === 'modal-matchmaking') {
          if (typeof ludoNetwork !== 'undefined') ludoNetwork.cancelMatchmaking();
        } else {
          activeModal.classList.remove('active');
        }
        return;
      }

      // 2. If in Game HUD, confirm leave
      const hud = document.getElementById('game-hud');
      if (hud && hud.style.display !== 'none' && hud.style.display !== '') {
        if (confirm('Leave match and return to Main Menu?')) {
          if (typeof ludoNetwork !== 'undefined' && (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE)) {
            ludoNetwork.leaveRoom();
          }
          hud.style.display = 'none';
          document.getElementById('menu-screen').style.display = 'flex';
          document.getElementById('top-bar').style.display = 'flex';
          document.getElementById('top-menu-drawer')?.classList.remove('active');
          document.getElementById('btn-toggle-menu-drawer')?.classList.remove('open');
        }
        return;
      }

      // 3. If drawer is open, close drawer
      const drawer = document.getElementById('top-menu-drawer');
      if (drawer && drawer.classList.contains('active')) {
        drawer.classList.remove('active');
        document.getElementById('btn-toggle-menu-drawer')?.classList.remove('open');
        return;
      }

      // 4. On main menu
      showToast('Press Home to minimize Ludo Master');
    };

    `;

  html = html.substring(0, start) + replacement + html.substring(end);
  console.log('Successfully replaced dead chat code and installed onAndroidBackPressed!');
} else {
  console.error('Could not find markers for dead chat code');
}

fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Saved both files!');
