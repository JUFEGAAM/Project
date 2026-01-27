/* js/game.js */
let world = document.getElementById("world");
const ctx = world.getContext("2d");
const GRID_SIZE = 40;
const FINAL_MISSION = 67;

// Colors and Resources
const RESOURCES = {
  WOOD: { id: 'wood', color: '#8B4513', name: 'Wood' },
  IRON: { id: 'iron', color: '#4b4b4b', name: 'Iron' },
  COPPER: { id: 'copper', color: '#e67e22', name: 'Copper' },
  SILVER: { id: 'silver', color: '#ecf0f1', name: 'Silver' },
  GOLD: { id: 'gold', color: '#f1c40f', name: 'Gold' }
};

let gameStarted = false;
let camera = { x: 0, y: 0 };
let zoom = 1.0;
let isPaused = true;
let shakeOffset = { x: 0, y: 0 };
let loopId = null;

let player = {
  hp: 3, maxHp: 3, xp: 0, maxXp: 100, level: 1,
  power: 1.0, capacity: 20, currentLoad: 0,
  luck: 1.0, xpMultiplier: 1.0,
  inventory: { wood: 0, iron: 0, copper: 0, silver: 0, gold: 0 }
};

let mission = {
  active: false, type: null, target: 0,
  collected: 0, delivered: 0, timeLeft: 0, difficulty: 1,
  totalCompleted: 0
};

let boss = {
  active: false, type: "MINION", immune: false,
  hp: 0, maxHp: 0,
  timer: 0, maxTimer: 0, strikes: 0,
  phase: 0,
  minigameType: null, minigameActive: false,
  minigameTimer: 0, minigameMaxTimer: 0,
  currentWord: "", typedIndex: 0, wordsRemaining: 0,
  tauntTimer: 0
};

let aimTargets = [];
let worldResources = [];
let floatingTexts = [];
let particles = [];
let speechBubbles = [];
let isDragging = false;
let lastMousePos = { x: 0, y: 0 };
let isHoveringCore = false;
let coreScale = 1.0;
let coreHappyTimer = 0;

let activeUpgrades = [];
let upgradeLock = false;
let currentTypingTarget = null;
let isUpgradeMenuOpen = false;
let upgradeQueue = [];

const BOSS_TAUNTS = {
  IDLE: ["TOO SLOW!", "I'M WAITING...", "TICK TOCK", "YOU'LL FAIL", "TRY HARDER"],
  AIM: ["NO REFLEXES?", "MISSED ME!", "BLIND?", "TOO SLOW!", "LOOK HERE!"],
  TYPE: ["CAN'T SPELL?", "USE WORDS!", "SLOW TYPER", "ERROR 404", "ABC..."],
  DIR: ["LOST?", "WRONG WAY!", "NO GPS?", "LEFT OR RIGHT?"],
  GENERIC: ["OUCH!", "THAT TICKLES!", "IS THAT IT?", "WEAK!", "TRY AGAIN!", "MY SHIELD!", "PATHETIC"]
};
const TECH_WORDS = ["SYSTEM", "CORE", "ERROR", "VIRUS", "DATA", "CODE", "HACK", "BIOS", "ROOT", "NULL", "VOID", "FATAL", "CRASH", "DUMP", "LOG"];

function startGame(startLevel) {
  document.getElementById('start-screen').style.display = 'none';
  gameStarted = true;
  isPaused = false;
  initGame(startLevel);
}

function initGame(startLevel = 0) {
  if (loopId) cancelAnimationFrame(loopId);

  resize();
  initWorld();
  mission.totalCompleted = startLevel;
  mission.difficulty = Math.floor(startLevel / 5);
  if (startLevel > 0) {
    player.power = 1.0 + (startLevel * 0.5);
    player.capacity = 20 + (startLevel * 2);
    player.level = startLevel;
    player.luck = 1.0 + (startLevel * 0.05);
  }
  updateUI();
  const introMsg = startLevel > 0
    ? `HARD MODE: LEVEL ${startLevel}.<br>BOSS INCOMING!`
    : "CORE DEBT: HARD MODE.<br><br>Move with right click.<br>Farm everything you can.<br>And survive all 67 levels.";
  showMessage(introMsg, () => {
    if (startLevel > 0 && (startLevel % 5 === 0 || startLevel === 67) && startLevel !== 0) {
      spawnBoss();
    } else {
      nextMission();
    }
    gameLoop();
  });
}

function initWorld() {
  worldResources = [];
  createPatch(-200, -200, RESOURCES.WOOD, 3);
  createPatch(200, 200, RESOURCES.WOOD, 3);

  for (let i = 0; i < 250; i++) {
    const range = 5000;
    const x = (Math.random() - 0.5) * 2 * range;
    const y = (Math.random() - 0.5) * 2 * range;
    const dist = Math.sqrt(x * x + y * y);

    if (dist < 300) continue;

    const rand = Math.random();
    let type = RESOURCES.WOOD; let size = 2;

    if (dist > 2000 && rand > 0.85) {
      type = RESOURCES.GOLD; size = 4;
    } else if (rand > 0.96) {
      type = RESOURCES.GOLD; size = 2;
    } else if (rand > 0.85) {
      type = RESOURCES.SILVER; size = 2;
    } else if (rand > 0.65) {
      type = RESOURCES.IRON; size = 3;
    } else if (rand > 0.45) {
      type = RESOURCES.COPPER; size = 3;
    }
    createPatch(x, y, type, size);
  }
}

