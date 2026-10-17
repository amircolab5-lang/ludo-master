const fs = require('fs');

let html = fs.readFileSync('/tmp/test_update_stage1.html', 'utf8');

// Build the complete replacement for rollDice + runDicePhysicsRoll + onDiceRollFinished + isAiTurn
const updatedGameplayCode = `    // =========================================================================
    // 3D DICE ROLLING & PHYSICS SIMULATION (LOCAL & REMOTE SYNCHRONIZED)
    // =========================================================================
    function runDicePhysicsRoll(rolledVal, gestureOptions = {}, onComplete = null) {
      const targetBase = DICE_FACE_ROTATIONS[rolledVal];
      const startRotX = diceGroup.rotation.x;
      const startRotY = diceGroup.rotation.y;
      const startRotZ = diceGroup.rotation.z;

      const isFlick = !!gestureOptions.isFlick;
      const flickVelocity = gestureOptions.flickVelocity || 1.0;
      const spinTorque = gestureOptions.spinTorque || 0;
      const elevation = gestureOptions.elevation || 1.0;
      const wasLiftedHigh = !!gestureOptions.wasLiftedHigh;
      const isForceful = !!gestureOptions.isForceful;

      const spinMult = (isForceful || wasLiftedHigh) ? 2.8 : (isFlick ? 1.8 : 1.0);
      const extraTumbleX = Math.PI * (6 + Math.floor((flickVelocity * spinMult + Math.random() * 2) * 2) * 2);
      const extraTumbleY = Math.PI * (8 + Math.floor((Math.abs(spinTorque) * spinMult + flickVelocity * 2.0 + Math.random() * 2) * 2) * 2);
      const extraTumbleZ = Math.PI * (6 + Math.floor((flickVelocity * spinMult + Math.random() * 2) * 2) * 2);

      const targetRotX = targetBase.x + Math.round((startRotX + extraTumbleX - targetBase.x) / (Math.PI * 2)) * (Math.PI * 2);
      const targetRotY = targetBase.y + Math.round((startRotY + extraTumbleY - targetBase.y) / (Math.PI * 2)) * (Math.PI * 2);
      const targetRotZ = targetBase.z + Math.round((startRotZ + extraTumbleZ - targetBase.z) / (Math.PI * 2)) * (Math.PI * 2);

      const rollDuration = isFlick ? Math.max(900, Math.min(1450, Math.round(1000 * Math.sqrt(flickVelocity)))) : 950;
      const startTime = performance.now();
      const baseApex = 3.5 + (isForceful || wasLiftedHigh ? 5.8 : 2.5) * Math.max(0.8, Math.min(3.6, elevation * (isFlick ? 1.35 : 1.0)));

      activeRollAnim = {
        startTime: startTime,
        duration: rollDuration,
        rolled: rolledVal,
        startRotX: startRotX,
        startRotY: startRotY,
        startRotZ: startRotZ,
        targetRotX: targetRotX,
        targetRotY: targetRotY,
        targetRotZ: targetRotZ,
        extraSpinX: extraTumbleX,
        extraSpinY: extraTumbleY,
        extraSpinZ: extraTumbleZ,
        baseApex: baseApex,
        bonusApex: 0
      };

      const diceBtn = document.getElementById('main-dice-btn');
      if (diceBtn) diceBtn.classList.add('rolling');
      const actionText = document.getElementById('dice-action-text');
      if (actionText) actionText.textContent = 'NUDGE!';

      function stepRoll(now) {
        if (!activeRollAnim) return;
        const elapsed = now - activeRollAnim.startTime;
        const progress = Math.min(1.0, Math.max(0, elapsed / activeRollAnim.duration));
        const easeOut = 1 - Math.pow(1 - progress, 4);

        diceGroup.rotation.x = activeRollAnim.startRotX + (activeRollAnim.targetRotX - activeRollAnim.startRotX) * easeOut;
        diceGroup.rotation.y = activeRollAnim.startRotY + (activeRollAnim.targetRotY - activeRollAnim.startRotY) * easeOut;
        diceGroup.rotation.z = activeRollAnim.startRotZ + (activeRollAnim.targetRotZ - activeRollAnim.startRotZ) * easeOut;

        const apexHeight = activeRollAnim.baseApex + activeRollAnim.bonusApex;
        if (progress < 0.6) {
          const p1 = progress / 0.6;
          diceGroup.position.y = 3.5 + Math.sin(p1 * Math.PI) * (apexHeight - 3.5);
        } else if (progress < 0.85) {
          const p2 = (progress - 0.6) / 0.25;
          diceGroup.position.y = 3.5 + Math.sin(p2 * Math.PI) * 0.75;
        } else {
          const p3 = (progress - 0.85) / 0.15;
          diceGroup.position.y = 3.5 + Math.sin(p3 * Math.PI) * 0.15;
        }

        if (progress < 1.0) {
          requestAnimationFrame(stepRoll);
        } else {
          const finalVal = activeRollAnim.rolled;
          diceGroup.rotation.set(activeRollAnim.targetRotX, activeRollAnim.targetRotY, activeRollAnim.targetRotZ);
          diceGroup.position.y = 3.5;

          if (diceBtn) diceBtn.classList.remove('rolling');
          const faceIcon = document.getElementById('dice-face-icon');
          const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
          if (faceIcon) faceIcon.textContent = diceSymbols[finalVal - 1];
          if (actionText) actionText.textContent = 'ROLL';

          activeRollAnim = null;
          gameState.isRolling = false;
          if (onComplete) {
            onComplete(finalVal);
          } else {
            onDiceRollFinished(finalVal);
          }
        }
      }
      requestAnimationFrame(stepRoll);
    }

    function rollDice(gestureParams = null) {
      const isNetworkGame = (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE);
      const isHostBot = isAiTurn() && typeof ludoNetwork !== 'undefined' && ludoNetwork.isHost;
      const isMyTurnNow = isNetworkGame ? (typeof ludoNetwork !== 'undefined' && gameState.activeTurn === ludoNetwork.myPlayerIndex) : (gameState.mode === GAME_MODES.VS_AI ? gameState.activeTurn === (gameState.userPlayerId || 0) : true);

      if (isNetworkGame && !isMyTurnNow && !isHostBot) {
        showToast("⏳ Opponent's Turn! Please wait...");
        return;
      }

      if (gameState.isRolling) {
        nudgeRollingDice('in_flight_tap');
        return;
      }
      if (gameState.waitingForPawnSelect || gameState.gameOver) return;

      gameState.isRolling = true;
      const diceBtn = document.getElementById('main-dice-btn');
      if (diceBtn) diceBtn.classList.add('rolling');

      let flickVelocity = gestureParams ? (gestureParams.flickVelocity || 1.0) : 1.0;
      let flickAngle = gestureParams ? (gestureParams.flickAngle || 0) : 0;
      let spinTorque = gestureParams ? (gestureParams.spinTorque || 0) : 0;
      let elevation = gestureParams ? (gestureParams.elevation || 1.0) : 1.0;
      let wasLiftedHigh = !!gestureParams && gestureParams.wasLiftedHigh;
      let isFastTap = !!gestureParams && gestureParams.fastTap;
      let isForceful = !!gestureParams && (gestureParams.isForceful || flickVelocity > 1.6 || elevation > 2.0 || wasLiftedHigh);
      let isFlick = !!gestureParams && (gestureParams.isSwipe || flickVelocity > 1.1 || isForceful);

      forcefulSixCooldownCounter++;
      let rolled;

      if (gestureParams && gestureParams.forcedValue) {
        sounds.playDiceRoll();
        rolled = gestureParams.forcedValue;
        showToast('🍀 Lucky 6 Activated!');
      } else if (isForceful || wasLiftedHigh || isFastTap) {
        sounds.playDiceFlick(flickVelocity * 1.5);
        const canRollForcefulSix = (forcefulSixCooldownCounter >= forcefulSixThreshold);
        if (canRollForcefulSix) {
          const rand = Math.random();
          if (rand < 0.60) {
            rolled = 6;
            forcefulSixCooldownCounter = 0;
            forcefulSixThreshold = Math.floor(Math.random() * 6) + 10;
            showToast(\`🔥 CHAKKA! 6 Rolled!\`);
          } else if (rand < 0.85) {
            rolled = 5;
            showToast('⚡ POWER THROW! 5 Rolled!');
          } else {
            rolled = 4;
            showToast('🎯 STRONG THROW! 4 Rolled!');
          }
        } else {
          const safeRolls = [2, 3, 4, 5, 1, 4, 5];
          rolled = safeRolls[Math.floor(Math.random() * safeRolls.length)];
          showToast('⚡ Power Throw!');
        }
      } else if (isFlick) {
        sounds.playDiceFlick(flickVelocity);
        const baseRoll = Math.floor(Math.random() * 6) + 1;
        const gestureShift = Math.floor(Math.abs(flickVelocity) * 2.2 + Math.sin(flickAngle) * 2.8 + spinTorque);
        rolled = ((baseRoll - 1 + gestureShift) % 6 + 6) % 6 + 1;
        if (rolled === 0) rolled = 5;
        if (rolled === 6 && forcefulSixCooldownCounter < forcefulSixThreshold) {
          rolled = (Math.random() < 0.5) ? 5 : 4;
        } else if (rolled === 6) {
          forcefulSixCooldownCounter = 0;
          forcefulSixThreshold = Math.floor(Math.random() * 6) + 10;
        }
        showToast('⚡ Flick Throw!');
      } else {
        sounds.playDiceRoll();
        rolled = Math.floor(Math.random() * 6) + 1;
        if (rolled === 6) {
          forcefulSixCooldownCounter = 0;
          forcefulSixThreshold = Math.floor(Math.random() * 6) + 10;
        }
      }

      gameState.diceValue = rolled;

      // Broadcast dice roll in multiplayer
      if (isNetworkGame && (isMyTurnNow || isHostBot)) {
        ludoNetwork.sendDiceRoll(rolled, gameState.activeTurn);
      }

      runDicePhysicsRoll(rolled, gestureParams || {}, (finalVal) => {
        onDiceRollFinished(finalVal);
      });
    }

    function onDiceRollFinished(val) {
      if (val === 6) {
        gameState.consecutiveSixes++;
        if (gameState.consecutiveSixes >= 3) {
          showToast('3 Sixes in a row! Turn lost!');
          gameState.consecutiveSixes = 0;
          if (typeof ludoNetwork !== 'undefined' && (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE)) {
            ludoNetwork.sendPassTurn(gameState.activeTurn);
          }
          nextTurn();
          return;
        }
      } else {
        gameState.consecutiveSixes = 0;
      }

      // Check valid pawn moves
      const pId = gameState.activeTurn;
      const playerPawns = pawns[pId];
      const validPawns = [];
      playerPawns.forEach((p) => {
        if (p.userData.isHome) return;
        const step = p.userData.stepIndex;
        if (step === -1 && val === 6) {
          validPawns.push(p);
        } else if (step >= 0 && step + val <= 56) {
          validPawns.push(p);
        }
      });

      const isNetworkGame = (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE);
      const isMyLocalTurn = isNetworkGame 
        ? (typeof ludoNetwork !== 'undefined' && gameState.activeTurn === ludoNetwork.myPlayerIndex)
        : (gameState.mode === GAME_MODES.VS_AI ? gameState.activeTurn === (gameState.userPlayerId || 0) : true);

      const isHostControllingBot = isNetworkGame && isAiTurn() && (typeof ludoNetwork !== 'undefined' && ludoNetwork.isHost);

      if (validPawns.length === 0) {
        if (val !== 6 && playerPawns.every(p => p.userData.stepIndex === -1)) {
          showToast(\`🎲 Rolled \${val}! Need a 6 to open goti from yard.\`);
        } else {
          showToast('No valid moves!');
        }

        if (isMyLocalTurn || isHostControllingBot || gameState.mode === GAME_MODES.LOCAL || gameState.mode === GAME_MODES.VS_AI) {
          setTimeout(() => {
            if (isNetworkGame && typeof ludoNetwork !== 'undefined') {
              ludoNetwork.sendPassTurn(gameState.activeTurn);
            }
            nextTurn();
          }, 1000);
        }
      } else if (validPawns.length === 1 && (isMyLocalTurn || isHostControllingBot || gameState.mode === GAME_MODES.LOCAL)) {
        // Auto-move single pawn ONLY IF local turn or host-bot
        highlightPawns(validPawns);
        setTimeout(() => movePawn(validPawns[0], val), 350);
      } else if (validPawns.length === 1) {
        // Remote human player's pawn: highlight and wait for incoming PAWN_MOVE
        highlightPawns(validPawns);
        updateTurnUI();
      } else {
        highlightPawns(validPawns);
        if (isMyLocalTurn) {
          gameState.waitingForPawnSelect = true;
          gameState.activeMovablePawns = validPawns;
          updateTurnUI();
        } else if (isHostControllingBot || (gameState.mode === GAME_MODES.VS_AI && isAiTurn())) {
          setTimeout(() => executeAiMove(validPawns, val), 700);
        } else {
          gameState.waitingForPawnSelect = false;
          updateTurnUI();
        }
      }
    }

    function isAiTurn() {
      if (gameState.mode === GAME_MODES.VS_AI) {
        const human = (gameState.userPlayerId !== undefined) ? gameState.userPlayerId : 0;
        return gameState.activeTurn !== human;
      }
      if (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE) {
        const p = PLAYERS[gameState.activeTurn];
        const isBotSlot = !p || !p.isOnlineHuman;
        return isBotSlot && (typeof ludoNetwork !== 'undefined' && ludoNetwork.isHost);
      }
      return false;
    }`;

