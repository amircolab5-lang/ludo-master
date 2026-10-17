const fs = require('fs');

let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');
console.log('Original length:', html.length);

// =========================================================================
// 1. FIX JAVASCRIPT SYNTAX & DUPLICATE DECLARATIONS
// =========================================================================

// Fix duplicate elDrawerAvatar declaration in updateHeaderUI
html = html.replace(
  /const elDrawerAvatar = document\.getElementById\('drawer-avatar'\);\s*if \(elDrawerName\)[\s\S]*?if \(elDrawerAvatar\) elDrawerAvatar\.textContent = elAvatar \? elAvatar\.textContent : '🎩';/,
  `if (elDrawerName) elDrawerName.textContent = this.name;\n        if (elDrawerStatus) elDrawerStatus.textContent = this.isGuest ? 'Guest Mode' : 'Verified Player';`
);

// Fix unescaped single quotes
html = html.replace("reply = '😅 Don't worry!';", 'reply = "😅 Don\'t worry!";');
html = html.replace("'Let's see who wins! 🏆'", '"Let\'s see who wins! 🏆"');

// Fix duplicate triggerChatBubble
html = html.replace(
  /function triggerChatBubble\(playerIndex, text, isEmoji = false\) \{[\s\S]*?showLiveChatTicker\(p\.name, p\.hexStr, text, isEmoji\);\s*\}/,
  '// Primary triggerChatBubble handles this'
);

// Fix duplicate handleBotChatReaction
html = html.replace(
  /function handleBotChatReaction\(playerText, senderIdx = 0\) \{[\s\S]*?triggerChatBubble\(randomBot, reply, isEmoji\);\s*\}\s*\}, 1000 \+ Math\.random\(\) \* 1200\);\s*\}/,
  '// Primary handleBotChatReaction handles this'
);

// =========================================================================
// 2. ENHANCE TICNO DEVELOPERS LOGO (Make "DEVELOPERS" huge, bold, crystal clear)
// =========================================================================

// Tighten viewBox from "0 0 960 360" to "70 85 710 280" in both SVGs
html = html.replace(
  'id="ticnoLogoSvg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 960 360"',
  'id="ticnoLogoSvg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="70 85 710 280"'
);

html = html.replace(
  'id="ticnoLogoAboutSvg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 960 360"',
  'id="ticnoLogoAboutSvg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="70 85 710 280"'
);

// Style classes for TICNO and DEVELOPERS
html = html.replace(
  /\.ticno-text-main\s*\{[\s\S]*?\}/,
  `.ticno-text-main {
    font-family: 'Montserrat', 'Orbitron', 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 900;
    font-size: 64px;
    letter-spacing: 5px;
    text-transform: uppercase;
  }`
);

html = html.replace(
  /\.ticno-text-sub\s*\{[\s\S]*?\}/,
  `.ticno-text-sub {
    font-family: 'Montserrat', 'Orbitron', 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 900;
    font-size: 34px;
    letter-spacing: 6px;
    text-transform: uppercase;
    paint-order: stroke fill;
  }`
);

html = html.replace(
  /\.ticno-about-main\s*\{[\s\S]*?\}/,
  `.ticno-about-main {
    font-family: 'Montserrat', 'Orbitron', 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 900;
    font-size: 64px;
    letter-spacing: 5px;
    text-transform: uppercase;
  }`
);

html = html.replace(
  /\.ticno-about-sub\s*\{[\s\S]*?\}/,
  `.ticno-about-sub {
    font-family: 'Montserrat', 'Orbitron', 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 900;
    font-size: 34px;
    letter-spacing: 6px;
    text-transform: uppercase;
    paint-order: stroke fill;
  }`
);

// High-contrast text markup in both SVGs
const oldSvgTextPre = `<text x="0" y="202" class="ticno-text-main" fill="url(#purpleTextGradient)">TICNO</text>
   <text x="4" y="260" class="ticno-text-sub" fill="#38bdf8" stroke="#000000" stroke-width="0.8">DEVELOPERS</text>`;

const newSvgTextPre = `<text x="0" y="202" class="ticno-text-main" fill="url(#purpleTextGradient)" filter="drop-shadow(0 4px 10px rgba(138,28,232,0.5))">TICNO</text>
   <text x="2" y="262" class="ticno-text-sub" fill="#38bdf8" stroke="#080e1a" stroke-width="2.5" filter="drop-shadow(0 3px 8px rgba(56,189,248,0.7))">DEVELOPERS</text>`;

