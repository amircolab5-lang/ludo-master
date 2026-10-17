const fs = require('fs');

let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');

// =========================================================================
// 1. CSS INJECTION FOR LUDO KING PLAYER CARDS, MODAL & CHAT BUTTON
// =========================================================================
const cssToInject = `
    /* =========================================================================
       AUTHENTIC LUDO KING CONSOLE PLAYER CARDS & IN-GAME LIVE CHAT
       ========================================================================= */
    .hud-player-card {
      position: absolute;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 18, 34, 0.98) 100%);
      border: 3px solid rgba(255, 255, 255, 0.25);
      border-radius: 16px;
      padding: 5px 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(12px);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      width: 124px;
      box-sizing: border-box;
      z-index: 20;
    }
    .hud-player-card.active-turn {
      border-color: #fbbf24 !important;
      box-shadow: 0 0 24px rgba(251, 191, 36, 0.8), 0 0 10px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.6) !important;
      transform: scale(1.06);
      background: linear-gradient(180deg, rgba(30, 41, 69, 0.98) 0%, rgba(15, 26, 48, 1) 100%) !important;
    }
    .hud-player-card.p0 {
      bottom: 135px;
      left: 12px;
      border-color: #ef4444;
    }
    .hud-player-card.p1 {
      top: 58px;
      left: 12px;
      border-color: #10b981;
    }
    .hud-player-card.p2 {
      top: 58px;
      right: 12px;
      border-color: #f59e0b;
    }
    .hud-player-card.p3 {
      bottom: 135px;
      right: 12px;
      border-color: #3b82f6;
    }
    .hud-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 2px;
    }
    .hud-flag-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 10px;
      font-weight: 800;
      color: #e2e8f0;
      white-space: nowrap;
    }
    .hud-lvl-pill {
      font-size: 9px;
      font-weight: 900;
      background: linear-gradient(135deg, #1e3a8a, #2563eb);
      border: 1px solid #60a5fa;
      color: #fff;
      padding: 1px 5px;
      border-radius: 8px;
    }
    .hud-card-middle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .hud-avatar-frame {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: 2px solid #fbbf24;
      overflow: hidden;
      background: #0f172a;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hud-p-avatar {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hud-p-avatar svg, .hud-p-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hud-dice-dock {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);
      flex-shrink: 0;
    }
    .hud-mini-dice {
      font-size: 22px;
      line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));
    }
    .hud-card-bottom {
      margin-top: 3px;
      text-align: center;
    }
    .hud-p-name {
      font-size: 11.5px;
      font-weight: 800;
      color: #fff;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    }
    /* Floating Chat Bubble Button Beside P0 */
    .board-floating-chat-btn {
      position: absolute;
      bottom: 215px;
      left: 16px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
      border: 2.5px solid #fbbf24;
      box-shadow: 0 6px 20px rgba(0,0,0,0.6), 0 0 16px rgba(251, 191, 36, 0.5);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      z-index: 25;
      pointer-events: auto;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .board-floating-chat-btn:active {
      transform: scale(0.9);
    }
    .chat-unread-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      background: #ef4444;
      border: 2px solid #fff;
      border-radius: 50%;
    }

    /* Central Ludo King Chat Dialog Window */
    .ludo-chat-dialog {
      width: 90vw;
      max-width: 360px;
      max-height: 82vh;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 16, 32, 0.99) 100%);
      border: 2.5px solid #fbbf24;
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(251, 191, 36, 0.35);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: chatPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes chatPop {
      from { transform: scale(0.92); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .ludo-chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px 8px 14px;
      background: linear-gradient(180deg, rgba(30, 41, 69, 0.8) 0%, transparent 100%);
      border-bottom: 1px solid rgba(251, 191, 36, 0.3);
    }
    .ludo-chat-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ludo-chat-title {
      font-size: 13.5px;
      font-weight: 900;
      color: #fbbf24;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    }
    .ludo-chat-close-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.2);
      border: 1.5px solid #fbbf24;
      color: #fbbf24;
      font-size: 13px;
      font-weight: 900;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .ludo-chat-close-btn:active {
      transform: scale(0.9);
      background: #ef4444;
      color: #fff;
    }
    .ludo-chat-as-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(0,0,0,0.3);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      overflow-x: auto;
    }
    .ludo-chat-as-chips {
      display: flex;
      gap: 6px;
    }
    .ludo-chat-chip {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 10.5px;
      font-weight: 800;
      border: 1.5px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.08);
      color: #94a3b8;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .ludo-chat-chip.active {
      color: #fff;
      border-color: #fbbf24;
      background: rgba(251, 191, 36, 0.25);
    }
    .ludo-chat-feed {
      flex: 1;
      min-height: 180px;
      max-height: 240px;
      overflow-y: auto;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: rgba(0, 0, 0, 0.45);
    }
    .ludo-msg-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      border-radius: 14px;
      padding: 8px 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      animation: msgSlideIn 0.2s ease-out;
    }
    @keyframes msgSlideIn {
      from { transform: translateY(6px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .ludo-msg-banner.p0 {
      background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
      color: #ffffff;
    }
    .ludo-msg-banner.p1 {
      background: linear-gradient(90deg, #15803d 0%, #16a34a 100%);
      color: #ffffff;
    }
    .ludo-msg-banner.p2 {
      background: linear-gradient(90deg, #eab308 0%, #facc15 100%);
      color: #000000;
    }
    .ludo-msg-banner.p3 {
      background: linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%);
      color: #ffffff;
    }
    .ludo-msg-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.7);
      background: #0f172a;
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ludo-msg-avatar svg {
      width: 100%;
      height: 100%;
    }
    .ludo-msg-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .ludo-msg-sender {
      font-size: 10px;
      font-weight: 800;
      opacity: 0.85;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .ludo-msg-text {
      font-size: 13.5px;
      font-weight: 900;
      line-height: 1.3;
      word-break: break-word;
    }
    /* Preset Drawer */
    .ludo-preset-panel {
      border-top: 1px solid rgba(255,255,255,0.1);
      background: rgba(15, 23, 42, 0.98);
      padding: 8px 12px;
      max-height: 160px;
      overflow-y: auto;
    }
    .preset-tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
    }
    .preset-tab {
      flex: 1;
      padding: 5px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.06);
      color: #94a3b8;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
    }
    .preset-tab.active {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border-color: #fbbf24;
      color: #fff;
    }
    .preset-phrases-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .preset-phrase-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 8px;
      color: #fff;
      font-size: 11.5px;
      font-weight: 700;
      padding: 7px 8px;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s;
    }
    .preset-phrase-btn:active {
      transform: scale(0.96);
      border-color: #fbbf24;
      background: rgba(251, 191, 36, 0.2);
    }
    .preset-emojis-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
    }
    .preset-emoji-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 10px;
      font-size: 20px;
      padding: 6px 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s;
    }
    .preset-emoji-btn:active {
      transform: scale(1.2);
    }
    /* Chat Bottom Input Bar */
    .ludo-chat-input-bar {
      padding: 10px 12px;
      background: rgba(10, 16, 32, 0.95);
      border-top: 1.5px solid rgba(251, 191, 36, 0.3);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ludo-chat-input-field {
      width: 100%;
      background: rgba(15, 23, 42, 0.9);
      border: 1.5px solid #ffffff;
      border-radius: 12px;
      color: #ffffff;
      font-size: 13.5px;
      font-weight: 700;
      padding: 9px 12px;
      box-sizing: border-box;
      outline: none;
    }
    .ludo-chat-input-field:focus {
      border-color: #fbbf24;
      box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
    }
    .ludo-chat-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .ludo-chat-pill-btn {
      flex: 1;
      background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
      border: 2px solid #fbbf24;
      border-radius: 20px;
      color: #fff;
      font-size: 13px;
      font-weight: 900;
      padding: 8px 14px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
      transition: all 0.15s ease;
    }
    .ludo-chat-pill-btn:active {
      transform: scale(0.96);
      background: linear-gradient(180deg, #1d4ed8 0%, #1e40af 100%);
      border-color: #f59e0b;
    }
    .ludo-chat-pill-btn.preset-btn {
      background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
    }
    .ludo-chat-pill-btn.send-btn {
      background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
    }
    .send-arrow {
      color: #fbbf24;
      font-size: 14px;
      font-weight: 900;
    }

    @media (orientation: landscape) {
      .hud-player-card.p0 { bottom: 18px; left: 16px; }
      .hud-player-card.p1 { top: 16px; left: 16px; }
      .hud-player-card.p2 { top: 16px; right: 350px; }
      .hud-player-card.p3 { bottom: 18px; right: 350px; }
      .board-floating-chat-btn { bottom: 90px; left: 16px; }
      .ludo-chat-dialog { max-height: 94vh; width: 340px; }
    }
`;

