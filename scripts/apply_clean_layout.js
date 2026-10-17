const fs = require('fs');
let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');

console.log('Injecting authoritative non-overlapping layout CSS...');

const cleanLayoutCss = `
    /* =========================================================================
       AUTHORITATIVE NON-OVERLAPPING LUDO GAME SCREEN CONSOLE LAYOUT
       ========================================================================= */
    /* Hide all obsolete overlapping badges and extra camera toolbars */
    .board-nav-hud,
    .board-gesture-hint,
    .dice-gesture-hint,
    #dice-nudge-float-badge,
    .dice-gesture-overlay {
      display: none !important;
    }

    /* Game HUD Root Container */
    #game-hud {
      position: absolute !important;
      inset: 0 !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      display: none;
      pointer-events: none;
      z-index: 20;
      box-sizing: border-box;
      overflow: hidden;
    }

    /* Top HUD Bar: Pinned strictly to top edge */
    .game-hud-top-bar {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      height: 46px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 0 10px !important;
      background: linear-gradient(180deg, rgba(8, 14, 28, 0.95) 0%, rgba(8, 14, 28, 0.5) 85%, transparent 100%) !important;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 40 !important;
      pointer-events: auto !important;
      box-sizing: border-box !important;
    }
    .leave-game-btn {
      padding: 5px 12px !important;
      font-size: 11px !important;
      height: 30px !important;
      border-radius: 12px !important;
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
    }
    .top-stats-pill {
      height: 28px !important;
      padding: 2px 10px !important;
      margin: 0 auto !important;
      font-size: 11px !important;
      border-radius: 14px !important;
    }
    .hud-top-actions {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }
    .hud-action-btn {
      height: 30px !important;
      padding: 4px 8px !important;
      border-radius: 10px !important;
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
      font-size: 11px !important;
    }

    /* Player Cards Container */
    .players-container {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none !important;
      z-index: 25 !important;
    }

    /* The 4 Corner Player Cards */
    .hud-player-card {
      position: absolute !important;
      pointer-events: auto !important;
      display: flex !important;
      flex-direction: column !important;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 16, 32, 0.98) 100%) !important;
      border: 2px solid rgba(255, 255, 255, 0.25) !important;
      border-radius: 16px !important;
      padding: 4px 6px !important;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.2) !important;
      backdrop-filter: blur(10px);
      width: 116px !important;
      box-sizing: border-box !important;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .hud-player-card.active-turn {
      border-color: #fbbf24 !important;
      box-shadow: 0 0 20px rgba(251, 191, 36, 0.8), 0 0 8px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.6) !important;
      transform: scale(1.04) !important;
      background: linear-gradient(180deg, rgba(30, 41, 69, 0.98) 0%, rgba(15, 26, 48, 1) 100%) !important;
    }

    /* Positions in Mobile Portrait (Clean 4 Corners, No Overlap!) */
    .hud-player-card.p1 {
      top: 52px !important;
      left: 8px !important;
      bottom: auto !important;
      right: auto !important;
      border-color: #10b981 !important;
    }
    .hud-player-card.p2 {
      top: 52px !important;
      right: 8px !important;
      bottom: auto !important;
      left: auto !important;
      border-color: #f59e0b !important;
    }
    .hud-player-card.p0 {
      bottom: 12px !important;
      left: 8px !important;
      top: auto !important;
      right: auto !important;
      border-color: #ef4444 !important;
    }
    .hud-player-card.p3 {
      bottom: 12px !important;
      right: 8px !important;
      top: auto !important;
      left: auto !important;
      border-color: #3b82f6 !important;
    }

    /* Positions in Landscape Mode */
    @media (orientation: landscape) {
      .hud-player-card.p1 {
        top: 44px !important;
        left: 12px !important;
        right: auto !important;
        bottom: auto !important;
      }
      .hud-player-card.p2 {
        top: 44px !important;
        right: 12px !important;
        left: auto !important;
        bottom: auto !important;
      }
      .hud-player-card.p0 {
        bottom: 10px !important;
        left: 12px !important;
        top: auto !important;
        right: auto !important;
      }
      .hud-player-card.p3 {
        bottom: 10px !important;
        right: 12px !important;
        top: auto !important;
        left: auto !important;
      }
    }

    /* Card Contents */
    .hud-card-main {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }
    .hud-avatar-wrapper {
      position: relative !important;
      width: 38px !important;
      height: 38px !important;
      flex-shrink: 0 !important;
    }
    .hud-p-avatar {
      width: 38px !important;
      height: 38px !important;
      border-radius: 50% !important;
      overflow: hidden !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: rgba(0,0,0,0.4) !important;
    }
    .hud-p-flag {
      position: absolute !important;
      bottom: -2px !important;
      right: -2px !important;
      font-size: 11px !important;
      line-height: 1 !important;
    }
    .hud-p-lvl {
      position: absolute !important;
      top: -3px !important;
      right: -3px !important;
      background: #fbbf24 !important;
      color: #000 !important;
      font-size: 7.5px !important;
      font-weight: 900 !important;
      padding: 1px 3px !important;
      border-radius: 4px !important;
      border: 1px solid #fff !important;
    }
    .hud-p-info {
      flex: 1 !important;
      min-width: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 1px !important;
    }
    .hud-p-name-row {
      display: flex !important;
      align-items: center !important;
      gap: 3px !important;
    }
    .hud-p-name {
      font-size: 11px !important;
      font-weight: 800 !important;
      color: #ffffff !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 50px !important;
    }
    .hud-you-tag {
      background: #ef4444 !important;
      color: #fff !important;
      font-size: 7px !important;
      font-weight: 900 !important;
      padding: 1px 3px !important;
      border-radius: 3px !important;
    }
    .hud-bot-tag {
      background: rgba(255, 255, 255, 0.15) !important;
      color: #cbd5e1 !important;
      font-size: 7px !important;
      font-weight: 700 !important;
      padding: 1px 3px !important;
      border-radius: 3px !important;
    }
    .hud-p-status-row {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
    }
    .hud-p-status {
      font-size: 8.5px !important;
      color: #94a3b8 !important;
      font-weight: 600 !important;
      white-space: nowrap !important;
    }
    .hud-mini-dice {
      font-size: 11px !important;
    }

    /* Floating Live Chat Button: Vertically Centered on Right Screen Edge */
    .hud-chat-fab {
      position: absolute !important;
      right: 10px !important;
      top: 50% !important;
      bottom: auto !important;
      left: auto !important;
      transform: translateY(-50%) !important;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      border: 2px solid #fbbf24 !important;
      border-radius: 50% !important;
      width: 44px !important;
      height: 44px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      color: #ffffff !important;
      font-weight: 900 !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6), 0 0 14px rgba(16, 185, 129, 0.4) !important;
      cursor: pointer !important;
      pointer-events: auto !important;
      z-index: 45 !important;
      transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }
    .hud-chat-fab:active {
      transform: translateY(-50%) scale(0.92) !important;
    }
    .hud-chat-fab-icon {
      font-size: 17px !important;
      line-height: 1 !important;
    }
    .hud-chat-fab-text {
      font-size: 8px !important;
      letter-spacing: 0.5px !important;
      font-weight: 900 !important;
    }
    .hud-chat-unread-badge {
      position: absolute !important;
      top: -2px !important;
      right: -2px !important;
      background: #ef4444 !important;
      color: #fff !important;
      font-size: 8.5px !important;
      font-weight: 900 !important;
      border-radius: 8px !important;
      padding: 1px 4px !important;
      border: 1px solid #fff !important;
    }
    @media (orientation: landscape) {
      .hud-chat-fab {
        right: 12px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
      }
    }

    /* Bottom In-Game Roll Controls: Centered between P0 and P3 */
    .game-bottom-controls {
      position: absolute !important;
      bottom: 8px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 4px !important;
      z-index: 35 !important;
      pointer-events: auto !important;
      width: auto !important;
      max-width: calc(100vw - 245px) !important;
      box-sizing: border-box !important;
    }
    .turn-banner {
      background: linear-gradient(135deg, rgba(16, 26, 46, 0.95) 0%, rgba(8, 14, 28, 0.95) 100%) !important;
      border: 1px solid rgba(255, 255, 255, 0.22) !important;
      padding: 3px 10px !important;
      border-radius: 12px !important;
      font-size: 10.5px !important;
      font-weight: 800 !important;
      color: #ffffff !important;
      text-align: center !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 175px !important;
    }
    .dice-action-area {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }
    .dice-btn {
      width: 62px !important;
      height: 62px !important;
      border-radius: 18px !important;
      background: linear-gradient(145deg, #2a3a54 0%, #131c2c 100%) !important;
      border: 2.5px solid var(--gold-color) !important;
      box-shadow: 0 8px 20px rgba(0,0,0,0.7), 0 0 16px rgba(255,215,0,0.3) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      position: relative !important;
    }
    .dice-face-display {
      font-size: 30px !important;
      line-height: 1 !important;
    }
    .dice-roll-label {
      position: absolute !important;
      bottom: -6px !important;
      font-size: 8px !important;
      background: #fbbf24 !important;
      color: #000 !important;
      font-weight: 900 !important;
      padding: 1px 5px !important;
      border-radius: 4px !important;
      letter-spacing: 0.5px !important;
    }
    .in-game-boosters {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      margin-top: 2px !important;
    }
    .booster-btn {
      padding: 3px 8px !important;
      font-size: 9.5px !important;
      border-radius: 8px !important;
      font-weight: 800 !important;
    }
    @media (orientation: landscape) {
      .game-bottom-controls {
        bottom: 8px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
      }
    }
`;

