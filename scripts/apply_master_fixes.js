const fs = require('fs');

let html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');

console.log('Original index.html length:', html.length);

// =========================================================================
// 1. FIX JAVASCRIPT SYNTAX ERRORS (CRITICAL)
// =========================================================================

// Fix duplicate elDrawerAvatar declaration
const oldDuplicateDrawer = `        const elDrawerName = document.getElementById('drawer-user-name');
        const elDrawerStatus = document.getElementById('drawer-user-status');
        const elDrawerAvatar = document.getElementById('drawer-avatar');
        if (elDrawerName) elDrawerName.textContent = this.name;
        if (elDrawerStatus) elDrawerStatus.textContent = this.isGuest ? 'Guest Mode' : 'Verified Player';
        if (elDrawerAvatar) elDrawerAvatar.textContent = elAvatar ? elAvatar.textContent : '🎩';`;

const fixedDrawer = `        const elDrawerName = document.getElementById('drawer-user-name');
        const elDrawerStatus = document.getElementById('drawer-user-status');
        if (elDrawerName) elDrawerName.textContent = this.name;
        if (elDrawerStatus) elDrawerStatus.textContent = this.isGuest ? 'Guest Mode' : 'Verified Player';`;

if (html.includes(oldDuplicateDrawer)) {
  html = html.replace(oldDuplicateDrawer, fixedDrawer);
  console.log('Fixed duplicate elDrawerAvatar declaration');
} else {
  // Regex fallback
  html = html.replace(
    /const elDrawerAvatar = document\.getElementById\('drawer-avatar'\);\s*if \(elDrawerName\)[\s\S]*?if \(elDrawerAvatar\) elDrawerAvatar\.textContent = elAvatar \? elAvatar\.textContent : '🎩';/,
    `if (elDrawerName) elDrawerName.textContent = this.name;\n        if (elDrawerStatus) elDrawerStatus.textContent = this.isGuest ? 'Guest Mode' : 'Verified Player';`
  );
  console.log('Applied regex fix for elDrawerAvatar');
}

// Fix unescaped single quotes in handleBotChatReaction
html = html.replace("reply = '😅 Don't worry!';", 'reply = "😅 Don\'t worry!";');
html = html.replace("'Let's see who wins! 🏆'", '"Let\'s see who wins! 🏆"');

// Fix duplicate triggerChatBubble and duplicate handleBotChatReaction
// We will replace the second duplicate declarations near line 8800 with delegated calls or remove duplicates
const oldSecondTrigger = `    function triggerChatBubble(playerIndex, text, isEmoji = false) {
      const bubble = document.getElementById(\`hud-bubble-p\${playerIndex}\`);
      if (bubble) {
        bubble.textContent = text;
        if (isEmoji) bubble.classList.add('is-emoji');
        else bubble.classList.remove('is-emoji');
        bubble.classList.add('visible');
        if (bubble._timer) clearTimeout(bubble._timer);
        bubble._timer = setTimeout(() => {
          bubble.classList.remove('visible');
        }, 4500);
      }
      sounds.playChat();
      const p = PLAYERS[playerIndex] || { name: \`Player \${playerIndex + 1}\`, hexStr: '#fbbf24' };
      showLiveChatTicker(p.name, p.hexStr, text, isEmoji);
    }`;

if (html.includes(oldSecondTrigger)) {
  html = html.replace(oldSecondTrigger, `    // Consolidated with primary triggerChatBubble`);
  console.log('Removed duplicate triggerChatBubble');
} else {
  // Regex replacement
  html = html.replace(
    /function triggerChatBubble\(playerIndex, text, isEmoji = false\) \{[\s\S]*?showLiveChatTicker\(p\.name, p\.hexStr, text, isEmoji\);\s*\}/,
    `// Consolidated with primary triggerChatBubble`
  );
  console.log('Regex removed second triggerChatBubble');
}

const oldSecondBot = `    function handleBotChatReaction(playerText, senderIdx = 0) {
      const activeBots = getActivePlayers().filter(idx => idx !== senderIdx);
      if (activeBots.length === 0) return;
      const randomBot = activeBots[Math.floor(Math.random() * activeBots.length)];
      setTimeout(() => {
        if (gameState.gameOver) return;
        const lower = (playerText || '').toLowerCase();
        let reply = null;
        let isEmoji = false;
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
          reply = 'Hello! 👋';
        } else if (lower.includes('play fast') || lower.includes('jaldi')) {
          reply = 'Playing fast! ⏳';
        } else if (lower.includes('well played') || lower.includes('shabash') || lower.includes('good game')) {
          reply = 'Thank you! 🤝';
        } else if (lower.includes('sorry')) {
          reply = 'No worries! 😄';
        } else if (lower.includes('🎩')) {
          reply = '🎩';
          isEmoji = true;
        } else {
          const friendlyReplies = ['Good luck! 🍀', 'Roll a 6! 🎲', 'Well played! 👍', '🎩', '🔥', 'Haha nice! 😂', 'I will win! 👑'];
          reply = friendlyReplies[Math.floor(Math.random() * friendlyReplies.length)];
          if (reply === '🎩' || reply === '🔥' || reply === '👑') isEmoji = true;
        }
        if (reply) {
          triggerChatBubble(randomBot, reply, isEmoji);
        }
      }, 1000 + Math.random() * 1200);
    }`;

if (html.includes(oldSecondBot)) {
  html = html.replace(oldSecondBot, `    // Consolidated with primary handleBotChatReaction`);
  console.log('Removed duplicate handleBotChatReaction');
} else {
  html = html.replace(
    /function handleBotChatReaction\(playerText, senderIdx = 0\) \{[\s\S]*?triggerChatBubble\(randomBot, reply, isEmoji\);\s*\}\s*\}, 1000 \+ Math\.random\(\) \* 1200\);\s*\}/,
    `// Consolidated with primary handleBotChatReaction`
  );
  console.log('Regex removed second handleBotChatReaction');
}

console.log('Syntax fixes applied. Testing node check...');