// Insert styles before </style>
html = html.replace('</style>', cssToInject + '\n</style>');
console.log('CSS styles injected');

// =========================================================================
// 2. HTML: REPLACE PLAYERS-CONTAINER WITH AUTHENTIC LUDO KING CONSOLE CARDS
// =========================================================================
const oldPlayersHtml = `<div class="players-container">
        <!-- Player 0 (Red - Bottom Left) -->
        <div class="hud-player-card p0" id="hud-p0">
          <div class="hud-chat-bubble" id="hud-bubble-p0"></div>
          <div class="hud-p-avatar" id="hud-p0-avatar">🔴</div>
          <div class="hud-p-info">
            <span class="hud-p-name" id="hud-p0-name">Red</span>
            <span class="hud-p-status" id="hud-p0-status">In Base</span>
          </div>
        </div>
        <!-- Player 1 (Green - Top Left) -->
        <div class="hud-player-card p1" id="hud-p1">
          <div class="hud-chat-bubble" id="hud-bubble-p1"></div>
          <div class="hud-p-avatar" id="hud-p1-avatar">🟢</div>
          <div class="hud-p-info">
            <span class="hud-p-name" id="hud-p1-name">Green</span>
            <span class="hud-p-status" id="hud-p1-status">In Base</span>
          </div>
        </div>
        <!-- Player 2 (Yellow - Top Right) -->
        <div class="hud-player-card p2" id="hud-p2">
          <div class="hud-chat-bubble" id="hud-bubble-p2"></div>
          <div class="hud-p-avatar" id="hud-p2-avatar">🟡</div>
          <div class="hud-p-info">
            <span class="hud-p-name" id="hud-p2-name">Yellow</span>
            <span class="hud-p-status" id="hud-p2-status">In Base</span>
          </div>
        </div>
        <!-- Player 3 (Blue - Bottom Right) -->
        <div class="hud-player-card p3" id="hud-p3">
          <div class="hud-chat-bubble" id="hud-bubble-p3"></div>
          <div class="hud-p-avatar" id="hud-p3-avatar">🔵</div>
          <div class="hud-p-info">
            <span class="hud-p-name" id="hud-p3-name">Blue</span>
            <span class="hud-p-status" id="hud-p3-status">In Base</span>
          </div>
        </div>
      </div>`;