function createPatch(startX, startY, type, size) {
  const bx = Math.floor(startX / GRID_SIZE) * GRID_SIZE;
  const by = Math.floor(startY / GRID_SIZE) * GRID_SIZE;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (Math.random() > 0.3) {
        worldResources.push({
          x: bx + (i * GRID_SIZE), y: by + (j * GRID_SIZE),
          type: type.id, color: type.color, amount: 40 + (Math.random() * 40)
        });
      }
    }
  }
}

function startMission(typeId, amount, time) {
  mission.active = true; mission.type = typeId; mission.target = amount; mission.delivered = 0; mission.timeLeft = time;
  const name = Object.values(RESOURCES).find(r => r.id === typeId).name;
  document.getElementById('mission-panel').style.display = 'block';
  document.getElementById('mission-panel').className = '';
  document.getElementById('mission-title').innerText = `Level ${mission.totalCompleted + 1}`;
  document.getElementById('mission-desc').innerHTML = `Bring <span style="color:#48dbfb">${mission.delivered}/${amount}</span> ${name}`;
}

function attemptDelivery() {
  if (boss.active) { spawnFloatingText(0, -60, "KILL THE BOSS!", "#f00"); return; }
  if (!mission.active) return;
  const amountInInv = player.inventory[mission.type];
  if (amountInInv > 0) {
    player.inventory[mission.type] = 0;
    mission.delivered += amountInInv;
    player.currentLoad -= amountInInv;
    if (player.currentLoad < 0) player.currentLoad = 0;
    coreHappyTimer = 60;
    spawnParticles(0, 0, 20, RESOURCES[mission.type.toUpperCase()].color);
    spawnFloatingText(0, -80, "YUMMY!", "#48dbfb");
    updateUI();
    const name = Object.values(RESOURCES).find(r => r.id === mission.type).name;
    document.getElementById('mission-desc').innerHTML = `Bring <span style="color:#48dbfb">${mission.delivered}/${mission.target}</span> ${name}`;
    if (mission.delivered >= mission.target) completeMission();
  } else {
    spawnFloatingText(0, -80, "WRONG ITEM!", "#e17055");
  }
}

function completeMission() {
  mission.active = false;
  document.getElementById('mission-panel').style.display = 'none';
  mission.totalCompleted++;
  mission.difficulty++;
  updateUI();
  if (mission.totalCompleted >= FINAL_MISSION) { winGame(); return; }

  if (mission.totalCompleted % 5 === 0 || mission.totalCompleted === 67) {
    spawnBoss();
  } else {
    spawnFloatingText(0, -120, "LEVEL COMPLETE", "#fdcb6e");
    setTimeout(() => { queueUpgrade("Level Reward"); }, 1000);
  }
}

function spawnBoss() {
  boss.active = true;
  boss.immune = false;
  boss.minigameActive = false;
  boss.strikes = 0;
  boss.phase = 0;
  boss.tauntTimer = 3.0;
  aimTargets = [];
  speechBubbles = [];

  camera.x = 0; camera.y = 0; zoom = 0.8;

  if (mission.totalCompleted === 67) {
    boss.type = "GOD";
    boss.maxHp = 2500;
    boss.maxTimer = 18.0;
    document.getElementById('boss-title').style.color = "#f1c40f";
  } else if (mission.totalCompleted % 10 === 0) {
    boss.type = "DEMIGOD";
    boss.maxHp = (40 + (mission.totalCompleted * 10)) * 2.0;
    boss.maxTimer = Math.max(9.0, 12.0 - (mission.totalCompleted * 0.1));
    document.getElementById('boss-title').style.color = "#e74c3c";
  } else {
    boss.type = "MINION";
    boss.maxHp = 30 + (mission.totalCompleted * 8);
    boss.maxTimer = Math.max(8.0, 11.0 - (mission.totalCompleted * 0.1));
    document.getElementById('boss-title').style.color = "#e67e22";
  }

  boss.hp = boss.maxHp;
  boss.timer = boss.maxTimer + 0.1;
  boss.scale = 0.1;

  document.getElementById('boss-ui-container').style.display = 'block';
  document.getElementById('boss-timer-bar').style.display = 'block';
  document.getElementById('boss-minigame-bar').style.display = 'none';
  document.getElementById('minigame-text-overlay').style.display = 'none';
  document.getElementById('boss-title').innerText = boss.type;

  const markers = document.getElementById('hp-markers-container');
  markers.innerHTML = '';

  if (boss.type !== "MINION") {
    markers.innerHTML += `<div class="hp-marker" style="left:33%"></div><div class="hp-marker" style="left:66%"></div>`;
  }

  updateBossUI();
  spawnFloatingText(0, -150, "BOSS SPAWNED!", "#f00");
  draw();
}

