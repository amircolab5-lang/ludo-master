const fs = require('fs');
let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');

console.log('Original length:', html.length);

// 1. ADD CSS FOR HD PLAYER CARDS, BUBBLES, AND CHAT FAB
const cssBlock = `
    /* =========================================================================
       AUTHENTIC LUDO KING CONSOLE PLAYER CARDS, HD AVATARS & IN-GAME CHAT
       ========================================================================= */
    .players-container {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 20;
    }
    .hud-player-card {
      position: absolute;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 16, 32, 0.98) 100%);
      border: 2.5px solid rgba(255, 255, 255, 0.25);
      border-radius: 18px;
      padding: 6px 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(12px);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      width: 132px;
      box-sizing: border-box;
    }
    .hud-player-card.active-turn {
      border-color: #fbbf24 !important;
      box-shadow: 0 0 24px rgba(251, 191, 36, 0.8), 0 0 10px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.6) !important;
      transform: scale(1.05);
      background: linear-gradient(180deg, rgba(30, 41, 69, 0.98) 0%, rgba(15, 26, 48, 1) 100%) !important;
    }
    .hud-player-card.p0 {
      bottom: 125px;
      left: 10px;
      border-color: #ef4444;
    }
    .hud-player-card.p1 {
      top: 60px;
      left: 10px;
      border-color: #10b981;
    }
    .hud-player-card.p2 {
      top: 60px;
      right: 10px;
      border-color: #f59e0b;
    }
    .hud-player-card.p3 {
      bottom: 125px;
      right: 10px;
      border-color: #3b82f6;
    }
    @media (orientation: landscape) {
      .hud-player-card.p0 { bottom: 20px; left: 16px; }
      .hud-player-card.p1 { top: 16px; left: 16px; }
      .hud-player-card.p2 { top: 16px; right: 16px; }
      .hud-player-card.p3 { bottom: 20px; right: 16px; }
    }
    .hud-card-main {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .hud-avatar-wrapper {
      position: relative;
      width: 44px;
      height: 44px;
      flex-shrink: 0;
    }
    .hud-p-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.3);
      box-shadow: inset 0 0 6px rgba(0,0,0,0.6);
    }
    .hd-avatar-svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .hud-p-flag {
      position: absolute;
      bottom: -2px;
      right: -2px;
      font-size: 13px;
      line-height: 1;
      filter: drop-shadow(0 2px 3px rgba(0,0,0,0.7));
    }
    .hud-p-lvl {
      position: absolute;
      top: -4px;
      right: -4px;
      background: linear-gradient(135deg, #fbbf24, #d97706);
      color: #000;
      font-size: 8px;
      font-weight: 900;
      padding: 1px 4px;
      border-radius: 6px;
      border: 1px solid #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .hud-p-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .hud-p-name-row {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .hud-p-name {
      font-size: 12px;
      font-weight: 800;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 58px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    }
    .hud-you-tag {
      background: #ef4444;
      color: #fff;
      font-size: 8px;
      font-weight: 900;
      padding: 1px 4px;
      border-radius: 4px;
    }
    .hud-bot-tag {
      background: rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      font-size: 8px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 4px;
    }
    .hud-p-status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .hud-p-status {
      font-size: 9.5px;
      color: #94a3b8;
      font-weight: 600;
      white-space: nowrap;
    }
    .hud-mini-dice {
      font-size: 12px;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
    }

    /* SPEECH BUBBLE (High Contrast & Clear Pointer Tails) */
    .hud-chat-bubble {
      position: absolute;
      display: none;
      background: #ffffff;
      color: #0f172a;
      font-size: 12.5px;
      font-weight: 800;
      padding: 7px 12px;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.4);
      border: 2px solid #fbbf24;
      white-space: nowrap;
      z-index: 100;
      pointer-events: none;
      animation: chatBubblePop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
      max-width: 170px;
      text-align: center;
    }
    @keyframes chatBubblePop {
      0% { transform: scale(0.4); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .p0 .hud-chat-bubble {
      bottom: calc(100% + 10px);
      left: 6px;
    }
    .p0 .hud-chat-bubble::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 18px;
      border-width: 8px 8px 0;
      border-style: solid;
      border-color: #ffffff transparent;
      display: block;
      width: 0;
    }
    .p1 .hud-chat-bubble {
      top: calc(100% + 10px);
      left: 6px;
    }
    .p1 .hud-chat-bubble::after {
      content: '';
      position: absolute;
      top: -8px;
      left: 18px;
      border-width: 0 8px 8px;
      border-style: solid;
      border-color: #ffffff transparent;
      display: block;
      width: 0;
    }
    .p2 .hud-chat-bubble {
      top: calc(100% + 10px);
      right: 6px;
    }
    .p2 .hud-chat-bubble::after {
      content: '';
      position: absolute;
      top: -8px;
      right: 18px;
      border-width: 0 8px 8px;
      border-style: solid;
      border-color: #ffffff transparent;
      display: block;
      width: 0;
    }
    .p3 .hud-chat-bubble {
      bottom: calc(100% + 10px);
      right: 6px;
    }
    .p3 .hud-chat-bubble::after {
      content: '';
      position: absolute;
      bottom: -8px;
      right: 18px;
      border-width: 8px 8px 0;
      border-style: solid;
      border-color: #ffffff transparent;
      display: block;
      width: 0;
    }

    /* FLOATING IN-GAME CHAT FAB (Prominent, Always Visible) */
    .hud-chat-fab {
      position: absolute;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: 2px solid #fbbf24;
      border-radius: 24px;
      padding: 6px 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #ffffff;
      font-weight: 800;
      font-size: 12px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.6), 0 0 14px rgba(16, 185, 129, 0.4);
      cursor: pointer;
      pointer-events: auto;
      z-index: 45;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .hud-chat-fab:active {
      transform: translateX(-50%) scale(0.92);
    }
    .hud-chat-fab-icon {
      font-size: 15px;
    }
    .hud-chat-unread-badge {
      background: #ef4444;
      color: #fff;
      font-size: 9px;
      font-weight: 900;
      border-radius: 10px;
      padding: 1px 5px;
      margin-left: 2px;
      border: 1px solid #fff;
    }
    @media (orientation: landscape) {
      .hud-chat-fab {
        top: auto;
        bottom: 22px;
        left: 50%;
        transform: translateX(-50%);
      }
      .hud-chat-fab:active {
        transform: translateX(-50%) scale(0.92);
      }
    }

    /* LUDO KING CHAT MODAL DIALOG STYLES */
    .ludo-chat-dialog {
      width: 92vw;
      max-width: 380px;
      max-height: 84vh;
      max-height: 84dvh;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 16, 32, 0.99) 100%);
      border: 2.5px solid #fbbf24;
      border-radius: 22px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(251, 191, 36, 0.35);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-sizing: border-box;
    }
    .ludo-chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: linear-gradient(90deg, rgba(30, 41, 69, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
      border-bottom: 1.5px solid rgba(251, 191, 36, 0.3);
    }
    .ludo-chat-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ludo-chat-title {
      font-size: 14px;
      font-weight: 900;
      color: #fbbf24;
      letter-spacing: 0.5px;
    }
    .ludo-chat-online-badge {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
      color: #6ee7b7;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 10px;
    }
    .ludo-chat-close-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #94a3b8;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 900;
    }
    .ludo-chat-tabs {
      display: flex;
      background: rgba(0,0,0,0.3);
      padding: 4px;
      gap: 4px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .ludo-tab-btn {
      flex: 1;
      padding: 8px 4px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: #94a3b8;
      font-size: 11.5px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ludo-tab-btn.active {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
    }
    .ludo-tab-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      max-height: 280px;
    }
    .preset-phrases-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .preset-phrase-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 10px 8px;
      color: #ffffff;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s;
    }
    .preset-phrase-btn:active {
      background: rgba(251, 191, 36, 0.25);
      border-color: #fbbf24;
      transform: scale(0.96);
    }
    .preset-emojis-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
    }
    .preset-emoji-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      font-size: 26px;
      padding: 8px 0;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .preset-emoji-btn:active {
      background: rgba(251, 191, 36, 0.3);
      border-color: #fbbf24;
      transform: scale(1.15);
    }
    .ludo-chat-input-bar {
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      background: rgba(10, 16, 32, 0.95);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .ludo-chat-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 8px 12px;
      color: #fff;
      font-size: 12.5px;
      outline: none;
    }
    .ludo-chat-input:focus {
      border-color: #fbbf24;
      background: rgba(255, 255, 255, 0.12);
    }
    .ludo-chat-send-btn {
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      color: #fff;
      font-weight: 800;
      font-size: 12px;
      padding: 8px 14px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .ludo-chat-msg-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      align-items: flex-start;
    }
    .ludo-chat-msg-avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }
    .ludo-chat-msg-body {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 6px 10px;
      max-width: 82%;
    }
    .ludo-chat-msg-author {
      font-size: 10px;
      font-weight: 800;
      color: #fbbf24;
      margin-bottom: 2px;
    }
    .ludo-chat-msg-text {
      font-size: 12px;
      color: #ffffff;
      font-weight: 600;
    }
`;

html = html.replace('</style>', cssBlock + '\n</style>');
console.log('CSS block injected');

fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