const newPlayersHtml = `<div class="players-container">
        <!-- Player 0 (Red - Bottom Left) -->
        <div class="hud-player-card p0" id="hud-p0">
          <div class="hud-card-top">
            <span class="hud-flag-badge" id="hud-p0-flag">🇮🇳 India</span>
            <span class="hud-lvl-pill" id="hud-p0-lvl">Lvl 8</span>
          </div>
          <div class="hud-card-middle">
            <div class="hud-avatar-frame" id="hud-p0-avatar-frame">
              <div class="hud-p-avatar" id="hud-p0-avatar"></div>
            </div>
            <div class="hud-dice-dock" id="hud-dice-dock-0">
              <div class="hud-mini-dice" id="hud-mini-dice-0">🎲</div>
            </div>
          </div>
          <div class="hud-card-bottom">
            <span class="hud-p-name" id="hud-p0-name">Gautam Shinde</span>
          </div>
          <div class="hud-chat-bubble" id="hud-bubble-p0"></div>
        </div>

        <!-- Floating Chat Icon Button beside P0 (Exactly as in Ludo King Screenshot) -->
        <button class="board-floating-chat-btn" id="btn-floating-chat-bubble" title="Chat with Players">
          💬
          <span class="chat-unread-badge" id="chat-floating-unread" style="display:none;"></span>
        </button>

        <!-- Player 1 (Green - Top Left) -->
        <div class="hud-player-card p1" id="hud-p1">
          <div class="hud-card-top">
            <span class="hud-flag-badge" id="hud-p1-flag">🇬🇧 UK</span>
            <span class="hud-lvl-pill" id="hud-p1-lvl">Lvl 7</span>
          </div>
          <div class="hud-card-middle">
            <div class="hud-avatar-frame" id="hud-p1-avatar-frame">
              <div class="hud-p-avatar" id="hud-p1-avatar"></div>
            </div>
            <div class="hud-dice-dock" id="hud-dice-dock-1">
              <div class="hud-mini-dice" id="hud-mini-dice-1">🎲</div>
            </div>
          </div>
          <div class="hud-card-bottom">
            <span class="hud-p-name" id="hud-p1-name">John Marshal</span>
          </div>
          <div class="hud-chat-bubble" id="hud-bubble-p1"></div>
        </div>

        <!-- Player 2 (Yellow - Top Right) -->
        <div class="hud-player-card p2" id="hud-p2">
          <div class="hud-card-top">
            <span class="hud-flag-badge" id="hud-p2-flag">🌍 World</span>
            <span class="hud-lvl-pill" id="hud-p2-lvl">Lvl 8</span>
          </div>
          <div class="hud-card-middle">
            <div class="hud-avatar-frame" id="hud-p2-avatar-frame">
              <div class="hud-p-avatar" id="hud-p2-avatar"></div>
            </div>
            <div class="hud-dice-dock" id="hud-dice-dock-2">
              <div class="hud-mini-dice" id="hud-mini-dice-2">🎲</div>
            </div>
          </div>
          <div class="hud-card-bottom">
            <span class="hud-p-name" id="hud-p2-name">Rashmi Sharma</span>
          </div>
          <div class="hud-chat-bubble" id="hud-bubble-p2"></div>
        </div>

        <!-- Player 3 (Blue - Bottom Right) -->
        <div class="hud-player-card p3" id="hud-p3">
          <div class="hud-card-top">
            <span class="hud-flag-badge" id="hud-p3-flag">🇸🇩 Sudan</span>
            <span class="hud-lvl-pill" id="hud-p3-lvl">Lvl 9</span>
          </div>
          <div class="hud-card-middle">
            <div class="hud-avatar-frame" id="hud-p3-avatar-frame">
              <div class="hud-p-avatar" id="hud-p3-avatar"></div>
            </div>
            <div class="hud-dice-dock" id="hud-dice-dock-3">
              <div class="hud-mini-dice" id="hud-mini-dice-3">🎲</div>
            </div>
          </div>
          <div class="hud-card-bottom">
            <span class="hud-p-name" id="hud-p3-name">Bakulbhai Baricha</span>
          </div>
          <div class="hud-chat-bubble" id="hud-bubble-p3"></div>
        </div>
      </div>`;

if (html.includes(oldPlayersHtml)) {
  html = html.replace(oldPlayersHtml, newPlayersHtml);
  console.log('Player cards HTML replaced');
} else {
  console.error('Could not find oldPlayersHtml');
}