function clickBoss() {
  if (boss.immune) return;
  if (boss.minigameActive) {
    spawnFloatingText(0, -100, "SHIELD ACTIVE!", "#f00");
    return;
  }
  const dmg = player.power;
  boss.hp -= dmg;
  boss.scale = 0.9;

  if (Math.random() > 0.6) triggerBossTaunt("GENERIC");

  spawnFloatingText((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, `-${dmg.toFixed(1)}`, "#f00");
  if (boss.hp <= 0) {
    killBoss();
    return;
  }

  const hpPct = boss.hp / boss.maxHp;

  if (boss.type !== "MINION") {
    if (boss.phase === 0 && hpPct <= 0.66) startMinigameCountdown(1);
    else if (boss.phase === 1 && hpPct <= 0.33) startMinigameCountdown(2);
  }
  updateBossUI();
}

function determineNextMinigame() {
  if (mission.totalCompleted === 10) boss.minigameType = 'AIM';
  else if (mission.totalCompleted === 20) boss.minigameType = 'WORD';
  else if (mission.totalCompleted === 30) boss.minigameType = 'DIR';
  else {
    const types = ['AIM', 'WORD', 'DIR'];
    boss.minigameType = types[Math.floor(Math.random() * types.length)];
  }
}

function startMinigameCountdown(newPhase) {
  boss.phase = newPhase;
  boss.immune = true;
  boss.minigameActive = false;

  determineNextMinigame();
  let modeName = "PREPARE YOURSELF";
  if (boss.minigameType === 'AIM') modeName = "AIM MAD";
  else if (boss.minigameType === 'WORD') modeName = "WRITING CRAZY";
  else if (boss.minigameType === 'DIR') modeName = "DIRECTIONS TO THE HELL";

  const overlay = document.getElementById('minigame-text-overlay');
  const countEl = document.getElementById('countdown-display');
  const instrEl = document.getElementById('minigame-instruction');
  const wordEl = document.getElementById('minigame-word');

  overlay.style.display = 'flex';
  instrEl.style.display = "block";
  instrEl.innerText = modeName;
  wordEl.style.display = "none";
  countEl.style.display = "block";

  let count = 3;
  countEl.innerText = count;
  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countEl.innerText = count;
      countEl.style.animation = 'none';
      countEl.offsetHeight;
      countEl.style.animation = null;
    } else {
      clearInterval(interval);
      countEl.innerText = "LET'S GO!";
      instrEl.style.display = "none";
      setTimeout(() => {
        countEl.style.display = "none";
        activateMinigameLogic();
      }, 800);
    }
  }, 800);
}

function activateMinigameLogic() {
  boss.immune = false;
  boss.minigameActive = true;
  const wordEl = document.getElementById('minigame-word');

  const level = mission.totalCompleted;

  if (boss.minigameType === 'AIM') {
    const targets = Math.min(6, 4 + Math.floor(level / 10));
    spawnAimTargets(targets);
    boss.minigameMaxTimer = Math.max(4.5, 7.0 - (level * 0.05));
    updateMinigameText("CLICK TARGETS");
    wordEl.style.display = "none";
    triggerBossTaunt("AIM");

  } else if (boss.minigameType === 'WORD') {
    boss.wordsRemaining = 3 + Math.floor(level / 15);
    boss.minigameMaxTimer = Math.max(2.0, 4.5 - (level * 0.03));
    nextBossWord();
    wordEl.style.display = "inline-block";
    triggerBossTaunt("TYPE");

  } else {
    boss.wordsRemaining = 5 + Math.floor(level / 10);
    boss.minigameMaxTimer = Math.max(2.0, 5.5 - (level * 0.05));
    nextBossDirection();
    wordEl.style.display = "inline-block";
    triggerBossTaunt("DIR");
  }

  boss.minigameTimer = boss.minigameMaxTimer;
  document.getElementById('boss-minigame-bar').style.display = 'block';
}

function spawnAimTargets(count) {
  aimTargets = [];
  for (let i = 0; i < count; i++) {
    aimTargets.push({
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      radius: 30
    });
  }
}
function nextBossWord() {
  boss.currentWord = TECH_WORDS[Math.floor(Math.random() * TECH_WORDS.length)];
  boss.typedIndex = 0;
  updateMinigameText("TYPE THE WORD");
}
function nextBossDirection() {
  const dirs = ["TOP", "BOTTOM", "LEFT", "RIGHT"];
  boss.currentWord = dirs[Math.floor(Math.random() * dirs.length)];
  boss.typedIndex = 0;
  updateMinigameText("TYPE THE GREEN SIDE");
}
function updateMinigameText(instr) {
  document.getElementById('minigame-instruction').innerText = instr;
  if (boss.minigameType === 'AIM') return;
  const w = boss.currentWord;
  const done = w.substring(0, boss.typedIndex);
  const pend = w.substring(boss.typedIndex);
  document.getElementById('minigame-word').innerHTML = `<span class="char-done">${done}</span><span class="char-pending">${pend}</span>`;
}
function checkBossTimer(dt) {
  if (!boss.active) return;
  boss.tauntTimer -= dt;
  if (boss.tauntTimer <= 0) {
    triggerBossTaunt("IDLE");
    boss.tauntTimer = 3.0 + Math.random() * 4.0;
  }
  if (boss.minigameActive) {
    boss.minigameTimer -= dt;
    if (boss.minigameTimer <= 0) {
      player.hp--;
      spawnFloatingText(0, 0, "FAILED!", "#f00");
      updateUI();
      if (player.hp <= 0) { showMessage("DEFEATED BY SHIELD", () => location.reload()); return; }

      if (boss.minigameType === 'AIM') {
        const targets = Math.min(6, 4 + Math.floor(mission.totalCompleted / 10));
        spawnAimTargets(targets);
      }
      boss.minigameTimer = boss.minigameMaxTimer;
    }
  } else if (!boss.immune) {
    boss.timer -= dt;
    if (boss.timer <= 0) {
      boss.timer = boss.maxTimer;
      boss.strikes++;
      player.hp--;
      spawnFloatingText(0, 0, "-1 HP!", "#f00");
      triggerBossTaunt("GENERIC");
      updateUI();
      if (player.hp <= 0) { showMessage("DEFEATED BY BOSS", () => location.reload()); return; }
      if (boss.strikes >= 2) bossLeavePunished();
    }
  }
  updateBossUI();
}

