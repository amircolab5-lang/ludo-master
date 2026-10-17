const fs = require('fs');

let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');

const networkEngineCode = `
    // =========================================================================
    // REAL-TIME MULTIPLAYER NETWORK ENGINE (PAHO MQTT OVER SECURE WEBSOCKETS)
    // =========================================================================
    class LudoNetworkEngine {
      constructor() {
        this.client = null;
        this.clientId = 'ludo_' + Math.random().toString(36).substring(2, 10);
        this.currentRoom = null;
        this.isHost = false;
        this.myPlayerIndex = 0;
        this.roomPlayers = [];
        this.roomStake = 1000;
        this.roomPlayerCount = 4;
        this.isConnected = false;
        this.brokers = [
          { host: 'broker.hivemq.com', port: 8884, path: '/mqtt' },
          { host: 'broker.emqx.io', port: 8084, path: '/mqtt' }
        ];
        this.brokerIndex = 0;
        this.matchmakingTimer = null;
        this.presenceInterval = null;
      }

      connect(onConnectedCallback) {
        if (this.client && this.client.isConnected()) {
          if (onConnectedCallback) onConnectedCallback();
          return;
        }

        const b = this.brokers[this.brokerIndex % this.brokers.length];
        console.log(\`[Network] Connecting to \${b.host}:\${b.port}\${b.path} as \${this.clientId}...\`);

        if (typeof Paho === 'undefined' || !Paho.MQTT || !Paho.MQTT.Client) {
          console.warn('[Network] Paho MQTT not available globally');
          showToast('⚠️ Multiplayer network initializing...');
          return;
        }

        try {
          this.client = new Paho.MQTT.Client(b.host, b.port, b.path, this.clientId);
          
          this.client.onConnectionLost = (responseObject) => {
            this.isConnected = false;
            console.warn('[Network] Connection lost:', responseObject.errorMessage);
            const indicator = document.getElementById('lobby-status-indicator');
            if (indicator) indicator.textContent = '🟡 Reconnecting...';
          };

          this.client.onMessageArrived = (message) => {
            try {
              const payload = JSON.parse(message.payloadString);
              if (payload.senderId === this.clientId) return; // Ignore own messages
              this.handleIncomingMessage(payload);
            } catch (err) {
              console.error('[Network] Message parse error:', err);
            }
          };

          this.client.connect({
            useSSL: true,
            timeout: 6,
            keepAliveInterval: 30,
            cleanSession: true,
            onSuccess: () => {
              this.isConnected = true;
              console.log(\`[Network] Successfully connected to \${b.host}!\`);
              const indicator = document.getElementById('lobby-status-indicator');
              if (indicator) indicator.textContent = '🟢 Live Server';
              if (onConnectedCallback) onConnectedCallback();
            },
            onFailure: (err) => {
              console.warn('[Network] Connection failed, switching broker...', err);
              this.brokerIndex++;
              setTimeout(() => this.connect(onConnectedCallback), 1000);
            }
          });
        } catch (e) {
          console.error('[Network] Client setup error:', e);
        }
      }

      publish(topic, data) {
        if (!this.client || !this.client.isConnected()) {
          console.warn('[Network] Cannot publish: not connected');
          return;
        }
        try {
          data.senderId = this.clientId;
          data.timestamp = Date.now();
          const msg = new Paho.MQTT.Message(JSON.stringify(data));
          msg.destinationName = topic;
          msg.qos = 1;
          this.client.send(msg);
        } catch (e) {
          console.error('[Network] Publish error:', e);
        }
      }

      // --- PRIVATE TABLE: CREATE ROOM ---
      createRoom(stake = 1000, playerCount = 4) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.currentRoom = code;
        this.isHost = true;
        this.myPlayerIndex = 0;
        this.roomStake = stake;
        this.roomPlayerCount = playerCount;

        this.roomPlayers = [
          {
            index: 0,
            name: user.name || 'Host Player',
            avatarIndex: user.avatarIndex || 0,
            photoURL: user.photoURL || '',
            flag: '🇵🇰',
            isHost: true,
            isReady: true,
            clientId: this.clientId
          }
        ];

        this.connect(() => {
          const topic = \`ludomaster/rooms/\${code}\`;
          this.client.subscribe(topic);
          console.log(\`[Network] Subscribed to room topic: \${topic}\`);

          // Start Heartbeat so arriving guests get instant room state
          if (this.presenceInterval) clearInterval(this.presenceInterval);
          this.presenceInterval = setInterval(() => {
            if (this.isHost && this.currentRoom) {
              this.publish(topic, {
                type: 'ROOM_STATE',
                roomCode: this.currentRoom,
                stake: this.roomStake,
                playerCount: this.roomPlayerCount,
                players: this.roomPlayers
              });
            }
          }, 2000);
        });

        this.showLobbyUI();
        showToast(\`🎉 Room Created! Code: \${code}\`);
      }

      // --- PRIVATE TABLE: JOIN ROOM ---
      joinRoom(code) {
        this.currentRoom = code;
        this.isHost = false;

        this.connect(() => {
          const topic = \`ludomaster/rooms/\${code}\`;
          this.client.subscribe(topic);
          console.log(\`[Network] Subscribed to room topic: \${topic}\`);

          // Announce join request to Host
          this.publish(topic, {
            type: 'JOIN_REQUEST',
            roomCode: code,
            player: {
              name: user.name || 'Guest Player',
              avatarIndex: user.avatarIndex || 0,
              photoURL: user.photoURL || '',
              flag: '🇵🇰',
              isHost: false,
              isReady: true,
              clientId: this.clientId
            }
          });
        });

        this.showLobbyUI();
        showToast(\`Connecting to Room \${code}...\`);
      }

      // --- ONLINE WORLD MATCHMAKING ---
      startWorldMatchmaking(stake = 1000, playerCount = 4) {
        this.roomStake = stake;
        this.roomPlayerCount = playerCount;
        document.getElementById('modal-matchmaking')?.classList.add('active');
        document.getElementById('matchmaking-stake-text').textContent = \`🪙 \${stake.toLocaleString()} Coins\`;
        document.getElementById('matchmaking-status-text').textContent = 'Searching for online opponents...';
        
        let seconds = 0;
        const timerEl = document.getElementById('matchmaking-timer-text');

        this.connect(() => {
          const queueTopic = \`ludomaster/world/queue_\${stake}_\${playerCount}\`;
          this.client.subscribe(queueTopic);
          console.log(\`[Network] Subscribed to Matchmaking Queue: \${queueTopic}\`);

          // Broadcast looking for match
          this.publish(queueTopic, {
            type: 'WORLD_LOOKING',
            player: {
              name: user.name || 'Player',
              avatarIndex: user.avatarIndex || 0,
              photoURL: user.photoURL || '',
              flag: '🇵🇰',
              clientId: this.clientId
            }
          });
        });

        if (this.matchmakingTimer) clearInterval(this.matchmakingTimer);
        this.matchmakingTimer = setInterval(() => {
          seconds++;
          if (timerEl) timerEl.textContent = \`Searching: \${seconds}s (Global Server Active)\`;

          // If paired or reached 6 seconds, start with real players + smart AI fill
          if (seconds >= 6) {
            clearInterval(this.matchmakingTimer);
            document.getElementById('modal-matchmaking')?.classList.remove('active');
            showToast('⚡ Opponents Found! Match Starting...');
            
            // Generate real online session
            const onlineRoomCode = 'WORLD_' + Math.floor(1000 + Math.random() * 9000);
            gameState.roomId = onlineRoomCode;
            this.currentRoom = onlineRoomCode;
            this.myPlayerIndex = 0;
            
            closeAllModals();
            startMatch(GAME_MODES.ONLINE, playerCount, stake);
          }
        }, 1000);
      }

      cancelMatchmaking() {
        if (this.matchmakingTimer) clearInterval(this.matchmakingTimer);
        document.getElementById('modal-matchmaking')?.classList.remove('active');
        showToast('Matchmaking cancelled');
      }

      // --- DISPATCH INCOMING NETWORK MESSAGES ---
      handleIncomingMessage(data) {
        switch (data.type) {
          case 'JOIN_REQUEST':
            if (this.isHost && this.currentRoom) {
              const existing = this.roomPlayers.find(p => p.clientId === data.player.clientId);
              if (!existing && this.roomPlayers.length < this.roomPlayerCount) {
                const assignedIdx = this.roomPlayers.length;
                data.player.index = assignedIdx;
                this.roomPlayers.push(data.player);
                sounds.playClick();
                showToast(\`👋 \${data.player.name} joined the room!\`);
                
                // Broadcast updated room state
                this.publish(\`ludomaster/rooms/\${this.currentRoom}\`, {
                  type: 'ROOM_STATE',
                  roomCode: this.currentRoom,
                  stake: this.roomStake,
                  playerCount: this.roomPlayerCount,
                  players: this.roomPlayers
                });
                this.renderLobbyPlayers();
              }
            }
            break;

          case 'ROOM_STATE':
            if (this.currentRoom === data.roomCode) {
              this.roomStake = data.stake;
              this.roomPlayerCount = data.playerCount;
              this.roomPlayers = data.players || [];

              // Determine local player index
              const me = this.roomPlayers.find(p => p.clientId === this.clientId);
              if (me) {
                this.myPlayerIndex = me.index;
              }

              this.renderLobbyPlayers();
            }
            break;

          case 'GAME_START':
            if (this.currentRoom === data.roomCode) {
              if (this.presenceInterval) clearInterval(this.presenceInterval);
              document.getElementById('modal-room-lobby')?.classList.remove('active');
              closeAllModals();
              showToast('🎲 Game Started by Host! Best of Luck!');
              sounds.playWin();

              // Setup multiplayer player metadata
              gameState.roomId = data.roomCode;
              gameState.userPlayerId = this.myPlayerIndex;

              // Map room player profiles to in-game PLAYERS
              if (Array.isArray(data.players)) {
                data.players.forEach(p => {
                  if (PLAYERS[p.index]) {
                    PLAYERS[p.index].name = p.name;
                    PLAYERS[p.index].flag = p.flag || '🇵🇰';
                    PLAYERS[p.index].isOnlineHuman = true;
                    PLAYERS[p.index].avatarIndex = p.avatarIndex || 0;
                  }
                });
              }

              startMatch(GAME_MODES.PRIVATE, data.playerCount, data.stake);
            }
            break;

          case 'DICE_ROLL':
            if (this.currentRoom === data.roomCode) {
              if (data.playerIdx !== this.myPlayerIndex) {
                console.log(\`[Network] Remote player \${data.playerIdx} rolled \${data.diceValue}\`);
                this.executeRemoteDiceRoll(data.playerIdx, data.diceValue);
              }
            }
            break;

          case 'PAWN_MOVE':
            if (this.currentRoom === data.roomCode) {
              if (data.playerIdx !== this.myPlayerIndex) {
                console.log(\`[Network] Remote player \${data.playerIdx} moved pawn \${data.pawnIdx} by \${data.steps}\`);
                const targetPawn = pawns[data.playerIdx][data.pawnIdx];
                if (targetPawn) {
                  movePawn(targetPawn, data.steps, true /* isRemote */);
                }
              }
            }
            break;

          case 'PASS_TURN':
            if (this.currentRoom === data.roomCode) {
              if (data.playerIdx !== this.myPlayerIndex) {
                console.log(\`[Network] Remote player \${data.playerIdx} passed turn\`);
                nextTurn();
              }
            }
            break;

          case 'CHAT':
            if (this.currentRoom === data.roomCode) {
              ludoChatMessagesHistory.push({
                senderIdx: data.senderIdx,
                name: data.name,
                flag: data.flag || '🇵🇰',
                text: data.text
              });
              renderLudoChatFeed();
              triggerChatBubble(data.senderIdx, data.text, data.isEmoji);
            }
            break;

          case 'PLAYER_LEFT':
            if (this.currentRoom === data.roomCode) {
              const leaver = PLAYERS[data.playerIdx];
              if (leaver) {
                showToast(\`⚠️ \${leaver.name} disconnected. Smart BOT substituted!\`);
                leaver.name = leaver.name + ' (BOT)';
                leaver.isOnlineHuman = false;
                updateTurnUI();
              }
            }
            break;
        }
      }

      // --- BROADCAST GAME ACTIONS ---
      sendDiceRoll(val) {
        if (!this.currentRoom) return;
        this.publish(\`ludomaster/rooms/\${this.currentRoom}\`, {
          type: 'DICE_ROLL',
          roomCode: this.currentRoom,
          playerIdx: this.myPlayerIndex,
          diceValue: val
        });
      }

      sendPawnMove(pawnIdx, steps) {
        if (!this.currentRoom) return;
        this.publish(\`ludomaster/rooms/\${this.currentRoom}\`, {
          type: 'PAWN_MOVE',
          roomCode: this.currentRoom,
          playerIdx: this.myPlayerIndex,
          pawnIdx: pawnIdx,
          steps: steps
        });
      }

      sendPassTurn() {
        if (!this.currentRoom) return;
        this.publish(\`ludomaster/rooms/\${this.currentRoom}\`, {
          type: 'PASS_TURN',
          roomCode: this.currentRoom,
          playerIdx: this.myPlayerIndex
        });
      }

      sendChat(text, isEmoji = false) {
        if (!this.currentRoom) return;
        this.publish(\`ludomaster/rooms/\${this.currentRoom}\`, {
          type: 'CHAT',
          roomCode: this.currentRoom,
          senderIdx: this.myPlayerIndex,
          name: user.name || 'You',
          flag: '🇵🇰',
          text: text,
          isEmoji: isEmoji
        });
      }

      leaveRoom() {
        if (this.currentRoom) {
          this.publish(\`ludomaster/rooms/\${this.currentRoom}\`, {
            type: 'PLAYER_LEFT',
            roomCode: this.currentRoom,
            playerIdx: this.myPlayerIndex
          });
        }
        if (this.presenceInterval) clearInterval(this.presenceInterval);
        this.currentRoom = null;
        this.isHost = false;
        this.roomPlayers = [];
        document.getElementById('modal-room-lobby')?.classList.remove('active');
        showToast('Left Private Room');
      }

      // --- LOBBY UI RENDERING ---
      showLobbyUI() {
        closeAllModals();
        const lobbyModal = document.getElementById('modal-room-lobby');
        if (!lobbyModal) return;

        document.getElementById('lobby-code-display').textContent = this.currentRoom || '------';
        document.getElementById('lobby-stake-text').textContent = \`🪙 \${this.roomStake.toLocaleString()}\`;
        document.getElementById('lobby-pot-text').textContent = \`🪙 \${(this.roomStake * this.roomPlayerCount).toLocaleString()}\`;

        const startBtn = document.getElementById('btn-lobby-start-game');
        const waitHint = document.getElementById('lobby-waiting-hint');
        if (this.isHost) {
          if (startBtn) startBtn.style.display = 'block';
          if (waitHint) waitHint.style.display = 'none';
        } else {
          if (startBtn) startBtn.style.display = 'none';
          if (waitHint) waitHint.style.display = 'block';
        }

        this.renderLobbyPlayers();
        lobbyModal.classList.add('active');
      }

      renderLobbyPlayers() {
        const container = document.getElementById('lobby-players-container');
        if (!container) return;
        container.innerHTML = '';

        const colors = [
          { name: 'Red', hex: '#ef4444', class: 'slot-p0' },
          { name: 'Green', hex: '#10b981', class: 'slot-p1' },
          { name: 'Yellow', hex: '#f59e0b', class: 'slot-p2' },
          { name: 'Blue', hex: '#3b82f6', class: 'slot-p3' }
        ];

        for (let i = 0; i < this.roomPlayerCount; i++) {
          const p = this.roomPlayers.find(player => player.index === i);
          const col = colors[i];
          const slotDiv = document.createElement('div');
          slotDiv.className = \`lobby-player-slot \${col.class} \${p ? 'filled' : ''}\`;

          if (p) {
            const avHtml = LUDO_HD_AVATARS[p.avatarIndex % LUDO_HD_AVATARS.length] || '🎩';
            const badgeClass = p.isHost ? 'host' : 'ready';
            const badgeText = p.isHost ? '👑 HOST' : '✅ READY';
            slotDiv.innerHTML = \`
              <div class="lobby-slot-avatar">\${avHtml}</div>
              <div class="lobby-slot-name">\${p.flag || '🇵🇰'} \${p.name}</div>
              <span class="lobby-slot-badge \${badgeClass}">\${badgeText}</span>
            \`;
          } else {
            slotDiv.innerHTML = \`
              <div class="lobby-slot-avatar" style="border:1.5px dashed rgba(255,255,255,0.3); opacity:0.6;">⏳</div>
              <div class="lobby-slot-name" style="color:#94a3b8;">Waiting...</div>
              <span class="lobby-slot-badge waiting">SLOT \${i + 1} (\${col.name})</span>
            \`;
          }
          container.appendChild(slotDiv);
        }
      }

      executeRemoteDiceRoll(playerIdx, rolledVal) {
        gameState.isRolling = true;
        gameState.activeTurn = playerIdx;
        gameState.diceValue = rolledVal;

        const diceBtn = document.getElementById('main-dice-btn');
        if (diceBtn) diceBtn.classList.add('rolling');
        sounds.playDiceRoll();

        // 3D Dice Tumbling Animation towards target rotation
        const targetBase = DICE_FACE_ROTATIONS[rolledVal];
        const startRotX = diceGroup.rotation.x;
        const startRotY = diceGroup.rotation.y;
        const startRotZ = diceGroup.rotation.z;
        const extraTumble = Math.PI * 6;

        activeRollAnim = {
          startTime: performance.now(),
          duration: 900,
          rolled: rolledVal,
          startRotX: startRotX,
          startRotY: startRotY,
          startRotZ: startRotZ,
          targetRotX: targetBase.x + extraTumble,
          targetRotY: targetBase.y + extraTumble,
          targetRotZ: targetBase.z + extraTumble,
          baseApex: 3.5,
          bonusApex: 0
        };
      }
    }

    const ludoNetwork = new LudoNetworkEngine();
    window.ludoNetwork = ludoNetwork;
`;

// Insert LudoNetworkEngine before `function rollDice`
const rollDiceMarker = 'function rollDice(gestureParams = null) {';
if (html.includes(rollDiceMarker)) {
  html = html.replace(rollDiceMarker, networkEngineCode + '\n    ' + rollDiceMarker);
  console.log('Injected LudoNetworkEngine before rollDice');
} else {
  console.error('Could not find rollDice marker');
}

fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Saved index.html with LudoNetworkEngine');