// =========================================================================
// 3. HTML: INSERT AUTHENTIC LUDO KING CHAT MODAL
// =========================================================================
const ludoChatModalHtml = `
    <!-- AUTHENTIC LUDO KING IN-GAME CHAT MODAL (Matches user screenshot exactly) -->
    <div class="modal-overlay" id="modal-ludo-chat">
      <div class="ludo-chat-dialog">
        <div class="ludo-chat-header">
          <div class="ludo-chat-title-group">
            <span style="font-size:18px;">💬</span>
            <span class="ludo-chat-title">Chat with Players Worldwide</span>
          </div>
          <button class="ludo-chat-close-btn" id="btn-close-ludo-chat" title="Close Chat">✕</button>
        </div>

        <div class="ludo-chat-as-bar" id="ludo-chat-as-bar">
          <span style="font-size:11px; color:#94a3b8; font-weight:700;">Chat as:</span>
          <div class="ludo-chat-as-chips" id="ludo-chat-as-chips"></div>
        </div>

        <div class="ludo-chat-feed" id="ludo-chat-feed">
          <!-- Live conversation messages -->
        </div>

        <!-- Preset Quick Phrases & Emojis Panel -->
        <div class="ludo-preset-panel" id="ludo-preset-panel" style="display:none;">
          <div class="preset-tabs">
            <button class="preset-tab active" id="tab-preset-phrases">⚡ Quick Phrases</button>
            <button class="preset-tab" id="tab-preset-emojis">🎩 Emojis</button>
          </div>
          <div class="preset-phrases-grid" id="preset-phrases-content">
            <button class="preset-phrase-btn" data-phrase="All the best!">All the best!</button>
            <button class="preset-phrase-btn" data-phrase="I am Ludo King!">I am Ludo King!</button>
            <button class="preset-phrase-btn" data-phrase="Today is My Day!">Today is My Day!</button>
            <button class="preset-phrase-btn" data-phrase="I am the winner of this game!!! you can't beat me.">I am the winner of this game!!!</button>
            <button class="preset-phrase-btn" data-phrase="Well played! 👏">Well played! 👏</button>
            <button class="preset-phrase-btn" data-phrase="Play fast! ⏳">Play fast! ⏳</button>
            <button class="preset-phrase-btn" data-phrase="Good luck! 🍀">Good luck! 🍀</button>
            <button class="preset-phrase-btn" data-phrase="Don't cut my pawn! 🙏">Don't cut my pawn! 🙏</button>
            <button class="preset-phrase-btn" data-phrase="Roll a 6! 🎲">Roll a 6! 🎲</button>
            <button class="preset-phrase-btn" data-phrase="Haha nice try! 😂">Haha nice try! 😂</button>
            <button class="preset-phrase-btn" data-phrase="Sorry! 😅">Sorry! 😅</button>
            <button class="preset-phrase-btn" data-phrase="Kill me if you can! 😈">Kill me if you can! 😈</button>
          </div>
          <div class="preset-emojis-grid" id="preset-emojis-content" style="display:none;">
            <button class="preset-emoji-btn" data-emoji="🎩">🎩</button>
            <button class="preset-emoji-btn" data-emoji="😂">😂</button>
            <button class="preset-emoji-btn" data-emoji="🔥">🔥</button>
            <button class="preset-emoji-btn" data-emoji="👍">👍</button>
            <button class="preset-emoji-btn" data-emoji="🥳">🥳</button>
            <button class="preset-emoji-btn" data-emoji="😎">😎</button>
            <button class="preset-emoji-btn" data-emoji="🎯">🎯</button>
            <button class="preset-emoji-btn" data-emoji="🚀">🚀</button>
            <button class="preset-emoji-btn" data-emoji="💀">💀</button>
            <button class="preset-emoji-btn" data-emoji="🤩">🤩</button>
            <button class="preset-emoji-btn" data-emoji="👏">👏</button>
            <button class="preset-emoji-btn" data-emoji="😱">😱</button>
            <button class="preset-emoji-btn" data-emoji="🎲">🎲</button>
            <button class="preset-emoji-btn" data-emoji="🏆">🏆</button>
            <button class="preset-emoji-btn" data-emoji="😭">😭</button>
            <button class="preset-emoji-btn" data-emoji="👑">👑</button>
            <button class="preset-emoji-btn" data-emoji="😜">😜</button>
            <button class="preset-emoji-btn" data-emoji="🤝">🤝</button>
            <button class="preset-emoji-btn" data-emoji="💥">💥</button>
            <button class="preset-emoji-btn" data-emoji="💯">💯</button>
          </div>
        </div>

        <div class="ludo-chat-input-bar">
          <input type="text" id="ludo-chat-input" class="ludo-chat-input-field" placeholder="Enter text..." maxlength="60" />
          <div class="ludo-chat-actions">
            <button type="button" class="ludo-chat-pill-btn preset-btn" id="btn-chat-preset-toggle">Preset</button>
            <button type="button" class="ludo-chat-pill-btn send-btn" id="btn-chat-send-msg">Send <span class="send-arrow">➔</span></button>
          </div>
        </div>
      </div>
    </div>
`;

// Insert the chat modal before <!-- MODAL: Authentication
html = html.replace('<!-- MODAL: Authentication', ludoChatModalHtml + '\n    <!-- MODAL: Authentication');
console.log('Ludo King Chat Modal HTML inserted');

// =========================================================================
// 4. HTML: UPDATE SHOP FREE REWARDS TAB (Max 3/day, 10 min cooldown)
// =========================================================================
const cappedRewardsHtml = `<div id="shop-content-rewards" style="display:none;">
          <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%); border: 1.5px solid rgba(16, 185, 129, 0.4); border-radius: 14px; padding: 12px 14px; margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:13px; font-weight:800; color:#fff;">🎁 Sponsored Video Reward</div>
                <div style="font-size:11px; color:#94a3b8; margin-top:2px;" id="ad-reward-status-sub">Watch sponsored ad to earn 500 Coins.</div>
              </div>
              <span id="ad-daily-badge" style="background:#10b981; color:#fff; font-size:10px; font-weight:800; padding:3px 8px; border-radius:12px;">0 / 3 TODAY</span>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <button class="action-btn" id="btn-claim-rewarded-video" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow:0 4px 16px rgba(16,185,129,0.4); padding:12px; font-size:13px; font-weight:800; border-radius:14px; display:flex; align-items:center; justify-content:center; gap:8px;" onclick="window.watchOfficialRewardedAd()">
              <span>📺</span>
              <span id="ad-btn-text">Watch Video (+500 Coins)</span>
            </button>
            <div id="ad-cooldown-note" style="text-align:center; font-size:11px; color:#94a3b8;">
              ⏱️ Strict limit: Max 3 rewards per day &bull; 10 min cooldown between views
            </div>
          </div>
        </div>`;

html = html.replace(/<div id="shop-content-rewards"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<!-- MODAL: Real In-App Purchase Payment Checkout -->/i, cappedRewardsHtml + '</div></div><!-- MODAL: Real In-App Purchase Payment Checkout -->');

// =========================================================================
// 5. JAVASCRIPT: AUTHENTIC PLAYERS, SVGs, CARDS & CHAT ENGINE
// =========================================================================