html = html.replace('</style>', cleanLayoutCss + '\n</style>');

// Also hook up Camera Angle Toggle button in top bar:
const oldTopActions = `<div class="hud-top-actions">
          <button class="hud-action-btn" id="btn-open-game-chat" title="Game Live Chat">`;

const newTopActions = `<div class="hud-top-actions">
          <button class="hud-action-btn" id="btn-in-game-cam-toggle" title="Switch 3D View Angle">
            <span style="font-size:13px;">📐</span>
            <span class="hud-btn-text">View</span>
          </button>
          <button class="hud-action-btn" id="btn-open-game-chat" title="Game Live Chat">`;

if (html.includes(oldTopActions)) {
  html = html.replace(oldTopActions, newTopActions);
  console.log('Camera toggle added to top bar actions');
}

// Hook camera toggle in JS
const camHook = `
    document.getElementById('btn-in-game-cam-toggle')?.addEventListener('click', () => {
      boardPanState.tilt = (boardPanState.tilt + 1) % 3;
      applyCameraTransform();
      const tiltNames = ['Standard Isometric', 'Cinematic Perspective', 'Pure Top-Down 2D'];
      showToast(\`Camera: \${tiltNames[boardPanState.tilt]}\`);
    });
`;

html = html.replace("document.getElementById('btn-in-game-sound-toggle')?.addEventListener('click'", camHook + "\n    document.getElementById('btn-in-game-sound-toggle')?.addEventListener('click'");

fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Clean layout successfully applied to both files!');