window.addEventListener('keydown', (e) => {
  if (isUpgradeMenuOpen) {
    handleUpgradeTyping(e);
    return;
  }
  if (!isPaused && boss.active && boss.minigameActive && (boss.minigameType === 'WORD' || boss.minigameType === 'DIR')) {
    const key = e.key.toUpperCase();
    if (!/^[A-Z]$/.test(key)) return;

    if (key === boss.currentWord[boss.typedIndex]) {
      boss.typedIndex++;
      updateMinigameText(boss.minigameType === 'DIR' ? "TYPE THE GREEN SIDE" : "TYPE THE WORD");
      if (boss.typedIndex >= boss.currentWord.length) {
        boss.wordsRemaining--;
        spawnFloatingText(0, -50, "CORRECT!", "#48dbfb");
        if (boss.wordsRemaining <= 0) {
          completeMinigame();
        } else {
          if (boss.minigameType === 'DIR') {
            boss.minigameTimer += 2.0;
            if (boss.minigameTimer > boss.minigameMaxTimer) boss.minigameTimer = boss.minigameMaxTimer;
            nextBossDirection();
          } else {
            boss.minigameTimer = boss.minigameMaxTimer;
            nextBossWord();
          }
        }
      }
    } else {
      spawnFloatingText(0, 80, "WRONG! -0.2s", "#e17055");
      boss.minigameTimer -= 0.2;
    }
  }
});

function triggerBossTaunt(category) {
  if (!boss.active) return;
  const list = BOSS_TAUNTS[category] || BOSS_TAUNTS.GENERIC;
  const text = list[Math.floor(Math.random() * list.length)];
  spawnSpeechBubble((Math.random() - 0.5) * 250, -120 - Math.random() * 50, text);
}

function handleUpgradeTyping(e) {
  if (upgradeLock || activeUpgrades.length === 0) return;
  const key = e.key.toUpperCase();
  if (e.key === 'Backspace') {
    if (currentTypingTarget) {
      currentTypingTarget.typedIndex--;
      if (currentTypingTarget.typedIndex <= 0) {
        currentTypingTarget.typedIndex = 0;
        const el = document.getElementById(`upg-card-${currentTypingTarget.id}`);
        el.classList.remove('active-target');
        currentTypingTarget = null;
      }
      updateTypingDisplay();
    }
    return;
  }
  if (!/^[A-Z]$/.test(key) && key !== " ") return;
  if (!currentTypingTarget) {
    const match = activeUpgrades.find(u => u.stats.name[0] === key);
    if (match) {
      currentTypingTarget = match; currentTypingTarget.typedIndex = 1;
      const el = document.getElementById(`upg-card-${match.id}`);
      el.classList.add('active-target');
    }
  } else {
    const name = currentTypingTarget.stats.name;
    if (key === name[currentTypingTarget.typedIndex]) {
      currentTypingTarget.typedIndex++;
      if (currentTypingTarget.typedIndex >= name.length) selectUpgrade(currentTypingTarget);
    } else {
      currentTypingTarget.typedIndex = 0;
      const el = document.getElementById(`upg-card-${currentTypingTarget.id}`);
      el.classList.remove('active-target');
      currentTypingTarget = null;
    }
  }
  updateTypingDisplay();
}
function clickAimTarget(mx, my) {
  let hit = -1;
  for (let i = 0; i < aimTargets.length; i++) {
    let t = aimTargets[i];
    let dist = Math.sqrt((mx - t.x) ** 2 + (my - t.y) ** 2);
    if (dist < t.radius) { hit = i; break; }
  }
  if (hit !== -1) {
    aimTargets.splice(hit, 1);
    spawnFloatingText(mx, my, "HIT!", "#f1c40f");
    if (aimTargets.length === 0) completeMinigame();
  } else {
    boss.minigameTimer -= 0.2;
    spawnFloatingText(mx, my, "-0.2s", "#e17055");
  }
}
function completeMinigame() {
  boss.minigameActive = false;
  document.getElementById('boss-minigame-bar').style.display = 'none';
  document.getElementById('minigame-text-overlay').style.display = 'none';
  boss.timer = boss.maxTimer;
  spawnSpeechBubble(0, -150, "SHIELD BROKEN!");
}
function bossLeavePunished() {
  boss.active = false;
  document.getElementById('boss-ui-container').style.display = 'none';
  player.power = 1.0;
  spawnSpeechBubble(0, -100, "BORING...");
  showMessage("<h1 style='color:#f00'>BOSS LEFT</h1><br>He got bored.<br><b>POWER RESET TO 1.0</b>", () => nextMission());
}
function killBoss() {
  if (boss.type === "GOD") {
    winGame();
    return;
  }
  boss.active = false;
  document.getElementById('boss-ui-container').style.display = 'none';
  document.getElementById('minigame-text-overlay').style.display = 'none';
  spawnParticles(0, 0, 100, "#f00");
  spawnFloatingText(0, 0, "BOSS DEFEATED!", "#fdcb6e");
  addXp(100 * mission.difficulty);
  setTimeout(() => { queueUpgrade("Boss Defeated Reward"); }, 1500);
}

// ==========================================
// MODIFIED VICTORY SCREEN / FINAL FLOW
// ==========================================
function winGame() {
  isPaused = true;
  if (loopId) cancelAnimationFrame(loopId);

  // New Content requested by user
  const msg = `
        <h1 style="color:#f1c40f; font-size:40px; text-shadow:0 0 20px #f1c40f">World Saved</h1>
        <p style="font-size:20px; margin: 20px 0;">You have defeated the God.</p>
        <button id="finish-him-btn" style="margin-top:20px; background:#e74c3c; color:#fff; padding: 15px 30px; border:none; border-radius:4px; font-weight:bold; cursor:pointer; font-size:20px;">FINISH HIM</button>
    `;

  document.getElementById('message-text').innerHTML = msg;
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById('message-box').style.display = 'block';
  document.getElementById('msg-btn').style.display = 'none'; // Hide standard button
  document.getElementById('upgrade-container').style.display = 'none';
  document.getElementById('typing-display').style.display = 'none';

  // Logic for the new button
  document.getElementById('finish-him-btn').onclick = function() {
    window.location.href = "ending.html";
  };
}