// Search for PLAYERS definition
const playersOldCode = `const PLAYERS = [
      { id: 0, name: 'Red', color: 0xff0033, hexStr: '#ff0033', startTrack: 0, homeEntry: 50 },
      { id: 1, name: 'Green', color: 0x00c853, hexStr: '#00c853', startTrack: 13, homeEntry: 50 },
      { id: 2, name: 'Yellow', color: 0xffb700, hexStr: '#ffb700', startTrack: 26, homeEntry: 50 },
      { id: 3, name: 'Blue', color: 0x0055ff, hexStr: '#0055ff', startTrack: 39, homeEntry: 50 }
    ];`;

const playersNewCode = `// =========================================================================
    // AUTHENTIC LUDO KING CHARACTERS & VECTOR AVATARS (Matches User Screenshots)
    // =========================================================================
    const PLAYER_AVATARS_SVG = {
      0: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#ef4444" stroke="#fbbf24" stroke-width="3"/>
        <path d="M22 96 C22 74 34 70 50 70 C66 70 78 74 78 96 Z" fill="#ffffff"/>
        <path d="M47 70 L50 92 L53 70 Z" fill="#1e293b"/>
        <polygon points="50,70 47,76 50,81 53,76" fill="#ef4444"/>
        <rect x="44" y="60" width="12" height="12" fill="#fed7aa"/>
        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#fed7aa"/>
        <circle cx="44" cy="48" r="2.2" fill="#1e293b"/>
        <circle cx="56" cy="48" r="2.2" fill="#1e293b"/>
        <path d="M44 56 Q50 60 56 56" stroke="#c2410c" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M25 36 C25 22 40 20 50 20 C60 20 75 22 75 36 Z" fill="#334155"/>
        <path d="M23 36 C23 33 77 33 77 36 L73 41 C62 43 38 43 27 41 Z" fill="#0f172a"/>
        <rect x="46" y="27" width="8" height="6" rx="2" fill="#fbbf24"/>
      </svg>\`,
      1: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#10b981" stroke="#fbbf24" stroke-width="3"/>
        <path d="M22 96 C22 74 34 70 50 70 C66 70 78 74 78 96 Z" fill="#3f6212"/>
        <rect x="44" y="60" width="12" height="12" fill="#fed7aa"/>
        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#fed7aa"/>
        <circle cx="44" cy="48" r="2.2" fill="#1e293b"/>
        <circle cx="56" cy="48" r="2.2" fill="#1e293b"/>
        <path d="M43 43 L48 43" stroke="#451a03" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M52 43 L57 43" stroke="#451a03" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M45 56 L55 56" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>
        <path d="M24 38 C26 22 45 22 68 25 C78 27 80 38 68 40 C55 42 26 42 24 38 Z" fill="#4d7c0f"/>
        <circle cx="38" cy="32" r="4" fill="#fbbf24"/>
        <polygon points="38,29 40,32 42,32 40,34 41,37 38,35 35,37 36,34 34,32 36,32" fill="#d97706"/>
      </svg>\`,
      2: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#f59e0b" stroke="#fbbf24" stroke-width="3"/>
        <path d="M22 96 C22 74 34 70 50 70 C66 70 78 74 78 96 Z" fill="#fbbf24"/>
        <rect x="44" y="60" width="12" height="12" fill="#fde047"/>
        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#fde047"/>
        <path d="M26 44 C24 24 36 18 50 18 C64 18 76 24 74 44 C70 50 68 62 70 70 C66 68 66 52 66 48 C66 32 60 26 50 26 C40 26 34 32 34 48 C34 52 34 68 30 70 C32 62 30 50 26 44 Z" fill="#4c1d95"/>
        <circle cx="43" cy="47" r="6" fill="none" stroke="#6b21a8" stroke-width="2"/>
        <circle cx="57" cy="47" r="6" fill="none" stroke="#6b21a8" stroke-width="2"/>
        <line x1="49" y1="47" x2="51" y2="47" stroke="#6b21a8" stroke-width="2"/>
        <circle cx="43" cy="47" r="2" fill="#1e293b"/>
        <circle cx="57" cy="47" r="2" fill="#1e293b"/>
        <path d="M44 56 Q50 61 56 56" stroke="#e11d48" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>\`,
      3: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#3b82f6" stroke="#fbbf24" stroke-width="3"/>
        <path d="M22 96 C22 74 34 70 50 70 C66 70 78 74 78 96 Z" fill="#1e3a8a"/>
        <rect x="44" y="60" width="12" height="12" fill="#fed7aa"/>
        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#fed7aa"/>
        <path d="M30 36 C32 20 44 18 50 18 C56 18 68 20 70 36 C66 28 58 24 50 24 C42 24 34 28 30 36 Z" fill="#1e293b"/>
        <rect x="38" y="42" width="10" height="8" rx="2" fill="none" stroke="#1e293b" stroke-width="2"/>
        <rect x="52" y="42" width="10" height="8" rx="2" fill="none" stroke="#1e293b" stroke-width="2"/>
        <line x1="48" y1="46" x2="52" y2="46" stroke="#1e293b" stroke-width="2"/>
        <circle cx="43" cy="46" r="2" fill="#1e293b"/>
        <circle cx="57" cy="46" r="2" fill="#1e293b"/>
        <path d="M41 54 Q46 51 50 53 Q54 51 59 54 Q50 57 41 54 Z" fill="#0f172a"/>
        <path d="M42 62 Q50 67 58 62 L56 59 Q50 63 44 59 Z" fill="#0f172a"/>
      </svg>\`
    };

    const PLAYERS = [
      { id: 0, name: 'Gautam Shinde', color: 0xff0033, hexStr: '#ff0033', flag: '🇮🇳 India', lvl: 'Lvl 8', startTrack: 0, homeEntry: 50 },
      { id: 1, name: 'John Marshal', color: 0x00c853, hexStr: '#00c853', flag: '🇬🇧 UK', lvl: 'Lvl 7', startTrack: 13, homeEntry: 50 },
      { id: 2, name: 'Rashmi Sharma', color: 0xffb700, hexStr: '#ffb700', flag: '🌍 World', lvl: 'Lvl 8', startTrack: 26, homeEntry: 50 },
      { id: 3, name: 'Bakulbhai Baricha', color: 0x0055ff, hexStr: '#0055ff', flag: '🇸🇩 Sudan', lvl: 'Lvl 9', startTrack: 39, homeEntry: 50 }
    ];`;

