const fs = require('fs');

const indexHtmlPath = 'index.html';
let html = fs.readFileSync(indexHtmlPath, 'utf8');

console.log('Original index.html length:', html.length);

// =========================================================================
// FIX 1: Pre-splash screen dismissal reliably displays Login System modal
// =========================================================================
const oldPreSplashDismiss = `        setTimeout(function() {
          if (splash) {
            splash.style.display = 'none';
            if (splash.parentNode) {
              splash.parentNode.removeChild(splash);
            }
          }
          // Automatically prompt Login / Guest Play Modal after Pre-Splash
          setTimeout(function() {
            if (typeof window.openAuthModal === 'function') {
              window.openAuthModal();
            } else {
              const mAuth = document.getElementById('modal-auth');
              if (mAuth) mAuth.classList.add('active');
            }
          }, 150);
        }, 200);`;

const newPreSplashDismiss = `        setTimeout(function() {
          if (splash) {
            splash.style.display = 'none';
            if (splash.parentNode) {
              splash.parentNode.removeChild(splash);
            }
          }
          // Automatically prompt Login / Guest Play Modal immediately after Pre-Splash
          function triggerAuthModal() {
            if (typeof window.openAuthModal === 'function') {
              window.openAuthModal();
            } else {
              const mAuth = document.getElementById('modal-auth');
              if (mAuth) {
                mAuth.classList.add('active');
                mAuth.style.display = 'flex';
              }
            }
          }
          triggerAuthModal();
          setTimeout(triggerAuthModal, 200);
          setTimeout(triggerAuthModal, 500);
        }, 200);`;

if (html.includes(oldPreSplashDismiss)) {
  html = html.replace(oldPreSplashDismiss, newPreSplashDismiss);
  console.log('Fix 1 applied: Pre-splash dismissal now immediately shows login system');
} else {
  // Let's do a substring search for robust replacement
  const targetComment = '// Automatically prompt Login / Guest Play Modal after Pre-Splash';
  const cIdx = html.indexOf(targetComment);
  if (cIdx !== -1) {
    const startIdx = html.lastIndexOf('setTimeout(function() {', cIdx);
    const endIdx = html.indexOf('}, 200);', cIdx) + 8;
    const chunk = html.substring(startIdx, endIdx);
    html = html.replace(chunk, newPreSplashDismiss);
    console.log('Fix 1 applied via robust chunk search');
  } else {
    console.warn('Fix 1 warning: target comment not found');
  }
}

// =========================================================================
// FIX 2 & 4: Login system prominently displays BIG Guest Mode button at top
// =========================================================================
const targetTabSelect = '<!-- Tab Selection: Clean & Professional -->';
const heroGuestButtonHtml = `<!-- PROMINENT HERO GUEST BUTTON (Fast Instant Play For Vs Bot & Local) -->
        <button type="button" class="action-btn gold" id="btn-auth-guest-hero" style="width:100%; margin-bottom:14px; padding:16px 14px; font-size:15px; font-weight:900; letter-spacing:0.4px; border-radius:14px; box-shadow:0 6px 20px rgba(245,158,11,0.5); display:flex; align-items:center; justify-content:space-between; cursor:pointer; background:linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); color:#fff; border:2px solid #fbbf24;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:26px;">🎮</span>
            <div style="text-align:left;">
              <div style="font-size:15px; font-weight:900; line-height:1.2;">PLAY AS GUEST (OFFLINE / VS BOT)</div>
              <div style="font-size:11px; opacity:0.95; font-weight:600; margin-top:2px; color:#fef3c7;">Play instantly with Smart Bot or Pass 'N Play — No Login Required!</div>
            </div>
          </div>
          <span style="font-size:20px; font-weight:900; color:#fff;">➔</span>
        </button>

        <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
          <div style="flex:1; height:1px; background:rgba(255,255,255,0.15);"></div>
          <span style="font-size:10.5px; color:#94a3b8; font-weight:800; letter-spacing:0.5px;">OR SIGN IN FOR ONLINE & CLOUD SYNC</span>
          <div style="flex:1; height:1px; background:rgba(255,255,255,0.15);"></div>
        </div>

        <!-- Tab Selection: Clean & Professional -->`;