function updateBossUI() {
  const pct = (boss.hp / boss.maxHp) * 100;
  document.getElementById('boss-hp-fill').style.width = `${pct}%`;
  const timePct = (boss.timer / boss.maxTimer) * 100;
  document.getElementById('boss-timer-fill').style.width = `${timePct}%`;
  if (boss.minigameActive) {
    const miniPct = (boss.minigameTimer / boss.minigameMaxTimer) * 100;
    document.getElementById('boss-minigame-fill').style.width = `${miniPct}%`;
  }
}

function gameLoop() {
  draw();
  if (!isPaused && gameStarted) {
    const dt = 1 / 60;
    shakeOffset = { x: 0, y: 0 };
    if (mission.active) {
      mission.timeLeft -= dt;
      document.getElementById('mission-timer').innerText = mission.timeLeft.toFixed(1) + "s";
      if (mission.timeLeft <= 5.0) {
        const intensity = (5.0 - mission.timeLeft) * 2;
        shakeOffset.x = (Math.random() - 0.5) * intensity;
        shakeOffset.y = (Math.random() - 0.5) * intensity;
        document.getElementById('mission-panel').classList.add('panic-mode');
      } else {
        document.getElementById('mission-panel').classList.remove('panic-mode');
      }
      if (mission.timeLeft <= 0) failMission();
    }
    if (boss.active) checkBossTimer(dt);
    const targetScale = isHoveringCore ? 1.2 : 1.0;
    coreScale += (targetScale - coreScale) * 0.1;
    if (boss.active && boss.scale < 1.0) boss.scale += 0.05;
    if (coreHappyTimer > 0) coreHappyTimer--;
  }
  loopId = requestAnimationFrame(gameLoop);
}

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#050a14";
  ctx.fillRect(0, 0, world.width, world.height);
  const dpr = window.devicePixelRatio || 1;
  ctx.scale(dpr, dpr);
  const viewCX = window.innerWidth / 2 + shakeOffset.x;
  const viewCY = window.innerHeight / 2 + shakeOffset.y;
  ctx.translate(viewCX, viewCY);
  ctx.scale(zoom, zoom);
  ctx.translate(-camera.x, -camera.y);
  drawGrid();
  if (gameStarted) {
    if (!boss.active) drawCore();
    if (boss.active) drawBoss();
    drawResources();
    drawParticles();
    drawFloatingTexts();
    drawSpeechBubbles();
    if (boss.minigameActive) {
      if (boss.minigameType === 'AIM') drawAimTargets();
      if (boss.minigameType === 'DIR') drawDirectionX();
    }
  }
}
function drawDirectionX() {
  const size = 2000;
  ctx.globalAlpha = 0.3;
  const cur = boss.currentWord;
  ctx.fillStyle = (cur === "TOP") ? "#48dbfb" : "#e74c3c";
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size, -size); ctx.lineTo(size, -size); ctx.fill();
  ctx.fillStyle = (cur === "BOTTOM") ? "#48dbfb" : "#e74c3c";
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size, size); ctx.lineTo(size, size); ctx.fill();
  ctx.fillStyle = (cur === "LEFT") ? "#48dbfb" : "#e74c3c";
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size, -size); ctx.lineTo(-size, size); ctx.fill();
  ctx.fillStyle = (cur === "RIGHT") ? "#48dbfb" : "#e74c3c";
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size, -size); ctx.lineTo(size, size); ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px monospace";
  ctx.fillText("TOP", 0, -350);
  ctx.fillText("BOTTOM", 0, 350);
  ctx.fillText("LEFT", -350, 0);
  ctx.fillText("RIGHT", 350, 0);
}
function drawGrid() {
  ctx.strokeStyle = "#1e2a38";
  ctx.lineWidth = 1.5 / zoom;
  const step = GRID_SIZE;
  const viewW = (window.innerWidth / zoom) / 2 + 100;
  const viewH = (window.innerHeight / zoom) / 2 + 100;
  const startX = Math.floor((camera.x - viewW) / step) * step;
  const endX = camera.x + viewW;
  const startY = Math.floor((camera.y - viewH) / step) * step;
  const endY = camera.y + viewH;
  ctx.beginPath();
  for (let x = startX; x < endX; x += step) { ctx.moveTo(x, startY); ctx.lineTo(x, endY); }
  for (let y = startY; y < endY; y += step) { ctx.moveTo(startX, y); ctx.lineTo(endX, y); }
  ctx.stroke();
}
function drawCore() {
  const size = GRID_SIZE * 1.2 * coreScale;
  ctx.fillStyle = "#48dbfb";
  ctx.shadowBlur = isHoveringCore ? 50 : 30;
  ctx.shadowColor = "#48dbfb";
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#050a14";
  ctx.beginPath();
  ctx.arc(-size * 0.3, -size * 0.2, size * 0.15, 0, Math.PI * 2);
  ctx.arc(size * 0.3, -size * 0.2, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#050a14";
  ctx.lineWidth = size * 0.1;
  ctx.beginPath();
  if (coreHappyTimer > 0) {
    ctx.fillStyle = "#050a14";
    ctx.arc(0, size * 0.1, size * 0.4, 0, Math.PI, false);
    ctx.fill();
  }
  else {
    ctx.arc(0, size * 0.1, size * 0.5, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
}
function drawBoss() {
  const size = GRID_SIZE * 3 * boss.scale;
  ctx.fillStyle = boss.minigameActive ? "#550000" : "#d63031";
  ctx.shadowBlur = boss.minigameActive ? 10 : 40;
  ctx.shadowColor = "#d63031";
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 0.2);
  ctx.lineTo(-size * 0.1, 0);
  ctx.lineTo(-size * 0.3, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.3, -size * 0.2);
  ctx.lineTo(size * 0.1, 0);
  ctx.lineTo(size * 0.3, 0);
  ctx.fill();
}
function drawAimTargets() {
  world.style.cursor = "default";
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#f1c40f";
  aimTargets.forEach(t => {
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
}
function drawSpeechBubbles() {
  ctx.font = `bold ${14 / zoom}px 'Comic Sans MS', sans-serif`;
  ctx.textAlign = "center";
  for (let i = speechBubbles.length - 1; i >= 0; i--) {
    let b = speechBubbles[i];
    ctx.fillStyle = "white";
    const w = ctx.measureText(b.text).width + 20;
    const h = 30;
    ctx.beginPath();
    ctx.roundRect(b.x - w / 2, b.y - h / 2, w, h, 10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(b.x, b.y + h / 2);
    ctx.lineTo(b.x + 10, b.y + h / 2 + 10);
    ctx.lineTo(b.x + 10, b.y + h / 2);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.fillText(b.text, b.x, b.y + 5);
    b.y -= 0.5;
    b.life -= 0.02;
    if (b.life <= 0) speechBubbles.splice(i, 1);
  }
}
function drawResources() {
  worldResources.forEach(res => {
    ctx.fillStyle = res.color || '#ff00ff';
    if (res.type === 'wood') {
      ctx.beginPath();
      ctx.arc(res.x + GRID_SIZE / 2, res.y + GRID_SIZE / 2, (GRID_SIZE / 2) - 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(res.x, res.y, GRID_SIZE, GRID_SIZE);
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 1 / zoom;
      ctx.strokeRect(res.x, res.y, GRID_SIZE, GRID_SIZE);
      if (['silver', 'gold', 'copper', 'iron'].includes(res.type)) {
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(res.x + 4, res.y + 4, 10, 10);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.arc(res.x + GRID_SIZE - 8, res.y + 8, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}
function spawnParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) particles.push({
    x: x + (Math.random() - 0.5) * 100,
    y: y + (Math.random() - 0.5) * 100,
    color: color,
    life: 1.0
  });
}
function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    p.x += (0 - p.x) * 0.1;
    p.y += (0 - p.y) * 0.1;
    p.life -= 0.03;
    if (p.life <= 0) particles.splice(i, 1);
  }
}
function spawnSpeechBubble(x, y, text) {
  speechBubbles.push({ x, y, text, life: 2.0 });
}
function spawnFloatingText(x, y, text, color) {
  floatingTexts.push({ x, y, text, color, life: 1.0 });
}
function drawFloatingTexts() {
  ctx.textAlign = "center";
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    let ft = floatingTexts[i];
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = ft.life;
    ctx.font = `bold ${16 / zoom}px Arial`;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.globalAlpha = 1;
    ft.y -= 1 / zoom;
    ft.life -= 0.02;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }
}
function failMission() {
  mission.active = false;
  document.getElementById('mission-panel').style.display = 'none';
  player.hp--;
  updateUI();
  if (player.hp <= 0) showMessage("GAME OVER", () => location.reload());
  else showMessage("TOO SLOW.<br>-1 HP", () => { nextMission(); });
}
function nextMission() {
  const types = ['wood', 'wood', 'copper', 'iron', 'silver', 'gold'];
  let maxIdx = Math.min(Math.floor(mission.difficulty / 2) + 1, types.length);
  const nextType = types[Math.floor(Math.random() * maxIdx)];
  startMission(nextType, 5 + (mission.difficulty * 3), Math.max(15, 30 - (mission.difficulty * 1)));
}
function mineAt(wx, wy) {
  if (player.currentLoad >= player.capacity) {
    spawnFloatingText(wx, wy, "FULL!", "#e17055");
    return;
  }
  for (let i = worldResources.length - 1; i >= 0; i--) {
    let res = worldResources[i];
    if (wx >= res.x && wx <= res.x + GRID_SIZE && wy >= res.y && wy <= res.y + GRID_SIZE) {
      res.amount -= 10;
      let gain = player.power;
      if (player.currentLoad + gain > player.capacity) gain = player.capacity - player.currentLoad;
      if (gain > 0) {
        player.inventory[res.type] += gain;
        player.currentLoad += gain;
        player.currentLoad = parseFloat(player.currentLoad.toFixed(1));
        player.inventory[res.type] = parseFloat(player.inventory[res.type].toFixed(1));
        addXp(2 * player.xpMultiplier);
        spawnFloatingText(res.x + GRID_SIZE / 2, res.y, `+${gain.toFixed(1)}`, "#fff");
        updateUI();
      }
      if (res.amount <= 0) worldResources.splice(i, 1);
      return;
    }
  }
}
function addXp(amount) {
  player.xp += amount;
  if (player.xp >= player.maxXp) {
    player.xp -= player.maxXp;
    player.level++;
    player.maxXp = Math.floor(player.maxXp * 1.3);
    spawnFloatingText(camera.x, camera.y, "LEVEL UP!", "#48dbfb");
    setTimeout(() => { queueUpgrade("Level Up Reward"); }, 500);
  }
  updateUI();
}
function emptyInventory() {
  player.inventory = { wood: 0, iron: 0, copper: 0, silver: 0, gold: 0 };
  player.currentLoad = 0;
  updateUI();
  spawnFloatingText(camera.x, camera.y + 100, "TRASH EMPTIED", "#e17055");
}
function showTooltip() {
  document.getElementById('trash-tooltip').style.display = 'block';
}
function hideTooltip() {
  document.getElementById('trash-tooltip').style.display = 'none';
}
const UPGRADE_STATS = {
  common: { color: '#ffffff', power: 0.2, cap: 5, luck: 0.1, xp: 0.1 },
  uncommon: { color: '#48dbfb', power: 0.5, cap: 10, luck: 0.2, xp: 0.2 },
  rare: { color: '#3498db', power: 1.0, cap: 15, luck: 0.3, xp: 0.3 },
  epic: { color: '#9b59b6', power: 1.5, cap: 25, luck: 0.5, xp: 0.5 },
  legendary: { color: '#f1c40f', power: 3.0, cap: 50, luck: 1.0, xp: 1.0 }
};
const UPGRADE_TYPES = [
  { id: 'power', name: "CLICK BOOST", desc: "Resources per click", apply: (s) => player.power += s.power },
  { id: 'cap', name: "STORAGE", desc: "+5 Storage", apply: (s) => player.capacity += s.cap },
  { id: 'xp', name: "EXPERIENCE", desc: "XP Gain", apply: (s) => player.xpMultiplier += s.xp },
  { id: 'luck', name: "LUCK", desc: "Upgrade Luck", apply: (s) => player.luck += s.luck },
  { id: 'hp', name: "HEALTH", desc: "Recover 1 HP", apply: (s) => { if (player.hp < player.maxHp) player.hp++; } }
];

function queueUpgrade(reason) {
  if (isUpgradeMenuOpen) {
    upgradeQueue.push(reason);
  } else {
    showUpgradeScreen(reason);
  }
}

function showUpgradeScreen(reasonTitle) {
  isPaused = true;
  upgradeLock = false;
  currentTypingTarget = null;
  isUpgradeMenuOpen = true;
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById('message-box').style.display = 'none';
  document.getElementById('typing-display').style.display = 'flex';
  updateTypingDisplay();
  const container = document.getElementById('upgrade-container');
  container.style.display = 'flex';
  container.innerHTML = '';
  activeUpgrades = [];
  let shuffledTypes = [...UPGRADE_TYPES].sort(() => 0.5 - Math.random());
  let selectedTypes = shuffledTypes.slice(0, 3);
  selectedTypes.forEach((type, index) => {
    let upg = generateUpgradeStats(type);
    upg.typedIndex = 0;
    upg.id = index;
    activeUpgrades.push(upg);
    let card = document.createElement('div');
    card.id = `upg-card-${index}`;
    card.className = `card rarity-${upg.rarity}`;
    let shine = "";
    if (upg.rarity === 'legendary') shine = "box-shadow: 0 0 30px #fdcb6e inset;";
    if (upg.rarity === 'epic') shine = "box-shadow: 0 0 20px #9b59b6 inset;";
    if (upg.rarity === 'rare') shine = "box-shadow: 0 0 20px #3498db inset;";
    card.style = shine;
    card.innerHTML = `
      <div style="font-size:12px; color:#888;">${reasonTitle}</div>
      <h2 style="color:${UPGRADE_STATS[upg.rarity].color}; font-size:20px; margin: 10px 0;">
        ${upg.stats.name}
      </h2>
      <p>${getDesc(upg)}</p>
      <div class="rarity-tag" style="color:${UPGRADE_STATS[upg.rarity].color}">
        ${upg.rarity}
      </div>
    `;
    container.appendChild(card);
  });
}
function getDesc(upg) {
  const s = UPGRADE_STATS[upg.rarity];
  if (upg.stats.id === 'power') return `+${s.power} Power`;
  if (upg.stats.id === 'cap') return `+${s.cap} Storage`;
  if (upg.stats.id === 'xp') return `+${(s.xp * 100).toFixed(0)}% XP`;
  if (upg.stats.id === 'luck') return `+${s.luck} Luck`;
  return "Recover HP";
}
function generateUpgradeStats(typeDef) {
  const roll = Math.random() * 100;
  const luckBonus = Math.log10(player.luck) * 2;
  const T_LEGENDARY = 99.8 - luckBonus;
  const T_EPIC = 98.8 - luckBonus;
  const T_RARE = 93.8 - luckBonus;
  const T_UNCOMMON = 73.8 - luckBonus;
  let rarity = 'common';
  if (roll > T_LEGENDARY) rarity = 'legendary';
  else if (roll > T_EPIC) rarity = 'epic';
  else if (roll > T_RARE) rarity = 'rare';
  else if (roll > T_UNCOMMON) rarity = 'uncommon';
  return { stats: typeDef, rarity: rarity };
}
function updateTypingDisplay() {
  const display = document.getElementById('typing-display');
  if (!currentTypingTarget) {
    display.innerHTML = '<span class="pending-part">TYPE TO SELECT</span><span class="cursor">_</span>';
  } else {
    const name = currentTypingTarget.stats.name;
    display.innerHTML = `<span class="typed-part">${name.substring(0, currentTypingTarget.typedIndex)}</span><span class="pending-part">${name.substring(currentTypingTarget.typedIndex)}</span><span class="cursor">_</span>`;
  }
}
function selectUpgrade(upg) {
  if (upgradeLock) return;
  upgradeLock = true;
  const s = UPGRADE_STATS[upg.rarity];
  upg.stats.apply(s);
  spawnFloatingText(camera.x, camera.y, `${upg.stats.name} UP!`, "#fff");
  player.power = parseFloat(player.power.toFixed(1));
  player.luck = parseFloat(player.luck.toFixed(1));
  player.xpMultiplier = parseFloat(player.xpMultiplier.toFixed(1));

  isPaused = false;
  isUpgradeMenuOpen = false;
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('typing-display').style.display = 'none';
  updateUI();

  if (upgradeQueue.length > 0) {
    const next = upgradeQueue.shift();
    setTimeout(() => showUpgradeScreen(next), 200);
  } else {
    if (!mission.active && !boss.active) nextMission();
  }
}
function updateUI() {
  let hearts = "";
  for (let i = 0; i < player.maxHp; i++) hearts += (i < player.hp ? "❤️" : "🖤");
  document.getElementById('hp-container').innerText = hearts;
  const capEl = document.getElementById('cap-display');
  capEl.innerText = `${player.currentLoad.toFixed(1)} / ${player.capacity}`;
  capEl.style.color = player.currentLoad >= player.capacity ? "#e17055" : "#eee";
  document.getElementById('cap-warning').style.display = player.currentLoad >= player.capacity ? 'block' : 'none';
  document.getElementById('level-display').innerText = player.level;
  document.getElementById('power-display').innerText = player.power.toFixed(1);
  document.getElementById('luck-display').innerText = player.luck.toFixed(1);
  document.getElementById('mission-count').innerText = mission.totalCompleted + 1;
  const xpPct = (player.xp / player.maxXp) * 100;
  document.getElementById('xp-fill').style.width = `${xpPct}%`;
  document.getElementById('xp-text').innerText = `${Math.floor(player.xp)} / ${player.maxXp} XP`;
  document.getElementById('count-wood').innerText = Math.floor(player.inventory.wood);
  document.getElementById('count-iron').innerText = Math.floor(player.inventory.iron);
  document.getElementById('count-copper').innerText = Math.floor(player.inventory.copper);
  document.getElementById('count-silver').innerText = Math.floor(player.inventory.silver);
  document.getElementById('count-gold').innerText = Math.floor(player.inventory.gold);
  const panel = document.getElementById('mission-panel');
  const remainingNeeded = mission.target - mission.delivered;
  if (mission.active && player.inventory[mission.type] >= remainingNeeded) {
    panel.classList.add('ready-mode');
  } else {
    panel.classList.remove('ready-mode');
  }
}
function showMessage(html, callback) {
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById('message-box').style.display = 'block';
  document.getElementById('upgrade-container').style.display = 'none';
  document.getElementById('typing-display').style.display = 'none';
  document.getElementById('message-text').innerHTML = html;
  const btn = document.getElementById('msg-btn');
  btn.style.display = 'inline-block';
  btn.onclick = () => {
    document.getElementById('modal-overlay').style.display = 'none';
    if (callback) callback();
  };
}
function resize() {
  const dpr = window.devicePixelRatio || 1;
  world.width = window.innerWidth * dpr;
  world.height = window.innerHeight * dpr;
  world.style.width = window.innerWidth + "px";
  world.style.height = window.innerHeight + "px";
}
window.addEventListener('resize', resize);
window.addEventListener('contextmenu', e => { if (e.target.id === 'world') e.preventDefault(); });
window.addEventListener('mousemove', e => {
  const mx = e.clientX;
  const my = e.clientY;
  const viewCX = window.innerWidth / 2 + shakeOffset.x;
  const viewCY = window.innerHeight / 2 + shakeOffset.y;
  const wx = (mx - viewCX) / zoom + camera.x;
  const wy = (my - viewCY) / zoom + camera.y;
  const dist = Math.sqrt(wx * wx + wy * wy);
  isHoveringCore = (dist < GRID_SIZE * 1.5);
  let isHoveringBoss = false;
  if (boss.active && Math.abs(wx) < GRID_SIZE * 2 && Math.abs(wy) < GRID_SIZE * 2) isHoveringBoss = true;
  if (isHoveringCore && !boss.active) world.style.cursor = "pointer";
  else if (isHoveringBoss && !boss.minigameActive) world.style.cursor = "crosshair";
  else if (boss.minigameActive && boss.minigameType === 'AIM') world.style.cursor = "default";
  else if (isDragging) world.style.cursor = "grabbing";
  else world.style.cursor = "default";
  if (isDragging) {
    camera.x -= (mx - lastMousePos.x) / zoom;
    camera.y -= (my - lastMousePos.y) / zoom;
    lastMousePos = { x: mx, y: my };
  }
});
window.addEventListener('mousedown', e => {
  if (e.button === 2) {
    isDragging = true;
    lastMousePos = { x: e.clientX, y: e.clientY };
    world.style.cursor = "grabbing";
  }
  else if (e.button === 0) {
    if (isUpgradeMenuOpen || document.getElementById('start-screen').style.display !== 'none') {
      return;
    }
    const mx = e.clientX;
    const my = e.clientY;
    const viewCX = window.innerWidth / 2 + shakeOffset.x;
    const viewCY = window.innerHeight / 2 + shakeOffset.y;
    const wx = (mx - viewCX) / zoom + camera.x;
    const wy = (my - viewCY) / zoom + camera.y;
    spawnParticles(wx, wy, 2, "rgba(255,255,255,0.5)");
    if (boss.active && boss.minigameActive) {
      if (boss.minigameType === 'AIM') clickAimTarget(wx, wy);
      return;
    }
    if (boss.active && Math.abs(wx) < GRID_SIZE * 2 && Math.abs(wy) < GRID_SIZE * 2) {
      clickBoss();
      return;
    }
    if (isHoveringCore && !boss.active) attemptDelivery();
    else mineAt(wx, wy);
  }
});
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('wheel', e => { zoom = Math.min(Math.max(zoom - e.deltaY * 0.001, 0.4), 1.6); }, { passive: false });
resize();
requestAnimationFrame(gameLoop);