html = html.replace(playersOldCode, playersNewCode);
console.log('PLAYERS array updated with realistic Ludo King characters');

// Update updateTurnUI to update cards, flags, level pills, and dice dock
const oldUpdateTurnUI = `      for (let i = 0; i < 4; i++) {
        const card = document.getElementById(\`hud-p\${i}\`);
        const avatarEl = document.getElementById(\`hud-p\${i}-avatar\`);
        const nameEl = document.getElementById(\`hud-p\${i}-name\`);
        const statusEl = document.getElementById(\`hud-p\${i}-status\`);
        if (card) {
          if (!activeList.includes(i)) {
            card.style.display = 'none';
          } else {
            card.style.display = 'flex';
            if (i === gameState.activeTurn) card.classList.add('active-turn');
            else card.classList.remove('active-turn');
            const isThisHuman = (gameState.mode === GAME_MODES.LOCAL) ? (i === humanId) : (i === humanId);
            if (isThisHuman) {
              if (nameEl) nameEl.innerHTML = \`<strong>\${user.name || 'You'}</strong> <span style="font-size:9.5px; background:\${PLAYERS[i].hexStr}; color:#fff; padding:1px 5px; border-radius:4px; font-weight:800; margin-left:3px;">YOU</span>\`;
              if (statusEl) statusEl.textContent = \`\${PLAYERS[i].name} • Playing\`;
              if (avatarEl && (i === humanId) && user.photoURL && (user.photoURL.startsWith('http') || user.photoURL.startsWith('data:image'))) {
                avatarEl.innerHTML = \`<img src="\${user.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="Avatar" />\`;
              }
            } else {
              if (nameEl) {
                if (gameState.mode === GAME_MODES.VS_AI) {
                  nameEl.innerHTML = \`\${PLAYERS[i].name} <span style="font-size:9px; color:#94a3b8; font-weight:600;">(Bot)</span>\`;
                } else {
                  nameEl.textContent = \`\${PLAYERS[i].name}\`;
                }
              }
              if (statusEl) statusEl.textContent = \`In Base\`;
            }
          }
        }
      }`;

const newUpdateTurnUI = `      const DICE_FACES_UNICODE = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      for (let i = 0; i < 4; i++) {
        const card = document.getElementById(\`hud-p\${i}\`);
        const avatarEl = document.getElementById(\`hud-p\${i}-avatar\`);
        const nameEl = document.getElementById(\`hud-p\${i}-name\`);
        const flagEl = document.getElementById(\`hud-p\${i}-flag\`);
        const lvlEl = document.getElementById(\`hud-p\${i}-lvl\`);
        const miniDiceEl = document.getElementById(\`hud-mini-dice-\${i}\`);
        if (card) {
          if (!activeList.includes(i)) {
            card.style.display = 'none';
          } else {
            card.style.display = 'flex';
            if (i === gameState.activeTurn) card.classList.add('active-turn');
            else card.classList.remove('active-turn');
            
            const isThisHuman = (gameState.mode === GAME_MODES.LOCAL) ? (i === humanId) : (i === humanId);
            const pData = PLAYERS[i];
            if (flagEl) flagEl.textContent = pData.flag;
            if (lvlEl) lvlEl.textContent = pData.lvl;
            
            if (isThisHuman) {
              if (nameEl) nameEl.textContent = user.name || pData.name;
              if (avatarEl) {
                if (user.photoURL && (user.photoURL.startsWith('http') || user.photoURL.startsWith('data:image'))) {
                  avatarEl.innerHTML = \`<img src="\${user.photoURL}" alt="Avatar" />\`;
                } else {
                  avatarEl.innerHTML = PLAYER_AVATARS_SVG[i];
                }
              }
            } else {
              if (nameEl) nameEl.textContent = pData.name;
              if (avatarEl) avatarEl.innerHTML = PLAYER_AVATARS_SVG[i];
            }
            if (miniDiceEl) {
              if (i === gameState.activeTurn && gameState.diceValue > 0) {
                miniDiceEl.textContent = DICE_FACES_UNICODE[gameState.diceValue] || '🎲';
              } else {
                miniDiceEl.textContent = '🎲';
              }
            }
          }
        }
      }`;

html = html.replace(oldUpdateTurnUI, newUpdateTurnUI);
console.log('updateTurnUI updated with authentic card elements');