html = html.replace(oldSvgTextPre, newSvgTextPre);

const oldSvgTextAbout = `<text x="0" y="202" class="ticno-about-main" fill="url(#purpleTextGradientAbout)">TICNO</text>
   <text x="4" y="260" class="ticno-about-sub" fill="#38bdf8" stroke="#000000" stroke-width="0.8">DEVELOPERS</text>`;

const newSvgTextAbout = `<text x="0" y="202" class="ticno-about-main" fill="url(#purpleTextGradientAbout)" filter="drop-shadow(0 4px 10px rgba(138,28,232,0.5))">TICNO</text>
   <text x="2" y="262" class="ticno-about-sub" fill="#38bdf8" stroke="#080e1a" stroke-width="2.5" filter="drop-shadow(0 3px 8px rgba(56,189,248,0.7))">DEVELOPERS</text>`;

html = html.replace(oldSvgTextAbout, newSvgTextAbout);

// =========================================================================
// 3. ZERO-OVERLAP GAME SCREEN LAYOUT (Portrait and Landscape)
// =========================================================================

// Ensure Three.js camera is always centered without offset in landscape
html = html.replace(
  /if \(isLandscape\) \{\s*\/\/ Shift camera view offset[\s\S]*?camera\.setViewOffset\(w, h, offsetX, 0, w, h\);\s*\} else \{\s*camera\.clearViewOffset\(\);\s*\}/,
  `camera.clearViewOffset();`
);