if (html.includes(targetTabSelect) && !html.includes('id="btn-auth-guest-hero"')) {
  html = html.replace(targetTabSelect, heroGuestButtonHtml);
  console.log('Fix 2 & 4 applied: BIG Guest Mode hero button added to modal-auth');
}

// Also in modal-auth section-auth-social: enlarge existing btn-auth-guest
const oldSmallGuestBtn = `<button class="auth-btn auth-guest" id="btn-auth-guest">
              <span>👤</span> Play as Instant Guest (Offline Mode)
            </button>`;
const newSmallGuestBtn = `<button class="auth-btn auth-guest action-btn gold" id="btn-auth-guest" style="width:100%; padding:14px; font-size:14px; font-weight:900; border-radius:12px; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; border:2px solid #fbbf24; cursor:pointer;">
              <span style="font-size:20px; margin-right:8px;">🎮</span> PLAY AS INSTANT GUEST (OFFLINE MODE)
            </button>`;
if (html.includes(oldSmallGuestBtn)) {
  html = html.replace(oldSmallGuestBtn, newSmallGuestBtn);
  console.log('Fix 4 applied: Small guest button in 3rd tab also enlarged');
}

// =========================================================================
// FIX 3: Remove confusing duplicate "Start Match" / "Start Game" double button
// =========================================================================
// In modal-match-config: change button text to uniform "🚀 START GAME"
const oldStartMatchBtn = `<button type="button" class="action-btn gold" id="btn-start-game-match" style="width:100%; margin-top:14px; padding:15px; font-size:16px; font-weight:900; letter-spacing:0.5px; box-shadow:0 6px 20px rgba(245,158,11,0.5); border-radius:14px; cursor:pointer;">🚀 START MATCH</button>`;
const newStartMatchBtn = `<button type="button" class="action-btn gold" id="btn-start-game-match" style="width:100%; margin-top:14px; padding:15px; font-size:16px; font-weight:900; letter-spacing:0.5px; box-shadow:0 6px 20px rgba(245,158,11,0.5); border-radius:14px; cursor:pointer;">🚀 START GAME</button>`;
if (html.includes(oldStartMatchBtn)) {
  html = html.replace(oldStartMatchBtn, newStartMatchBtn);
  console.log('Fix 3 applied: modal-match-config button changed to 🚀 START GAME');
}

// Remove redundant btn-start-game-match-top listener
const oldDuplicateListener = `document.getElementById('btn-start-game-match')?.addEventListener('click', handleStartMatchAction);
    document.getElementById('btn-start-game-match-top')?.addEventListener('click', handleStartMatchAction);`;
const newSingleListener = `document.getElementById('btn-start-game-match')?.addEventListener('click', handleStartMatchAction);`;
if (html.includes(oldDuplicateListener)) {
  html = html.replace(oldDuplicateListener, newSingleListener);
  console.log('Fix 3 applied: removed redundant top button listener');
}

// =========================================================================
// FIX 5: All 12 Themes actually work and dynamically transform 3D board
// =========================================================================
// Replace createAuthenticLudoBoardTexture to accept themeId and use THEME_PALETTES
const oldTextureFnStart = `function createAuthenticLudoBoardTexture() {
      const canvas = document.createElement('canvas');
      const size = 3072; // Ultra HD 3K crisp texture for pristine sharp lines
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const cell = size / 15; // 204.8px per cell

      // Fill board background with clean pure white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Super saturated, vibrant, intense, punchy colors ("Teez Rang")
      const cRed = '#e60026';
      const cRedDark = '#b3001e';
      const cRedLight = '#ff1a40';
      const cBlue = '#0055ff';
      const cBlueDark = '#003db3';
      const cBlueLight = '#2673ff';
      const cYellow = '#ffb300';
      const cYellowDark = '#cc8f00';
      const cYellowLight = '#ffc426';
      const cGreen = '#00b33c';
      const cGreenDark = '#00802b';
      const cGreenLight = '#1ac752';`;