// =========================================================================
// 6. JAVASCRIPT: LUDO KING IN-GAME CHAT IMPLEMENTATION & EVENT HOOKS
// =========================================================================
const ludoChatLogic = `
    // =========================================================================
    // AUTHENTIC LUDO KING IN-GAME CHAT CONTROLLER
    // =========================================================================
    let ludoChatSpeakingPlayer = 0;
    const ludoChatMessagesHistory = [
      { senderIdx: 2, name: 'Rashmi Sharma', text: 'I am Ludo King!' },
      { senderIdx: 0, name: 'Gautam Shinde', text: 'All the best!' },
      { senderIdx: 3, name: 'Bakulbhai Baricha', text: 'Today is My Day!' },
      { senderIdx: 1, name: 'John Marshal', text: "I am the winner of this game!!! you can't beat me." }
    ];

    function renderLudoChatFeed() {
      const feed = document.getElementById('ludo-chat-feed');
      if (!feed) return;
      feed.innerHTML = '';
      ludoChatMessagesHistory.forEach(msg => {
        const row = document.createElement('div');
        row.className = \`ludo-msg-banner p\${msg.senderIdx}\`;
        row.innerHTML = \`
          <div class="ludo-msg-avatar">
            \${PLAYER_AVATARS_SVG[msg.senderIdx] || '🎩'}
          </div>
          <div class="ludo-msg-info">
            <div class="ludo-msg-sender">\${msg.name}</div>
            <div class="ludo-msg-text">\${msg.text}</div>
          </div>
        \`;
        feed.appendChild(row);
      });
      feed.scrollTop = feed.scrollHeight;
    }

    function renderLudoChatAsChips() {
      const chipsBox = document.getElementById('ludo-chat-as-chips');
      if (!chipsBox) return;
      chipsBox.innerHTML = '';
      const activeList = getActivePlayers();
      activeList.forEach(pIdx => {
        const p = PLAYERS[pIdx];
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = \`ludo-chat-chip \${pIdx === ludoChatSpeakingPlayer ? 'active' : ''}\`;
        chip.textContent = p.name;
        chip.addEventListener('click', () => {
          ludoChatSpeakingPlayer = pIdx;
          renderLudoChatAsChips();
        });
        chipsBox.appendChild(chip);
      });
    }

    function openLudoChat() {
      const modal = document.getElementById('modal-ludo-chat');
      if (!modal) return;
      renderLudoChatAsChips();
      renderLudoChatFeed();
      modal.classList.add('active');
      const unread = document.getElementById('chat-floating-unread');
      if (unread) unread.style.display = 'none';
      setTimeout(() => {
        document.getElementById('ludo-chat-input')?.focus();
      }, 100);
    }

    function closeLudoChat() {
      document.getElementById('modal-ludo-chat')?.classList.remove('active');
    }

    function sendLudoChatMessage(text) {
      if (!text || !text.trim()) return;
      const cleanText = text.trim();
      const pIdx = ludoChatSpeakingPlayer;
      const p = PLAYERS[pIdx] || PLAYERS[0];
      const senderName = (pIdx === 0 && user.name) ? user.name : p.name;

      // Add to chat history
      ludoChatMessagesHistory.push({
        senderIdx: pIdx,
        name: senderName,
        text: cleanText
      });
      renderLudoChatFeed();

      // Trigger board bubble and ticker sound
      triggerChatBubble(pIdx, cleanText, false);

      // Online Multiplayer Sync
      if (gameState.roomId && rtdb && fbModules?.ref && fbModules?.push) {
        try {
          const roomChatRef = fbModules.ref(rtdb, \`rooms/\${gameState.roomId}/chat\`);
          fbModules.push(roomChatRef, {
            sender: senderName,
            playerIndex: pIdx,
            text: cleanText,
            timestamp: Date.now()
          });
        } catch(e) {
          console.warn('[Chat] Firebase sync error', e);
        }
      } else {
        // Smart Bot Reaction
        handleBotChatReaction(cleanText, pIdx);
      }
    }

    // Attach chat listeners
    document.getElementById('btn-floating-chat-bubble')?.addEventListener('click', openLudoChat);
    document.getElementById('btn-open-game-chat')?.addEventListener('click', openLudoChat);
    document.getElementById('btn-close-ludo-chat')?.addEventListener('click', closeLudoChat);

    document.getElementById('btn-chat-preset-toggle')?.addEventListener('click', () => {
      const panel = document.getElementById('ludo-preset-panel');
      if (panel) {
        panel.style.display = (panel.style.display === 'none') ? 'block' : 'none';
      }
    });

    document.getElementById('tab-preset-phrases')?.addEventListener('click', () => {
      document.getElementById('preset-phrases-content').style.display = 'grid';
      document.getElementById('preset-emojis-content').style.display = 'none';
      document.getElementById('tab-preset-phrases').classList.add('active');
      document.getElementById('tab-preset-emojis').classList.remove('active');
    });

    document.getElementById('tab-preset-emojis')?.addEventListener('click', () => {
      document.getElementById('preset-phrases-content').style.display = 'none';
      document.getElementById('preset-emojis-content').style.display = 'grid';
      document.getElementById('tab-preset-emojis').classList.add('active');
      document.getElementById('tab-preset-phrases').classList.remove('active');
    });

    document.querySelectorAll('.preset-phrase-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const phrase = btn.getAttribute('data-phrase');
        if (phrase) {
          sendLudoChatMessage(phrase);
          document.getElementById('ludo-preset-panel').style.display = 'none';
        }
      });
    });

    document.querySelectorAll('.preset-emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.getAttribute('data-emoji');
        if (emoji) {
          sendLudoChatMessage(emoji);
          document.getElementById('ludo-preset-panel').style.display = 'none';
        }
      });
    });

    const triggerLudoChatInputSend = () => {
      const input = document.getElementById('ludo-chat-input');
      if (!input) return;
      const val = input.value;
      if (val && val.trim()) {
        sendLudoChatMessage(val);
        input.value = '';
      }
    };

    document.getElementById('btn-chat-send-msg')?.addEventListener('click', triggerLudoChatInputSend);
    document.getElementById('ludo-chat-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') triggerLudoChatInputSend();
    });

    // Smart Bot Match Start Greeting (Matches Ludo King screenshot)
    function triggerBotGreetingOnGameStart() {
      setTimeout(() => {
        if (!gameState.gameOver && gameState.mode === GAME_MODES.VS_AI) {
          const p1 = PLAYERS[1];
          ludoChatMessagesHistory.push({
            senderIdx: 1,
            name: p1.name,
            text: 'All the best!'
          });
          triggerChatBubble(1, 'All the best!', false);
          renderLudoChatFeed();
        }
      }, 1500);
    }
`;

