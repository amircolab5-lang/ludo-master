const fs = require('fs');

let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');

const oldPrivateModalStart = '<!-- MODAL: Private Table -->';
const matchConfigStart = '<!-- MODAL: Matchmaking / Stakes Selection -->';

const pIdx = html.indexOf(oldPrivateModalStart);
const mIdx = html.indexOf(matchConfigStart);

if (pIdx !== -1 && mIdx !== -1) {
  const newModals = `<!-- MODAL: Private Table (Create / Join Room) -->
    <div class="modal-overlay" id="modal-private-table">
      <div class="modal-sheet">
        <div class="modal-header">
          <div class="modal-title"><span>🔑</span> Private Table</div>
          <button class="modal-close-btn" data-close="modal-private-table">✕</button>
        </div>
        
        <!-- Tabs: Create vs Join -->
        <div class="private-tabs">
          <button class="private-tab-btn active" id="tab-btn-create-room">CREATE ROOM</button>
          <button class="private-tab-btn" id="tab-btn-join-room">JOIN ROOM</button>
        </div>

        <!-- Panel 1: Create Room -->
        <div id="panel-create-room" style="display:block;">
          <label style="font-size:11.5px; color:var(--text-muted); font-weight:700;">PLAYERS COUNT</label>
          <div style="display:flex; gap:8px; margin:6px 0 12px 0;">
            <button type="button" class="action-btn" id="priv-cfg-p2" style="background:#1e293b; flex:1; padding:8px;">2 Players</button>
            <button type="button" class="action-btn" id="priv-cfg-p4" style="background:var(--primary-color); flex:1; padding:8px;">4 Players</button>
          </div>

          <label style="font-size:11.5px; color:var(--text-muted); font-weight:700;">ENTRY STAKE (Winner Takes 90% Pot)</label>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin:6px 0 14px 0;">
            <button type="button" class="action-btn priv-stake-btn" data-stake="500" style="background:var(--primary-color); padding:8px 4px; font-size:12px;">🪙 500</button>
            <button type="button" class="action-btn priv-stake-btn" data-stake="1000" style="background:#1e293b; padding:8px 4px; font-size:12px;">🪙 1,000</button>
            <button type="button" class="action-btn priv-stake-btn" data-stake="2500" style="background:#1e293b; padding:8px 4px; font-size:12px;">🪙 2,500</button>
            <button type="button" class="action-btn priv-stake-btn" data-stake="5000" style="background:#1e293b; padding:8px 4px; font-size:12px;">🪙 5,000</button>
            <button type="button" class="action-btn priv-stake-btn" data-stake="10000" style="background:#1e293b; padding:8px 4px; font-size:12px;">🪙 10,000</button>
            <button type="button" class="action-btn priv-stake-btn" data-stake="25000" style="background:#1e293b; padding:8px 4px; font-size:12px;">🪙 25,000</button>
          </div>

          <button class="action-btn gold" id="btn-create-private-room" style="width:100%; padding:12px; font-size:13px; font-weight:900;">👑 Create Private Room</button>
        </div>

        <!-- Panel 2: Join Room -->
        <div id="panel-join-room" style="display:none;">
          <p style="font-size:11.5px; color:#cbd5e1; margin-bottom:10px;">Enter the 6-digit code shared by the host to join their live private match:</p>
          <div style="display:flex; gap:6px; margin-bottom:12px;">
            <input type="number" class="input-field" id="input-room-code" placeholder="Enter 6-digit code (e.g. 748921)" maxlength="6" style="font-size:16px; font-weight:800; letter-spacing:2px; text-align:center;" />
            <button class="action-btn" id="btn-paste-room-code" style="padding:0 14px; font-size:11px; white-space:nowrap; background:#334155;">📋 Paste</button>
          </div>
          <button class="action-btn" id="btn-join-private-room" style="width:100%; padding:12px; font-size:13px; font-weight:900; background:linear-gradient(135deg, #10b981, #059669); border-color:#34d399;">⚡ Join Room Now</button>
        </div>
      </div>
    </div>

    <!-- MODAL: Private Room Waiting Lobby -->
    <div class="modal-overlay" id="modal-room-lobby">
      <div class="modal-sheet" style="max-height:90vh; overflow-y:auto;">
        <div class="modal-header">
          <div class="modal-title"><span>👑</span> Private Room Lobby</div>
          <button class="modal-close-btn" id="btn-lobby-close">✕</button>
        </div>

        <!-- Huge Room Code Display -->
        <div class="room-code-display-card">
          <div class="room-code-label">SHARE THIS CODE WITH FRIENDS</div>
          <div class="room-code-number" id="lobby-code-display">748921</div>
          <div class="room-code-actions">
            <button class="room-action-btn" id="btn-copy-lobby-code">
              <span>📋</span> <span>Copy Code</span>
            </button>
            <button class="room-action-btn share" id="btn-share-lobby-code">
              <span>📤</span> <span>Share Code</span>
            </button>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:10px; margin-bottom:10px; font-size:11.5px;">
          <div><span style="color:#94a3b8;">Entry:</span> <strong style="color:#fbbf24;" id="lobby-stake-text">🪙 1,000</strong></div>
          <div style="height:14px; width:1px; background:rgba(255,255,255,0.2);"></div>
          <div><span style="color:#94a3b8;">Total Pot:</span> <strong style="color:#34d399;" id="lobby-pot-text">🪙 4,000</strong></div>
          <div style="height:14px; width:1px; background:rgba(255,255,255,0.2);"></div>
          <div style="color:#38bdf8; font-weight:800;" id="lobby-status-indicator">🟢 Live Server</div>
        </div>

        <!-- 4 Player Slots -->
        <div class="lobby-players-grid" id="lobby-players-container"></div>

        <!-- Host vs Guest Controls -->
        <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">
          <button class="action-btn gold" id="btn-lobby-start-game" style="padding:12px; font-size:13px; font-weight:900;">🚀 Start Game</button>
          <div id="lobby-waiting-hint" style="font-size:11px; color:#94a3b8; text-align:center; display:none;">
            ⏳ Waiting for host to launch the game...
          </div>
          <button class="action-btn" id="btn-lobby-leave" style="background:rgba(239,68,68,0.2); border-color:rgba(239,68,68,0.4); color:#fca5a5; padding:8px; font-size:11px;">Leave Table</button>
        </div>
      </div>
    </div>

    <!-- MODAL: Online World Matchmaking -->
    <div class="modal-overlay" id="modal-matchmaking">
      <div class="modal-sheet" style="text-align:center; padding:24px 16px;">
        <h3 style="color:#fff; font-size:16px; font-weight:900; margin-bottom:4px;">🌍 Online World Matchmaking</h3>
        <p style="font-size:11.5px; color:#94a3b8;" id="matchmaking-status-text">Searching for live players worldwide...</p>
        
        <div class="matchmaking-radar-box">
          <div class="radar-circle"></div>
          <div class="radar-circle"></div>
          <div class="radar-circle"></div>
          <div class="radar-center-globe">🌍</div>
        </div>

        <div style="background:rgba(15,23,42,0.85); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:10px; margin:12px 0;">
          <div style="font-size:11px; color:#94a3b8;">TABLE STAKE</div>
          <div style="font-size:15px; font-weight:900; color:#fbbf24;" id="matchmaking-stake-text">🪙 1,000 Coins</div>
          <div style="font-size:10px; color:#38bdf8; font-weight:800; margin-top:4px;" id="matchmaking-timer-text">Connecting to global lobby...</div>
        </div>

        <button class="action-btn" id="btn-cancel-matchmaking" style="background:rgba(239,68,68,0.2); border-color:rgba(239,68,68,0.5); color:#fca5a5; padding:8px 18px; font-size:11px; margin-top:8px;">Cancel Search</button>
      </div>
    </div>\n    `;

  html = html.substring(0, pIdx) + newModals + html.substring(mIdx);
  fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Successfully injected multiplayer modals into both index.html files!');
} else {
  console.error('Could not locate modal positions in index.html');
}