const newTextureFnStart = `function createAuthenticLudoBoardTexture(themeId = 'ludoKing') {
      const p = THEME_PALETTES[themeId] || THEME_PALETTES['ludoKing'] || THEME_PALETTES.classic;
      const canvas = document.createElement('canvas');
      const size = 3072; // Ultra HD 3K crisp texture for pristine sharp lines
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const cell = size / 15; // 204.8px per cell

      // Fill board background with theme's authentic boardBase color
      ctx.fillStyle = p.boardBase || '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Super saturated, vibrant, theme-tuned colors
      const cRed = p.red || '#e60026';
      const cRedDark = p.redDark || '#b3001e';
      const cRedLight = p.redLight || '#ff1a40';
      const cBlue = p.blue || '#0055ff';
      const cBlueDark = p.blueDark || '#003db3';
      const cBlueLight = p.blueLight || '#2673ff';
      const cYellow = p.yellow || '#ffb300';
      const cYellowDark = p.yellowDark || '#cc8f00';
      const cYellowLight = p.yellowLight || '#ffc426';
      const cGreen = p.green || '#00b33c';
      const cGreenDark = p.greenDark || '#00802b';
      const cGreenLight = p.greenLight || '#1ac752';

      const trackFill = p.trackFill || '#ffffff';
      const trackBorder = p.trackBorder || '#0a0f1d';
      const starFill = p.starFill || '#ffd700';
      const starStroke = p.starStroke || '#0a0f1d';
      const centerCrown = p.centerCrown || '#ffd700';`;

if (html.includes(oldTextureFnStart)) {
  html = html.replace(oldTextureFnStart, newTextureFnStart);
  console.log('Fix 5 applied: createAuthenticLudoBoardTexture accepts themeId and loads theme palette');
}

// In drawYard inside createAuthenticLudoBoardTexture:
const oldYardWhiteCenter = `ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(ix + r, iy);`;

const newYardThemeCenter = `ctx.fillStyle = (themeId === 'ticnoDark' || themeId === 'neonGlow' || themeId === 'space' || themeId === 'cyberpunk' || themeId === 'pakistan') ? p.trackFill : '#ffffff';
        ctx.beginPath();
        ctx.moveTo(ix + r, iy);`;

if (html.includes(oldYardWhiteCenter)) {
  html = html.replace(oldYardWhiteCenter, newYardThemeCenter);
  console.log('Fix 5 applied: yard center styled according to theme');
}

// Replace applyTheme(themeId)
const oldApplyTheme = `function applyTheme(themeId) {
      const theme = THEMES.find(t => t.id === themeId) || THEMES[1];
      scene.background.set(theme.bg);
      baseMat.color.set(theme.board);
      pointLight.color.set(theme.primary);
      document.documentElement.style.setProperty('--bg-color', theme.bg);
      document.documentElement.style.setProperty('--primary-color', theme.primary);
      user.activeTheme = themeId;
      user.save();
      showToast(\`Applied Theme: \${theme.name}\`);
    }`;