// Replace cleanLayoutCss with perfect non-overlapping responsive layout
const perfectLayoutCss = `
    /* =========================================================================
       PERFECT ZERO-OVERLAP LUDO KING GAME SCREEN HUD LAYOUT
       ========================================================================= */
    /* Hide obsolete overlays */
    .board-nav-hud,
    .board-gesture-hint,
    .dice-gesture-hint,
    #dice-nudge-float-badge,
    .dice-gesture-overlay {
      display: none !important;
    }

    /* Game HUD Root Container - Always full screen, no right sidebar */
    #game-hud,
    body.tv-landscape-mode #game-hud {
      position: absolute !important;
      inset: 0 !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
      pointer-events: none !important;
      z-index: 20 !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
    }

    /* Top HUD Bar */
    .game-hud-top-bar,
    body.tv-landscape-mode .game-hud-top-bar {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      height: 44px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 0 10px !important;
      background: linear-gradient(180deg, rgba(8, 14, 28, 0.96) 0%, rgba(8, 14, 28, 0.6) 85%, transparent 100%) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      z-index: 40 !important;
      pointer-events: auto !important;
      box-sizing: border-box !important;
    }
    .leave-game-btn {
      padding: 4px 10px !important;
      font-size: 11px !important;
      font-weight: 800 !important;
      height: 28px !important;
      border-radius: 10px !important;
      background: rgba(239, 68, 68, 0.2) !important;
      border: 1px solid rgba(239, 68, 68, 0.5) !important;
      color: #fca5a5 !important;
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
    }
    .top-stats-pill {
      height: 26px !important;
      padding: 2px 8px !important;
      font-size: 11px !important;
      border-radius: 13px !important;
      background: rgba(15, 23, 42, 0.85) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
    .hud-top-actions {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }
    .hud-action-btn {
      height: 28px !important;
      padding: 3px 8px !important;
      border-radius: 8px !important;
      background: rgba(255, 255, 255, 0.1) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      color: #fff !important;
      font-size: 11px !important;
      font-weight: 800 !important;
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
    }

    /* Players Container */
    .players-container,
    body.tv-landscape-mode .players-container {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none !important;
      z-index: 25 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* 4 Corner Player Console Cards */
    .hud-player-card,
    body.tv-landscape-mode .hud-player-card {
      position: absolute !important;
      pointer-events: auto !important;
      display: flex !important;
      flex-direction: column !important;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 16, 32, 0.98) 100%) !important;
      border: 2px solid rgba(255, 255, 255, 0.25) !important;
      border-radius: 14px !important;
      padding: 4px 6px !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.2) !important;
      backdrop-filter: blur(10px) !important;
      width: 112px !important;
      box-sizing: border-box !important;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s !important;
    }
    .hud-player-card.active-turn,
    body.tv-landscape-mode .hud-player-card.active-turn {
      border-color: #fbbf24 !important;
      box-shadow: 0 0 18px rgba(251, 191, 36, 0.8), 0 0 6px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.6) !important;
      transform: scale(1.04) !important;
      background: linear-gradient(180deg, rgba(30, 41, 69, 0.98) 0%, rgba(15, 26, 48, 1) 100%) !important;
    }

    /* Positions in Portrait */
    .hud-player-card.p1,
    body.tv-landscape-mode .hud-player-card.p1 {
      top: 50px !important;
      left: 8px !important;
      bottom: auto !important;
      right: auto !important;
      border-color: #10b981 !important;
    }
    .hud-player-card.p2,
    body.tv-landscape-mode .hud-player-card.p2 {
      top: 50px !important;
      right: 8px !important;
      bottom: auto !important;
      left: auto !important;
      border-color: #f59e0b !important;
    }
    .hud-player-card.p0,
    body.tv-landscape-mode .hud-player-card.p0 {
      bottom: 12px !important;
      left: 8px !important;
      top: auto !important;
      right: auto !important;
      border-color: #ef4444 !important;
    }
    .hud-player-card.p3,
    body.tv-landscape-mode .hud-player-card.p3 {
      bottom: 12px !important;
      right: 8px !important;
      top: auto !important;
      left: auto !important;
      border-color: #3b82f6 !important;
    }

    /* Positions in Landscape Mode */
    @media (orientation: landscape) {
      .hud-player-card.p1 { top: 48px !important; left: 14px !important; }
      .hud-player-card.p2 { top: 48px !important; right: 14px !important; }
      .hud-player-card.p0 { bottom: 12px !important; left: 14px !important; }
      .hud-player-card.p3 { bottom: 12px !important; right: 14px !important; }
    }

    /* Card Details */
    .hud-card-main {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }
    .hud-avatar-wrapper {
      position: relative !important;
      width: 36px !important;
      height: 36px !important;
      flex-shrink: 0 !important;
    }
    .hud-p-avatar {
      width: 36px !important;
      height: 36px !important;
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
      font-size: 7px !important;
      font-weight: 900 !important;
      padding: 1px 3px !important;
      border-radius: 3px !important;
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
      font-size: 10.5px !important;
      font-weight: 800 !important;
      color: #ffffff !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 48px !important;
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
      font-size: 8px !important;
      color: #94a3b8 !important;
      font-weight: 600 !important;
      white-space: nowrap !important;
    }
    .hud-mini-dice {
      font-size: 10px !important;
    }

    /* Floating Live Chat Button - Vertically Centered on Right Screen Edge */
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
      width: 42px !important;
      height: 42px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      color: #ffffff !important;
      font-weight: 900 !important;
      box-shadow: 0 6px 20px rgba(0,0,0,0.6), 0 0 12px rgba(16, 185, 129, 0.5) !important;
      cursor: pointer !important;
      pointer-events: auto !important;
      z-index: 45 !important;
      transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }
    .hud-chat-fab:active {
      transform: translateY(-50%) scale(0.92) !important;
    }
    .hud-chat-fab-icon {
      font-size: 16px !important;
      line-height: 1 !important;
    }
    .hud-chat-fab-text {
      font-size: 7.5px !important;
      letter-spacing: 0.5px !important;
      font-weight: 900 !important;
    }
    .hud-chat-unread-badge {
      position: absolute !important;
      top: -2px !important;
      right: -2px !important;
      background: #ef4444 !important;
      color: #fff !important;
      font-size: 8px !important;
      font-weight: 900 !important;
      border-radius: 8px !important;
      padding: 1px 4px !important;
      border: 1px solid #fff !important;
    }

    /* Bottom In-Game Roll Controls: Centered between P0 and P3 WITHOUT OVERLAP */
    .game-bottom-controls,
    body.tv-landscape-mode .game-bottom-controls {
      position: absolute !important;
      bottom: 8px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 3px !important;
      z-index: 35 !important;
      pointer-events: auto !important;
      width: auto !important;
      box-sizing: border-box !important;
    }

    /* Turn Banner: Sleek, compact pill above the dice */
    .turn-banner,
    body.tv-landscape-mode .turn-banner {
      background: linear-gradient(135deg, rgba(16, 26, 46, 0.95) 0%, rgba(8, 14, 28, 0.95) 100%) !important;
      border: 1.5px solid rgba(251, 191, 36, 0.4) !important;
      padding: 3px 10px !important;
      border-radius: 12px !important;
      font-size: 10px !important;
      font-weight: 800 !important;
      color: #fbbf24 !important;
      text-align: center !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
      white-space: nowrap !important;
      max-width: 170px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    .dice-action-area {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
    }

    /* 56px Dice Button sits cleanly in center without touching P0 or P3 */
    .dice-btn {
      width: 56px !important;
      height: 56px !important;
      border-radius: 16px !important;
      background: linear-gradient(145deg, #2a3a54 0%, #131c2c 100%) !important;
      border: 2.5px solid #fbbf24 !important;
      box-shadow: 0 6px 18px rgba(0,0,0,0.7), 0 0 14px rgba(255,215,0,0.3) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      position: relative !important;
    }
    .dice-face-display {
      font-size: 28px !important;
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
      gap: 4px !important;
      margin-top: 1px !important;
    }
    .booster-btn {
      padding: 2px 7px !important;
      font-size: 9px !important;
      border-radius: 8px !important;
      font-weight: 800 !important;
    }

    /* Speech Bubbles positioned cleanly above/below cards with pointer arrow */
    .hud-chat-bubble {
      position: absolute !important;
      background: #ffffff !important;
      color: #0f172a !important;
      border: 2px solid #fbbf24 !important;
      border-radius: 12px !important;
      padding: 4px 8px !important;
      font-size: 11px !important;
      font-weight: 800 !important;
      white-space: nowrap !important;
      max-width: 130px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6) !important;
      z-index: 50 !important;
      display: none;
      animation: popInBubble 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
    }
    @keyframes popInBubble {
      0% { opacity: 0; transform: scale(0.6); }
      100% { opacity: 1; transform: scale(1); }
    }
    .hud-chat-bubble.is-emoji {
      font-size: 24px !important;
      padding: 2px 6px !important;
      background: rgba(15, 23, 42, 0.92) !important;
      border-color: #38bdf8 !important;
    }
    .p0 .hud-chat-bubble {
      bottom: calc(100% + 8px) !important;
      left: 6px !important;
    }
    .p0 .hud-chat-bubble::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 16px;
      border-width: 6px 6px 0;
      border-style: solid;
      border-color: #fbbf24 transparent transparent;
    }
    .p3 .hud-chat-bubble {
      bottom: calc(100% + 8px) !important;
      right: 6px !important;
      left: auto !important;
    }
    .p3 .hud-chat-bubble::after {
      content: '';
      position: absolute;
      bottom: -6px;
      right: 16px;
      border-width: 6px 6px 0;
      border-style: solid;
      border-color: #fbbf24 transparent transparent;
    }
    .p1 .hud-chat-bubble {
      top: calc(100% + 8px) !important;
      left: 6px !important;
      bottom: auto !important;
    }
    .p1 .hud-chat-bubble::after {
      content: '';
      position: absolute;
      top: -6px;
      left: 16px;
      border-width: 0 6px 6px;
      border-style: solid;
      border-color: transparent transparent #fbbf24;
    }
    .p2 .hud-chat-bubble {
      top: calc(100% + 8px) !important;
      right: 6px !important;
      bottom: auto !important;
      left: auto !important;
    }
    .p2 .hud-chat-bubble::after {
      content: '';
      position: absolute;
      top: -6px;
      right: 16px;
      border-width: 0 6px 6px;
      border-style: solid;
      border-color: transparent transparent #fbbf24;
    }
`;

// Replace old cleanLayoutCss with perfectLayoutCss
const cleanLayoutMarker = '/* =========================================================================\n       AUTHORITATIVE NON-OVERLAPPING LUDO GAME SCREEN CONSOLE LAYOUT';
const cleanLayoutEndMarker = '</style>';

if (html.includes(cleanLayoutMarker)) {
  const startIdx = html.indexOf(cleanLayoutMarker);
  const endIdx = html.indexOf('</style>', startIdx);
  html = html.substring(0, startIdx) + perfectLayoutCss.trim() + '\n' + html.substring(endIdx);
  console.log('Replaced previous cleanLayoutCss with perfectLayoutCss');
} else {
  html = html.replace('</style>', perfectLayoutCss + '\n</style>');
  console.log('Appended perfectLayoutCss');
}

// Write back to both files
fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Both index.html files updated successfully! New length:', html.length);