// Replace from `function rollDice(gestureParams = null)` up to `function highlightPawns(list)`
const rollDiceStartMarker = "function rollDice(gestureParams = null) {";
const highlightPawnsMarker = "function highlightPawns(list) {";

const rStart = html.indexOf(rollDiceStartMarker);
const hStart = html.indexOf(highlightPawnsMarker);

if (rStart !== -1 && hStart !== -1) {
  html = html.substring(0, rStart) + updatedGameplayCode + "\n\n    " + html.substring(hStart);
  console.log('Replaced rollDice & onDiceRollFinished successfully!');
} else {
  console.error('Could not find markers:', rStart, hStart);
}

// 3. Add syncHudPlayerCards and startMultiplayerMatch
const helpersCode = `    // =========================================================================
    // HUD PLAYER CARDS SYNCHRONIZATION
    // =========================================================================
    function syncHudPlayerCards() {
      const activePlayers = getActivePlayers();
      const isNetworkGame = (gameState.mode === GAME_MODES.PRIVATE || gameState.mode === GAME_MODES.ONLINE);
      const myId = isNetworkGame
        ? (typeof ludoNetwork !== 'undefined' ? ludoNetwork.myPlayerIndex : 0)
        : ((gameState.userPlayerId !== undefined) ? gameState.userPlayerId : 0);

      for (let i = 0; i < 4; i++) {
        const card = document.getElementById('hud-p' + i);
        if (!card) continue;

        if (!activePlayers.includes(i)) {
          card.style.display = 'none';
          continue;
        }

        card.style.display = 'flex';
        const p = PLAYERS[i];
        if (!p) continue;

        const nameEl = document.getElementById('hud-p' + i + '-name');
        if (nameEl) {
          if (i === myId) {
            nameEl.textContent = 'You (' + (p.name || 'You') + ')';
          } else {
            nameEl.textContent = p.name || ('Player ' + (i + 1));
          }
        }

        const avEl = document.getElementById('hud-p' + i + '-avatar');
        if (avEl) {
          avEl.innerHTML = LUDO_HD_AVATARS[p.avatarIndex % LUDO_HD_AVATARS.length] || '👤';
        }

        const flagEl = document.getElementById('hud-p' + i + '-flag');
        if (flagEl) {
          flagEl.textContent = p.flag ? p.flag.split(' ')[0] : '🇵🇰';
        }

        const nameRow = card.querySelector('.hud-p-name-row');
        if (nameRow) {
          const oldTags = nameRow.querySelectorAll('.hud-you-tag, .hud-bot-tag, .hud-live-tag');
          oldTags.forEach(t => t.remove());

          const tagSpan = document.createElement('span');
          if (i === myId) {
            tagSpan.className = 'hud-you-tag';
            tagSpan.textContent = 'YOU';
          } else if (p.isOnlineHuman) {
            tagSpan.className = 'hud-live-tag';
            tagSpan.style.cssText = 'background:#10b981; color:#fff; font-size:9px; font-weight:900; padding:1px 5px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px;';
            tagSpan.textContent = 'LIVE';
          } else {
            tagSpan.className = 'hud-bot-tag';
            tagSpan.textContent = 'BOT';
          }
          nameRow.appendChild(tagSpan);
        }
      }
    }

    function startMultiplayerMatch(mode, playerCount, stake, myIndex, roomPlayersList = null) {
      if (!user.spendCoins(stake)) {
        showToast(\`🪙 Need 🪙 \${stake.toLocaleString()} Coins to enter! (Balance: 🪙 \${user.coins.toLocaleString()})\`);
        setShopTab('spend');
        document.getElementById('modal-shop')?.classList.add('active');
        return;
      }
      user.updateHeaderUI();
      gameState.mode = mode;
      gameState.playerCount = playerCount;
      gameState.stake = stake;
      gameState.userPlayerId = myIndex;
      gameState.activeTurn = 0; // Red always starts first across all devices!
      gameState.diceValue = 0;
      gameState.gameOver = false;
      user.gamesPlayed++;
      user.save();

      // Configure PLAYERS array with room player profiles
      if (Array.isArray(roomPlayersList) && roomPlayersList.length > 0) {
        roomPlayersList.forEach(rp => {
          if (PLAYERS[rp.index]) {
            PLAYERS[rp.index].name = rp.name;
            PLAYERS[rp.index].flag = rp.flag || '🇵🇰';
            PLAYERS[rp.index].avatarIndex = rp.avatarIndex || 0;
            PLAYERS[rp.index].isOnlineHuman = !!rp.isOnlineHuman;
          }
        });
      }

      // Reset Pawns to Yard & configure active players
      const activePlayers = getActivePlayers();
      for (let pId = 0; pId < 4; pId++) {
        const isActive = activePlayers.includes(pId);
        pawns[pId].forEach((pawn, idx) => {
          pawn.visible = isActive;
          pawn.userData.stepIndex = -1;
          pawn.userData.isHome = false;
          const yardPos = YARD_COORDS[pId][idx];
          pawn.position.set(yardPos[0], 0.1, yardPos[1]);
          pawn.userData.selectRing.material.opacity = 0;
        });
      }

      document.getElementById('top-bar').style.display = 'none';
      document.getElementById('menu-screen').style.display = 'none';
      document.getElementById('game-hud').style.display = 'flex';

      const roomBadge = document.getElementById('hud-room-badge');
      if (roomBadge) {
        roomBadge.style.display = 'block';
        roomBadge.textContent = (mode === GAME_MODES.PRIVATE) 
          ? \`Room #\${ludoNetwork.currentRoom}\` 
          : \`World #\${ludoNetwork.currentRoom}\`;
      }

      syncHudPlayerCards();
      initRoomChatListener();
      triggerBotGreetingOnGameStart();
      updateTurnUI();

      if (isAiTurn() && ludoNetwork.isHost) {
        setTimeout(() => rollDice(), 1000);
      }

      showToast(\`🎲 Live Match Started! Pot: 🪙 \${(stake * playerCount).toLocaleString()}\`);
    }
`;

// Insert helpersCode before `function startMatch(mode, playerCount, stake) {`
const startMatchMarker = "function startMatch(mode, playerCount, stake) {";
const smIndex = html.indexOf(startMatchMarker);
if (smIndex !== -1) {
  html = html.substring(0, smIndex) + helpersCode + "\n\n    " + html.substring(smIndex);
  console.log('Inserted syncHudPlayerCards and startMultiplayerMatch successfully!');
} else {
  console.error('Could not find startMatchMarker');
}

// In startMatch, also call syncHudPlayerCards()
html = html.replace("triggerBotGreetingOnGameStart();", "syncHudPlayerCards();\n      triggerBotGreetingOnGameStart();");

// Write to files
fs.writeFileSync('app/src/main/assets/index.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully written updated index.html to both locations!');