// Insert the chat logic before window.watchRewardedAdForCoins
html = html.replace('window.watchRewardedAdForCoins = function(tier)', ludoChatLogic + '\n    window.watchRewardedAdForCoins = function(tier)');
console.log('Ludo King Chat Controller JS added');

// =========================================================================
// 7. JAVASCRIPT: STRICT CAPPED REWARDED VIDEO (Max 3/day, 10-min cooldown)
// =========================================================================
const cappedAdMobLogic = `
    // =========================================================================
    // PROFESSIONAL CAPPED REWARDED AD SYSTEM (Max 3 claims per day, 10m cooldown)
    // =========================================================================
    const MAX_DAILY_REWARDED_ADS = 3;
    const REWARD_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

    function getTodayDateStr() {
      return new Date().toISOString().slice(0, 10);
    }

    function getDailyAdCount() {
      const savedDate = localStorage.getItem('ls_reward_date');
      const today = getTodayDateStr();
      if (savedDate !== today) {
        localStorage.setItem('ls_reward_date', today);
        localStorage.setItem('ls_daily_ad_count', '0');
        return 0;
      }
      return parseInt(localStorage.getItem('ls_daily_ad_count') || '0', 10);
    }

    function updateRewardedAdUIStatus() {
      const count = getDailyAdCount();
      const badge = document.getElementById('ad-daily-badge');
      const sub = document.getElementById('ad-reward-status-sub');
      const btn = document.getElementById('btn-claim-rewarded-video');
      const btnText = document.getElementById('ad-btn-text');
      const lastTs = parseInt(localStorage.getItem('ls_last_reward_ts') || '0', 10);
      const diff = Date.now() - lastTs;

      if (badge) badge.textContent = \`\${count} / \${MAX_DAILY_REWARDED_ADS} TODAY\`;
      
      if (count >= MAX_DAILY_REWARDED_ADS) {
        if (btn) {
          btn.disabled = true;
          btn.style.opacity = '0.6';
          btn.style.cursor = 'not-allowed';
        }
        if (btnText) btnText.textContent = 'Daily Limit Reached (3/3)';
        if (sub) sub.textContent = 'Daily limit reached. Come back tomorrow for more free rewards!';
      } else if (lastTs > 0 && diff < REWARD_COOLDOWN_MS) {
        const leftSecs = Math.ceil((REWARD_COOLDOWN_MS - diff) / 1000);
        const mins = Math.floor(leftSecs / 60);
        const secs = leftSecs % 60;
        if (btn) {
          btn.disabled = true;
          btn.style.opacity = '0.7';
          btn.style.cursor = 'not-allowed';
        }
        if (btnText) btnText.textContent = \`⏱️ Next Video in \${mins}m \${secs}s\`;
        if (sub) sub.textContent = \`Claim \${count + 1} of 3 ready after cooldown.\`;
      } else {
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
        }
        if (btnText) btnText.textContent = 'Watch Video (+500 Coins)';
        if (sub) sub.textContent = \`Ready! Claim bonus (\${count}/\${MAX_DAILY_REWARDED_ADS} watched today).\`;
      }
    }

    window.watchOfficialRewardedAd = function() {
      const count = getDailyAdCount();
      if (count >= MAX_DAILY_REWARDED_ADS) {
        showToast('🚫 Daily limit reached (3/3). Come back tomorrow!');
        return;
      }
      const lastTs = parseInt(localStorage.getItem('ls_last_reward_ts') || '0', 10);
      const diff = Date.now() - lastTs;
      if (lastTs > 0 && diff < REWARD_COOLDOWN_MS) {
        const mins = Math.ceil((REWARD_COOLDOWN_MS - diff) / 60000);
        showToast(\`⏱️ Cooldown active: Next video available in \${mins} min!\`);
        return;
      }

      pendingRewardCallback = () => {
        const newCount = getDailyAdCount() + 1;
        localStorage.setItem('ls_daily_ad_count', newCount.toString());
        localStorage.setItem('ls_last_reward_ts', Date.now().toString());
        user.addCoins(500);
        user.save();
        updateRewardedAdUIStatus();
        showToast(\`🎉 +500 Coins Added! (\${newCount}/\${MAX_DAILY_REWARDED_ADS} claimed today)\`);
      };

      if (window.AndroidBridge && typeof window.AndroidBridge.showRewardedAd === 'function') {
        try {
          window.AndroidBridge.showRewardedAd('long', 500, 15);
          return;
        } catch (e) {
          console.warn('[AdBridge] fallback', e);
        }
      }
      window.startAdCountdownUI('long', 500, 15, 'Google AdMob');
    };
`;

html = html.replace('// Global rewarded ad handler with native TV / Mobile routing', cappedAdMobLogic + '\n    // Global rewarded ad handler with native TV / Mobile routing');

// Hook triggerBotGreetingOnGameStart into startGame
html = html.replace('initRoomChatListener();', 'initRoomChatListener();\n      triggerBotGreetingOnGameStart();');

// Also update updateRewardedAdUIStatus when opening shop
html = html.replace("document.getElementById('modal-shop')?.classList.add('active');", "document.getElementById('modal-shop')?.classList.add('active'); updateRewardedAdUIStatus();");

fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Updated app/src/main/assets/index.html and index.html successfully');
