/**
 * NEO INVADERS: Main Game Engine & Controller
 * Orchestrates game states, waves, collision detection, combo multiplier, and UI events.
 */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Subsystems
    this.audio = window.soundEngine;
    this.particles = new ParticleEngine(this.canvas);
    this.player = new Player(this.canvas.width, this.canvas.height);

    // State
    this.state = 'TITLE'; // 'TITLE', 'PLAYING', 'WAVE_CLEAR', 'PAUSED', 'GAMEOVER'
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('neo_invaders_hi_score') || '0', 10);
    this.wave = 1;
    
    // Stats for Game Over screen
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.maxCombo = 1.0;

    // Combo system
    this.combo = 1.0;
    this.comboTimer = 0;
    this.maxComboDuration = 180; // 3s at 60fps

    // Invader Fleet State
    this.invaders = [];
    this.invaderDirection = 1;
    this.invaderStepTimer = 0;
    this.invaderStepInterval = 45; // Frames per step
    this.invaderFrame = 0;
    this.invaderDropDistance = 18;
    this.invaderFireChance = 0.015;

    // UFO State
    this.ufo = null;
    this.ufoTimer = 0;
    this.ufoSpawnInterval = 1200; // ~20s

    // Game Elements
    this.bunkers = [];
    this.bullets = [];
    this.powerups = [];

    // Inputs
    this.keys = {
      left: false,
      right: false,
      fire: false,
      special: false
    };

    // UI Elements
    this.dom = {
      score: document.getElementById('score-display'),
      highScore: document.getElementById('high-score-display'),
      wave: document.getElementById('wave-display'),
      combo: document.getElementById('combo-display'),
      comboFill: document.getElementById('combo-bar-fill'),
      livesIcons: document.getElementById('lives-icons'),
      specialFill: document.getElementById('special-meter-fill'),
      specialHint: document.getElementById('special-hint'),
      titleScreen: document.getElementById('title-screen'),
      pauseScreen: document.getElementById('pause-screen'),
      gameoverScreen: document.getElementById('gameover-screen'),
      waveBanner: document.getElementById('wave-banner'),
      waveBannerTitle: document.getElementById('wave-banner-title'),
      finalScore: document.getElementById('final-score'),
      finalWave: document.getElementById('final-wave'),
      finalCombo: document.getElementById('final-combo'),
      finalAccuracy: document.getElementById('final-accuracy'),
      newRecordBanner: document.getElementById('new-record-banner'),
      btnStart: document.getElementById('btn-start'),
      btnResume: document.getElementById('btn-resume'),
      btnRestartPause: document.getElementById('btn-restart-pause'),
      btnRetry: document.getElementById('btn-retry'),
      btnSound: document.getElementById('btn-sound'),
      iconSoundOn: document.getElementById('icon-sound-on'),
      iconSoundOff: document.getElementById('icon-sound-off'),
      btnPause: document.getElementById('btn-pause')
    };

    this.initEventListeners();
    this.initTouchControls();
    this.drawEnemyPreviews();
    this.updateHUD();

    // Start Main Animation Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // --- INITIALIZATION ---

  initEventListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.audio.ensureContext();

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
      if (e.code === 'Space' || e.code === 'KeyJ') {
        this.keys.fire = true;
        e.preventDefault();
      }
      if (e.code === 'KeyX' || e.code === 'KeyK') {
        this.triggerSpecial();
        e.preventDefault();
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
        e.preventDefault();
      }
      if (e.code === 'KeyM') {
        this.toggleSound();
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
      if (e.code === 'Space' || e.code === 'KeyJ') this.keys.fire = false;
    });

    // Buttons
    this.dom.btnStart.addEventListener('click', () => {
      this.audio.ensureContext();
      this.startGame();
    });

    this.dom.btnResume.addEventListener('click', () => {
      this.togglePause();
    });

    this.dom.btnRestartPause.addEventListener('click', () => {
      this.dom.pauseScreen.classList.add('hidden');
      this.startGame();
    });

    this.dom.btnRetry.addEventListener('click', () => {
      this.audio.ensureContext();
      this.startGame();
    });

    this.dom.btnSound.addEventListener('click', () => {
      this.toggleSound();
    });

    this.dom.btnPause.addEventListener('click', () => {
      this.togglePause();
    });
  }

  initTouchControls() {
    const bindTouch = (btnId, onDown, onUp) => {
      const el = document.getElementById(btnId);
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.audio.ensureContext();
        onDown();
      }, { passive: false });

      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        onUp();
      }, { passive: false });

      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.audio.ensureContext();
        onDown();
      });

      el.addEventListener('mouseup', (e) => {
        e.preventDefault();
        onUp();
      });
    };

    bindTouch('touch-left', () => this.keys.left = true, () => this.keys.left = false);
    bindTouch('touch-right', () => this.keys.right = true, () => this.keys.right = false);
    bindTouch('touch-fire', () => this.keys.fire = true, () => this.keys.fire = false);
    bindTouch('touch-special', () => this.triggerSpecial(), () => {});
  }

  toggleSound() {
    const isMuted = this.audio.toggleMute();
    if (isMuted) {
      this.dom.iconSoundOn.classList.add('hidden');
      this.dom.iconSoundOff.classList.remove('hidden');
    } else {
      this.dom.iconSoundOn.classList.remove('hidden');
      this.dom.iconSoundOff.classList.add('hidden');
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.audio.stopMarch();
      this.dom.pauseScreen.classList.remove('hidden');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.audio.startMarch();
      this.dom.pauseScreen.classList.add('hidden');
    }
  }

  drawEnemyPreviews() {
    const drawTo = (canvasId, type, color) => {
      const c = document.getElementById(canvasId);
      if (!c) return;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);
      if (type === 'ufo') {
        const u = new UFO(c.width);
        u.x = (c.width - u.width) / 2;
        u.y = (c.height - u.height) / 2;
        u.draw(ctx);
      } else {
        drawVectorAlien(ctx, type, 0, 4, 4, 28, 26, color);
      }
    };

    drawTo('preview-alien-1', 0, '#00f0ff');
    drawTo('preview-alien-2', 1, '#00ff9d');
    drawTo('preview-alien-3', 2, '#ffb800');
    drawTo('preview-ufo', 'ufo', '#ff2a5f');
  }

  // --- GAME LIFE CYCLE ---

  startGame() {
    this.score = 0;
    this.wave = 1;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.combo = 1.0;
    this.maxCombo = 1.0;
    this.comboTimer = 0;

    this.player.reset(true);
    this.particles.clear();
    this.initWave(1);

    this.dom.titleScreen.classList.add('hidden');
    this.dom.gameoverScreen.classList.add('hidden');
    this.dom.pauseScreen.classList.add('hidden');
    this.dom.waveBanner.classList.add('hidden');

    this.state = 'PLAYING';
    this.audio.startMarch();
    this.updateHUD();
  }

  initWave(waveNum) {
    this.wave = waveNum;
    this.bullets = [];
    this.powerups = [];
    this.ufo = null;
    this.ufoTimer = 0;
    this.audio.stopUfoSound();

    // Create Invader Grid: 5 rows x 10 cols
    this.invaders = [];
    const rows = 5;
    const cols = 10;
    const spacingX = 52;
    const spacingY = 40;
    const startX = (this.canvas.width - (cols - 1) * spacingX - 34) / 2;
    const startY = 90 + Math.min((waveNum - 1) * 12, 60);

    for (let r = 0; r < rows; r++) {
      let type = 0; // Octo
      if (r >= 1 && r <= 2) type = 1; // Crab
      if (r >= 3) type = 2; // Squid

      for (let c = 0; c < cols; c++) {
        const x = startX + c * spacingX;
        const y = startY + r * spacingY;
        this.invaders.push(new Invader(x, y, type, r, c));
      }
    }

    this.invaderDirection = 1;
    this.invaderStepInterval = Math.max(12, 48 - (waveNum - 1) * 4);
    this.invaderFireChance = Math.min(0.045, 0.015 + waveNum * 0.005);
    this.invaderStepTimer = 0;
    this.invaderFrame = 0;

    // Build or repair Bunkers (4 bunkers across bottom)
    this.initBunkers();

    this.audio.updateMarchSpeed(1.0);
  }

  initBunkers() {
    this.bunkers = [];
    const bunkerCount = 4;
    const bunkerSpacing = this.canvas.width / (bunkerCount + 1);
    const bunkerY = this.canvas.height - 150;

    for (let i = 1; i <= bunkerCount; i++) {
      const bunker = new Bunker(i * bunkerSpacing - 32, bunkerY, 16, 12, 4);
      this.bunkers.push(bunker);
    }
  }

  nextWave() {
    this.state = 'WAVE_CLEAR';
    this.audio.stopMarch();
    this.audio.stopUfoSound();
    this.audio.playWaveClear();

    this.particles.setWarpSpeed(8.0);
    this.dom.waveBannerTitle.innerText = `SECTOR ${String(this.wave).padStart(2, '0')} CLEARED`;
    this.dom.waveBanner.classList.remove('hidden');

    setTimeout(() => {
      this.dom.waveBanner.classList.add('hidden');
      this.particles.setWarpSpeed(1.0);
      this.initWave(this.wave + 1);
      this.state = 'PLAYING';
      this.audio.startMarch();
      this.updateHUD();
    }, 2500);
  }

  gameOver() {
    this.state = 'GAMEOVER';
    this.audio.stopMarch();
    this.audio.stopUfoSound();
    this.audio.playPlayerHit();

    // Check High Score
    const isNewRecord = this.score > this.highScore;
    if (isNewRecord) {
      this.highScore = this.score;
      localStorage.setItem('neo_invaders_hi_score', this.highScore.toString());
      this.dom.newRecordBanner.classList.remove('hidden');
    } else {
      this.dom.newRecordBanner.classList.add('hidden');
    }

    const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;

    this.dom.finalScore.innerText = String(this.score).padStart(6, '0');
    this.dom.finalWave.innerText = `WAVE ${String(this.wave).padStart(2, '0')}`;
    this.dom.finalCombo.innerText = `x${this.maxCombo.toFixed(1)}`;
    this.dom.finalAccuracy.innerText = `${accuracy}%`;

    this.dom.gameoverScreen.classList.remove('hidden');
    this.updateHUD();
  }

  // --- COMBAT & SPECIAL ---

  triggerSpecial() {
    if (this.state !== 'PLAYING') return;
    if (this.player.specialCharge < this.player.maxSpecialCharge) return;

    this.player.specialCharge = 0;
    this.audio.playEmpBlast();
    this.particles.createEmpWave(this.player.x + this.player.width / 2, this.player.y);
    this.particles.addShake(15);

    // Destroy all enemy bullets
    for (const b of this.bullets) {
      if (b.source === 'enemy') {
        b.isAlive = false;
        this.particles.createSparks(b.x, b.y, '#ff2a5f', 6);
      }
    }

    // Damage / destroy multiple invaders
    let destroyedCount = 0;
    const livingInvaders = this.invaders.filter(inv => inv.isAlive);
    const targetCount = Math.ceil(livingInvaders.length * 0.5);

    for (let i = 0; i < targetCount && i < livingInvaders.length; i++) {
      const inv = livingInvaders[i];
      inv.isAlive = false;
      destroyedCount++;
      this.particles.createExplosion(inv.x + inv.width / 2, inv.y + inv.height / 2, inv.color, 20);
      this.score += Math.round(inv.points * this.combo);
    }

    if (this.ufo && this.ufo.isAlive) {
      this.ufo.isAlive = false;
      this.audio.stopUfoSound();
      this.particles.createExplosion(this.ufo.x + this.ufo.width / 2, this.ufo.y + this.ufo.height / 2, '#ff2a5f', 35, 1.5);
      this.score += Math.round(this.ufo.points * this.combo);
    }

    this.particles.addFloatingText(`EMP STRIKE! +${destroyedCount * 20}`, this.player.x, this.player.y - 40, '#ffb800', 18);
    this.updateHUD();

    if (this.invaders.every(inv => !inv.isAlive)) {
      this.nextWave();
    }
  }

  spawnPowerup(x, y) {
    if (Math.random() < 0.15) { // 15% drop rate
      const types = ['spread', 'rapid', 'shield', 'emp'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.powerups.push(new PowerUp(x, y, type));
    }
  }

  addCombo() {
    this.combo = Math.min(4.0, parseFloat((this.combo + 0.1).toFixed(1)));
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.comboTimer = this.maxComboDuration;
    this.audio.playCombo(this.combo);
  }

  resetCombo() {
    this.combo = 1.0;
    this.comboTimer = 0;
  }

  // --- UPDATE LOOP ---

  update(dt) {
    this.particles.update();

    if (this.state !== 'PLAYING') return;

    // Update Combo Timer
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }

    // Player Update
    this.player.update(this.keys, this.particles);

    // Player Fire
    if (this.keys.fire && this.player.canFire()) {
      const newBullets = this.player.fire();
      this.bullets.push(...newBullets);
      this.shotsFired += newBullets.length;
      this.audio.playLaser(this.player.weaponType === 'spread');
      this.particles.createSparks(this.player.x + this.player.width / 2, this.player.y, '#00f0ff', 4, -1);
    }

    // Update Invaders
    this.updateInvaders();

    // Update UFO
    this.updateUFO();

    // Update Projectiles
    this.updateBullets();

    // Update PowerUps
    this.updatePowerUps();

    // Check Collisions
    this.checkCollisions();

    // Update HUD
    this.updateHUD();
  }

  updateInvaders() {
    const living = this.invaders.filter(inv => inv.isAlive);
    if (living.length === 0) {
      this.nextWave();
      return;
    }

    // Update speed based on remaining invaders
    const livingRatio = living.length / 50;
    this.audio.updateMarchSpeed(livingRatio);

    this.invaderStepTimer++;
    const currentInterval = Math.max(4, Math.floor(this.invaderStepInterval * livingRatio));

    if (this.invaderStepTimer >= currentInterval) {
      this.invaderStepTimer = 0;
      this.invaderFrame = 1 - this.invaderFrame;

      // Check bounds
      let hitEdge = false;
      const stepX = 10 * this.invaderDirection;

      for (const inv of living) {
        const nextX = inv.x + stepX;
        if (nextX < 15 || nextX + inv.width > this.canvas.width - 15) {
          hitEdge = true;
          break;
        }
      }

      if (hitEdge) {
        this.invaderDirection *= -1;
        for (const inv of living) {
          inv.y += this.invaderDropDistance;
          // Check invasion bottom limit (reached player or bunkers)
          if (inv.y + inv.height >= this.player.y) {
            this.gameOver();
            return;
          }
        }
      } else {
        for (const inv of living) {
          inv.x += stepX;
        }
      }
    }

    // Enemy Firing
    if (Math.random() < this.invaderFireChance) {
      // Pick random bottom-most invader in a column
      const cols = {};
      for (const inv of living) {
        if (!cols[inv.col] || cols[inv.col].row < inv.row) {
          cols[inv.col] = inv;
        }
      }
      const shooters = Object.values(cols);
      if (shooters.length > 0) {
        const shooter = shooters[Math.floor(Math.random() * shooters.length)];
        this.bullets.push(new Bullet(shooter.x + shooter.width / 2, shooter.y + shooter.height, 0, 5 + this.wave * 0.3, 'enemy', '#ff2a5f', 3, 12));
        this.audio.playEnemyLaser();
      }
    }
  }

  updateUFO() {
    if (!this.ufo) {
      this.ufoTimer++;
      if (this.ufoTimer >= this.ufoSpawnInterval) {
        this.ufo = new UFO(this.canvas.width);
        this.ufoTimer = 0;
        this.audio.startUfoSound();
      }
    } else {
      this.ufo.update();
      if (!this.ufo.isAlive) {
        this.audio.stopUfoSound();
        this.ufo = null;
      }
    }
  }

  updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.update();

      // Check bounds
      if (b.y < -20 || b.y > this.canvas.height + 20 || b.x < -20 || b.x > this.canvas.width + 20) {
        b.isAlive = false;
        this.bullets.splice(i, 1);
      }
    }
  }

  updatePowerUps() {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.update();
      if (p.y > this.canvas.height + 30) {
        p.isAlive = false;
        this.powerups.splice(i, 1);
      }
    }
  }

  // --- COLLISION DETECTION ---

  checkCollisions() {
    // 1. Player Bullets vs Invaders & UFO & Bunkers
    for (const b of this.bullets) {
      if (!b.isAlive) continue;

      if (b.source === 'player') {
        // vs Invaders
        for (const inv of this.invaders) {
          if (!inv.isAlive) continue;

          if (b.x >= inv.x && b.x <= inv.x + inv.width &&
              b.y >= inv.y && b.y <= inv.y + inv.height) {
            
            b.isAlive = false;
            inv.isAlive = false;
            this.shotsHit++;

            this.audio.playAlienExplode();
            this.particles.createExplosion(inv.x + inv.width / 2, inv.y + inv.height / 2, inv.color, 18);
            this.particles.addShake(3);

            const pts = Math.round(inv.points * this.combo);
            this.score += pts;
            this.player.addCharge(8);
            this.addCombo();

            this.particles.addFloatingText(`+${pts}`, inv.x + inv.width / 2, inv.y, inv.color, 14);
            this.spawnPowerup(inv.x + inv.width / 2, inv.y + inv.height / 2);
            break;
          }
        }

        // vs UFO
        if (b.isAlive && this.ufo && this.ufo.isAlive) {
          if (b.x >= this.ufo.x && b.x <= this.ufo.x + this.ufo.width &&
              b.y >= this.ufo.y && b.y <= this.ufo.y + this.ufo.height) {

            b.isAlive = false;
            this.ufo.isAlive = false;
            this.shotsHit++;
            this.audio.stopUfoSound();
            this.audio.playAlienExplode();

            this.particles.createExplosion(this.ufo.x + this.ufo.width / 2, this.ufo.y + this.ufo.height / 2, '#ff2a5f', 35, 1.6);
            this.particles.addShake(8);

            const pts = Math.round(this.ufo.points * this.combo);
            this.score += pts;
            this.player.addCharge(25);
            this.addCombo();

            this.particles.addFloatingText(`UFO +${pts}!`, this.ufo.x + this.ufo.width / 2, this.ufo.y, '#ffb800', 20);
            this.spawnPowerup(this.ufo.x + this.ufo.width / 2, this.ufo.y + this.ufo.height / 2);
          }
        }

        // vs Bunkers (Player shots degrade top/bottom of bunker)
        if (b.isAlive) {
          for (const bunker of this.bunkers) {
            if (bunker.checkCollision(b.x, b.y, 2, 2)) {
              b.isAlive = false;
              this.audio.playShieldHit();
              this.particles.createSparks(b.x, b.y, '#00ff9d', 6, 1);
              break;
            }
          }
        }

      } else if (b.source === 'enemy') {
        // Enemy Bullets vs Player
        if (this.player.invulnerableTimer <= 0) {
          const px = this.player.x;
          const py = this.player.y;
          const pw = this.player.width;
          const ph = this.player.height;

          if (b.x >= px && b.x <= px + pw && b.y >= py && b.y <= py + ph) {
            b.isAlive = false;

            if (this.player.hasShield) {
              this.player.hasShield = false;
              this.audio.playShieldHit();
              this.particles.createExplosion(this.player.x + pw / 2, this.player.y + ph / 2, '#00ff9d', 20);
              this.particles.addFloatingText('SHIELD BROKEN!', this.player.x + pw / 2, this.player.y - 20, '#00ff9d', 14);
              this.particles.addShake(6);
            } else {
              this.player.lives--;
              this.resetCombo();
              this.particles.createExplosion(this.player.x + pw / 2, this.player.y + ph / 2, '#00f0ff', 35, 1.4);
              this.particles.addShake(15);
              this.audio.playPlayerHit();

              if (this.player.lives <= 0) {
                this.gameOver();
                return;
              } else {
                this.player.reset(false);
              }
            }
          }
        }

        // Enemy Bullets vs Bunkers
        if (b.isAlive) {
          for (const bunker of this.bunkers) {
            if (bunker.checkCollision(b.x, b.y, 2, 2)) {
              b.isAlive = false;
              this.audio.playShieldHit();
              this.particles.createSparks(b.x, b.y, '#ff2a5f', 6, -1);
              break;
            }
          }
        }
      }
    }

    // 2. Player vs PowerUps
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      const dist = Math.hypot(p.x - (this.player.x + this.player.width / 2), p.y - (this.player.y + this.player.height / 2));
      if (dist < 28) {
        p.isAlive = false;
        this.powerups.splice(i, 1);
        this.player.activatePowerup(p.type);
        this.audio.playPowerup();
        this.particles.createExplosion(p.x, p.y, p.colors[p.type] || '#ffffff', 20);
        
        const names = { spread: '3-WAY SPREAD!', rapid: 'RAPID LASER!', shield: 'SHIELD CHARGED!', emp: 'EMP READY!' };
        this.particles.addFloatingText(names[p.type] || 'POWER UP!', p.x, p.y - 20, p.colors[p.type] || '#ffffff', 16);
      }
    }
  }

  // --- UI & HUD UPDATE ---

  updateHUD() {
    this.dom.score.innerText = String(this.score).padStart(6, '0');
    this.dom.highScore.innerText = String(this.highScore).padStart(6, '0');
    this.dom.wave.innerText = String(this.wave).padStart(2, '0');

    // Combo
    this.dom.combo.innerText = `x${this.combo.toFixed(1)}`;
    const comboRatio = this.comboTimer / this.maxComboDuration;
    this.dom.comboFill.style.width = `${comboRatio * 100}%`;

    // Special meter
    const specialRatio = (this.player.specialCharge / this.player.maxSpecialCharge) * 100;
    this.dom.specialFill.style.width = `${specialRatio}%`;
    if (this.player.specialCharge >= this.player.maxSpecialCharge) {
      this.dom.specialHint.innerText = 'READY [SPACE x2 / X]';
      this.dom.specialHint.classList.add('ready');
    } else {
      this.dom.specialHint.innerText = `OVERCHARGE: ${Math.round(specialRatio)}%`;
      this.dom.specialHint.classList.remove('ready');
    }

    // Lives icons
    this.dom.livesIcons.innerHTML = '';
    for (let i = 0; i < Math.max(0, this.player.lives); i++) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('class', 'life-icon');
      svg.innerHTML = '<path fill="#00f0ff" d="M12 2L4 20l8-4 8 4L12 2z"/>';
      this.dom.livesIcons.appendChild(svg);
    }
  }

  // --- RENDER LOOP ---

  render() {
    const ctx = this.ctx;
    ctx.save();

    // Apply Camera Shake
    ctx.translate(this.particles.shakeX, this.particles.shakeY);

    // Clear Screen
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Render Dynamic Starfield
    this.particles.renderStars();

    // 2. Render Bunkers
    for (const bunker of this.bunkers) {
      bunker.draw(ctx);
    }

    // 3. Render Invaders
    for (const inv of this.invaders) {
      inv.draw(ctx, this.invaderFrame);
    }

    // 4. Render UFO
    if (this.ufo) {
      this.ufo.draw(ctx);
    }

    // 5. Render PowerUps
    for (const p of this.powerups) {
      p.draw(ctx);
    }

    // 6. Render Projectiles
    for (const b of this.bullets) {
      b.draw(ctx);
    }

    // 7. Render Player
    if (this.state === 'PLAYING' || this.state === 'WAVE_CLEAR' || this.state === 'PAUSED') {
      this.player.draw(ctx);
    }

    // 8. Render Visual Effects (Shockwaves, Sparks, Floating Text)
    this.particles.renderFX();

    ctx.restore();
  }

  gameLoop(timestamp) {
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Instantiate game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine();
});