const newApplyTheme = `function applyTheme(themeId) {
      const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
      const p = THEME_PALETTES[theme.id] || THEME_PALETTES['ludoKing'] || THEME_PALETTES.classic;
      user.activeTheme = theme.id;
      user.save();

      // 1. Scene Background & Lights
      if (typeof scene !== 'undefined' && scene) {
        scene.background = new THREE.Color(p.bg || theme.bg);
      }
      if (typeof pointLight !== 'undefined' && pointLight) {
        pointLight.color.set(theme.primary);
      }

      // 2. 3D Outer Wooden Base & Gold Frame Chamfer
      if (typeof borderMat !== 'undefined' && borderMat && p.borderWood) {
        borderMat.color.setHex(p.borderWood);
      }
      if (typeof goldFrameMat !== 'undefined' && goldFrameMat && p.goldFrame) {
        goldFrameMat.color.setHex(p.goldFrame);
      }

      // 3. Recreate and Update 3D Board Surface Texture for the Theme!
      if (typeof boardSurfaceMat !== 'undefined' && boardSurfaceMat) {
        const oldMap = boardSurfaceMat.map;
        boardSurfaceMat.map = createAuthenticLudoBoardTexture(theme.id);
        boardSurfaceMat.map.needsUpdate = true;
        boardSurfaceMat.needsUpdate = true;
        if (oldMap && typeof oldMap.dispose === 'function') {
          oldMap.dispose();
        }
      }

      // 4. Update Menu Background & CSS Theme Properties
      if (p.menuBg) {
        const menuScreen = document.getElementById('menu-screen');
        if (menuScreen) menuScreen.style.background = p.menuBg;
      }
      document.documentElement.style.setProperty('--bg-color', p.bg || theme.bg);
      document.documentElement.style.setProperty('--primary-color', theme.primary);
      document.documentElement.style.setProperty('--gold-color', theme.accent || '#ffd700');

      showToast(\`🎨 Theme Applied: \${theme.name}\`);
    }`;

if (html.includes(oldApplyTheme)) {
  html = html.replace(oldApplyTheme, newApplyTheme);
  console.log('Fix 5 applied: applyTheme now regenerates 3D board texture and all materials!');
}

// In openAuthModal & event wiring: expose window.openAuthModal and wire btn-auth-guest-hero
const oldOpenAuthModal = `    function openAuthModal() {
      document.getElementById('modal-auth')?.classList.add('active');
    }`;

const newOpenAuthModal = `    function openAuthModal() {
      const m = document.getElementById('modal-auth');
      if (m) {
        m.classList.add('active');
        m.style.display = 'flex';
      }
    }
    window.openAuthModal = openAuthModal;`;

if (html.includes(oldOpenAuthModal)) {
  html = html.replace(oldOpenAuthModal, newOpenAuthModal);
  console.log('Attached window.openAuthModal');
}

// Wire up hero guest button click
const guestHeroWire = `    const handleGuestHeroPlay = () => {
      localStorage.setItem('ls_login_completed', 'true');
      if (user.name.startsWith('Guest_') || user.name === 'Guest Player') {
        user.name = 'Player_' + Math.floor(Math.random() * 9000 + 1000);
      }
      user.save();
      user.updateHeaderUI();
      closeAllModals();
      sounds.playClick();
      showToast('🎮 Playing in Guest Mode (' + user.name + ')');
    };
    document.getElementById('btn-auth-guest-hero')?.addEventListener('click', handleGuestHeroPlay);`;

if (!html.includes('btn-auth-guest-hero')?.addEventListener) {
  html = html.replace(
    `document.getElementById('btn-auth-guest')?.addEventListener('click', async () => {`,
    `${guestHeroWire}\n    document.getElementById('btn-auth-guest')?.addEventListener('click', async () => {`
  );
  console.log('Wired click event for btn-auth-guest-hero');
}

// Automatic first-session prompt for modal-auth at end of script
const endScriptMarker = `// =========================================================================\n    // 14. AUTHENTIC PRE-SPLASH SCREEN LIFECYCLE`;
const autoPromptCode = `// Prompt Login / Guest Play modal on launch after pre-splash
    setTimeout(() => {
      if (!sessionStorage.getItem('ludo_welcomed_session')) {
        sessionStorage.setItem('ludo_welcomed_session', 'true');
        openAuthModal();
      }
    }, 450);\n    `;

if (html.includes(endScriptMarker) && !html.includes('ludo_welcomed_session')) {
  html = html.replace(endScriptMarker, autoPromptCode + endScriptMarker);
  console.log('Added auto-prompt for modal-auth');
}

// Write to index.html and app/src/main/assets/index.html
fs.writeFileSync('index.html', html, 'utf8');
fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
console.log('Successfully written updated index.html to both root and assets!');
