/**
 * NEO INVADERS: Entities (Player, Invaders, UFO, Bunkers, Projectiles, PowerUps)
 * Custom vector-rendered models with glowing aesthetics and smooth physics.
 */

// --- VECTOR SPRITE DRAW HELPERS ---

function drawVectorAlien(ctx, type, frame, x, y, width, height, color) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = width / 2;
  const h = height / 2;

  if (type === 0) {
    // Octo Scout (Top rows)
    ctx.beginPath();
    // Head / Mantle
    ctx.moveTo(-w * 0.5, -h * 0.8);
    ctx.lineTo(w * 0.5, -h * 0.8);
    ctx.lineTo(w * 0.8, -h * 0.2);
    ctx.lineTo(w * 0.5, h * 0.2);
    ctx.lineTo(-w * 0.5, h * 0.2);
    ctx.lineTo(-w * 0.8, -h * 0.2);
    ctx.closePath();
    ctx.stroke();

    // Eyes
    ctx.fillRect(-w * 0.4, -h * 0.4, 3, 3);
    ctx.fillRect(w * 0.4 - 3, -h * 0.4, 3, 3);

    // Tentacles / Legs (Animated frame 0 / 1)
    ctx.beginPath();
    if (frame === 0) {
      ctx.moveTo(-w * 0.6, h * 0.2);
      ctx.lineTo(-w * 0.9, h * 0.9);
      ctx.moveTo(-w * 0.2, h * 0.2);
      ctx.lineTo(-w * 0.3, h * 0.8);
      ctx.moveTo(w * 0.2, h * 0.2);
      ctx.lineTo(w * 0.3, h * 0.8);
      ctx.moveTo(w * 0.6, h * 0.2);
      ctx.lineTo(w * 0.9, h * 0.9);
    } else {
      ctx.moveTo(-w * 0.6, h * 0.2);
      ctx.lineTo(-w * 0.3, h * 0.9);
      ctx.moveTo(-w * 0.2, h * 0.2);
      ctx.lineTo(-w * 0.6, h * 0.8);
      ctx.moveTo(w * 0.2, h * 0.2);
      ctx.lineTo(w * 0.6, h * 0.8);
      ctx.moveTo(w * 0.6, h * 0.2);
      ctx.lineTo(w * 0.3, h * 0.9);
    }
    ctx.stroke();

  } else if (type === 1) {
    // Crab Striker (Mid rows)
    ctx.beginPath();
    // Central shell
    ctx.moveTo(0, -h * 0.8);
    ctx.lineTo(w * 0.7, -h * 0.2);
    ctx.lineTo(w * 0.5, h * 0.4);
    ctx.lineTo(-w * 0.5, h * 0.4);
    ctx.lineTo(-w * 0.7, -h * 0.2);
    ctx.closePath();
    ctx.stroke();

    // Antennae
    ctx.beginPath();
    ctx.moveTo(-w * 0.3, -h * 0.8);
    ctx.lineTo(-w * 0.6, -h);
    ctx.moveTo(w * 0.3, -h * 0.8);
    ctx.lineTo(w * 0.6, -h);
    ctx.stroke();

    // Eyes
    ctx.fillRect(-w * 0.3, -h * 0.1, 4, 3);
    ctx.fillRect(w * 0.3 - 4, -h * 0.1, 4, 3);

    // Claws
    ctx.beginPath();
    if (frame === 0) {
      ctx.moveTo(-w * 0.7, -h * 0.2);
      ctx.lineTo(-w, -h * 0.4);
      ctx.lineTo(-w * 0.9, h * 0.2);

      ctx.moveTo(w * 0.7, -h * 0.2);
      ctx.lineTo(w, -h * 0.4);
      ctx.lineTo(w * 0.9, h * 0.2);

      ctx.moveTo(-w * 0.4, h * 0.4);
      ctx.lineTo(-w * 0.6, h * 0.9);
      ctx.moveTo(w * 0.4, h * 0.4);
      ctx.lineTo(w * 0.6, h * 0.9);
    } else {
      ctx.moveTo(-w * 0.7, -h * 0.2);
      ctx.lineTo(-w * 0.9, 0);
      ctx.lineTo(-w, h * 0.5);

      ctx.moveTo(w * 0.7, -h * 0.2);
      ctx.lineTo(w * 0.9, 0);
      ctx.lineTo(w, h * 0.5);

      ctx.moveTo(-w * 0.4, h * 0.4);
      ctx.lineTo(-w * 0.2, h * 0.9);
      ctx.moveTo(w * 0.4, h * 0.4);
      ctx.lineTo(w * 0.2, h * 0.9);
    }
    ctx.stroke();

  } else {
    // Squid Overlord (Bottom rows)
    ctx.beginPath();
    // Sleek triangular body
    ctx.moveTo(0, -h);
    ctx.lineTo(w * 0.8, h * 0.1);
    ctx.lineTo(w * 0.3, h * 0.4);
    ctx.lineTo(-w * 0.3, h * 0.4);
    ctx.lineTo(-w * 0.8, h * 0.1);
    ctx.closePath();
    ctx.stroke();

    // Core Gem
    ctx.beginPath();
    ctx.arc(0, -h * 0.1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Lasers / Wings
    ctx.beginPath();
    if (frame === 0) {
      ctx.moveTo(-w * 0.6, h * 0.2);
      ctx.lineTo(-w * 0.8, h * 0.9);
      ctx.moveTo(0, h * 0.4);
      ctx.lineTo(0, h * 0.8);
      ctx.moveTo(w * 0.6, h * 0.2);
      ctx.lineTo(w * 0.8, h * 0.9);
    } else {
      ctx.moveTo(-w * 0.6, h * 0.2);
      ctx.lineTo(-w * 0.3, h * 0.9);
      ctx.moveTo(0, h * 0.4);
      ctx.lineTo(0, h);
      ctx.moveTo(w * 0.6, h * 0.2);
      ctx.lineTo(w * 0.3, h * 0.9);
    }
    ctx.stroke();
  }

  ctx.restore();
}

// --- PLAYER FIGHTER ---

class Player {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.width = 44;
    this.height = 36;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - 65;
    
    this.vx = 0;
    this.speed = 7.5;
    this.friction = 0.82;
    
    this.lives = 3;
    this.invulnerableTimer = 0;
    this.hasShield = false;
    
    // Weapon State
    this.weaponType = 'standard'; // 'standard', 'spread', 'rapid'
    this.weaponTimer = 0;
    this.fireCooldown = 0;
    
    // EMP Special Ability
    this.specialCharge = 0;
    this.maxSpecialCharge = 100;
  }

  reset(full = false) {
    this.x = this.canvasWidth / 2 - this.width / 2;
    this.vx = 0;
    this.invulnerableTimer = 120; // 2 seconds at 60fps
    this.weaponType = 'standard';
    this.weaponTimer = 0;
    this.hasShield = false;
    if (full) {
      this.lives = 3;
      this.specialCharge = 0;
    }
  }

  addCharge(amount) {
    this.specialCharge = Math.min(this.maxSpecialCharge, this.specialCharge + amount);
  }

  activatePowerup(type) {
    if (type === 'spread') {
      this.weaponType = 'spread';
      this.weaponTimer = 600; // 10s
    } else if (type === 'rapid') {
      this.weaponType = 'rapid';
      this.weaponTimer = 600;
    } else if (type === 'shield') {
      this.hasShield = true;
    } else if (type === 'emp') {
      this.specialCharge = this.maxSpecialCharge;
    }
  }

  update(keys, particleEngine) {
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;
    if (this.fireCooldown > 0) this.fireCooldown--;

    if (this.weaponTimer > 0) {
      this.weaponTimer--;
      if (this.weaponTimer <= 0) {
        this.weaponType = 'standard';
      }
    }

    // Movement
    if (keys.left) {
      this.vx -= 1.2;
    }
    if (keys.right) {
      this.vx += 1.2;
    }

    this.vx = Math.max(-this.speed, Math.min(this.speed, this.vx));
    this.x += this.vx;
    this.vx *= this.friction;

    // Canvas boundary clamping
    if (this.x < 15) {
      this.x = 15;
      this.vx = 0;
    } else if (this.x > this.canvasWidth - this.width - 15) {
      this.x = this.canvasWidth - this.width - 15;
      this.vx = 0;
    }

    // Engine exhaust particles
    if (particleEngine && Math.random() > 0.3) {
      particleEngine.createThrusterFlame(
        this.x + this.width / 2,
        this.y + this.height - 4,
        this.vx
      );
    }
  }

  canFire() {
    return this.fireCooldown <= 0;
  }

  fire() {
    const rate = this.weaponType === 'rapid' ? 8 : 15;
    this.fireCooldown = rate;

    const bullets = [];
    const midX = this.x + this.width / 2;
    const topY = this.y;

    if (this.weaponType === 'spread') {
      bullets.push(new Bullet(midX - 12, topY, -1.8, -12, 'player', '#00f0ff'));
      bullets.push(new Bullet(midX, topY - 4, 0, -13, 'player', '#00f0ff'));
      bullets.push(new Bullet(midX + 12, topY, 1.8, -12, 'player', '#00f0ff'));
    } else if (this.weaponType === 'rapid') {
      bullets.push(new Bullet(midX - 6, topY, 0, -15, 'player', '#ffb800', 3, 16));
      bullets.push(new Bullet(midX + 6, topY, 0, -15, 'player', '#ffb800', 3, 16));
    } else {
      // Standard
      bullets.push(new Bullet(midX, topY, 0, -13, 'player', '#00f0ff', 3, 14));
    }

    return bullets;
  }

  draw(ctx) {
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 6) % 2 === 0) {
      return; // Flash effect
    }

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Roll tilt
    const tilt = (this.vx / this.speed) * 0.18;
    ctx.rotate(tilt);

    const w = this.width / 2;
    const h = this.height / 2;

    // Glowing main hull
    ctx.strokeStyle = '#00f0ff';
    ctx.fillStyle = '#0e1828';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Nose
    ctx.moveTo(0, -h);
    // Right wing
    ctx.lineTo(w * 0.35, -h * 0.2);
    ctx.lineTo(w, h * 0.6);
    ctx.lineTo(w * 0.8, h);
    ctx.lineTo(w * 0.3, h * 0.5);
    // Center engine bay
    ctx.lineTo(0, h * 0.7);
    // Left wing
    ctx.lineTo(-w * 0.3, h * 0.5);
    ctx.lineTo(-w * 0.8, h);
    ctx.lineTo(-w, h * 0.6);
    ctx.lineTo(-w * 0.35, -h * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit Canopy
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.6);
    ctx.lineTo(w * 0.2, 0);
    ctx.lineTo(0, h * 0.2);
    ctx.lineTo(-w * 0.2, 0);
    ctx.closePath();
    ctx.fill();

    // Wingtip Cannons
    ctx.fillStyle = '#ffb800';
    ctx.fillRect(w * 0.85 - 2, h * 0.3, 3, 8);
    ctx.fillRect(-w * 0.85 - 1, h * 0.3, 3, 8);

    // Energy Shield Bubble (if active)
    if (this.hasShield) {
      ctx.strokeStyle = '#00ff9d';
      ctx.shadowColor = '#00ff9d';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 1.35, h * 1.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// --- INVADER ALIEN ---

class Invader {
  constructor(x, y, type, row, col) {
    this.x = x;
    this.y = y;
    this.type = type; // 0: Scout, 1: Striker, 2: Overlord
    this.row = row;
    this.col = col;
    this.width = 34;
    this.height = 26;
    this.isAlive = true;

    // Points based on type
    this.points = type === 0 ? 10 : type === 1 ? 20 : 30;
    this.color = type === 0 ? '#00f0ff' : type === 1 ? '#00ff9d' : '#ffb800';
  }

  draw(ctx, frame) {
    if (!this.isAlive) return;
    drawVectorAlien(ctx, this.type, frame, this.x, this.y, this.width, this.height, this.color);
  }
}

// --- UFO FLAGSHIP ---

class UFO {
  constructor(canvasWidth) {
    this.canvasWidth = canvasWidth;
    this.width = 54;
    this.height = 24;
    this.direction = Math.random() > 0.5 ? 1 : -1;
    this.x = this.direction === 1 ? -this.width : this.canvasWidth;
    this.y = 52;
    this.speed = 3.2 * this.direction;
    this.isAlive = true;
    this.points = [50, 100, 150, 300][Math.floor(Math.random() * 4)];
    this.color = '#ff2a5f';
    this.pulse = 0;
  }

  update() {
    this.x += this.speed;
    this.pulse += 0.15;
    if (this.direction === 1 && this.x > this.canvasWidth + 20) {
      this.isAlive = false;
    } else if (this.direction === -1 && this.x < -this.width - 20) {
      this.isAlive = false;
    }
  }

  draw(ctx) {
    if (!this.isAlive) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.strokeStyle = this.color;
    ctx.fillStyle = '#1a0510';
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.lineWidth = 2.2;

    const w = this.width / 2;
    const h = this.height / 2;

    // Outer Saucer Disc
    ctx.beginPath();
    ctx.ellipse(0, 0, w, h * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top Dome
    ctx.beginPath();
    ctx.fillStyle = '#ff77a8';
    ctx.arc(0, -h * 0.25, w * 0.45, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rotating perimeter lights
    const numLights = 5;
    for (let i = 0; i < numLights; i++) {
      const angle = (this.pulse + (i * Math.PI * 2) / numLights);
      const lx = Math.cos(angle) * (w * 0.75);
      const ly = Math.sin(angle) * (h * 0.45);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(lx, ly, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// --- DESTRUCTIBLE BUNKER SHIELD ---

class Bunker {
  constructor(x, y, cols = 16, rows = 12, cellSize = 4) {
    this.x = x;
    this.y = y;
    this.cols = cols;
    this.rows = rows;
    this.cellSize = cellSize;
    this.width = cols * cellSize;
    this.height = rows * cellSize;
    
    // Matrix of cell health: 0 = destroyed, 1-3 = health level
    this.grid = [];
    this.initGrid();
  }

  initGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        // Cut out classic bunker archway at the bottom center
        const isArch = r >= this.rows - 4 && c >= 5 && c <= 10;
        // Rounded top corners
        const isTopCornerLeft = r < 2 && c < 2 - r;
        const isTopCornerRight = r < 2 && c >= this.cols - (2 - r);

        if (isArch || isTopCornerLeft || isTopCornerRight) {
          this.grid[r][c] = 0;
        } else {
          this.grid[r][c] = 3; // 3 hit points per cell
        }
      }
    }
  }

  checkCollision(x, y, radius = 3, damageRadius = 2) {
    // Convert world coordinate to bunker grid space
    const localX = x - this.x;
    const localY = y - this.y;

    if (localX < -radius || localX > this.width + radius || localY < -radius || localY > this.height + radius) {
      return false;
    }

    const cellCol = Math.floor(localX / this.cellSize);
    const cellRow = Math.floor(localY / this.cellSize);

    let hit = false;

    // Apply crater damage around hit point
    for (let r = cellRow - damageRadius; r <= cellRow + damageRadius; r++) {
      for (let c = cellCol - damageRadius; c <= cellCol + damageRadius; c++) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
          if (this.grid[r][c] > 0) {
            const dist = Math.hypot(r - cellRow, c - cellCol);
            if (dist <= damageRadius) {
              this.grid[r][c] = Math.max(0, this.grid[r][c] - 2);
              hit = true;
            }
          }
        }
      }
    }

    return hit;
  }

  draw(ctx) {
    ctx.save();
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const hp = this.grid[r][c];
        if (hp > 0) {
          const cx = this.x + c * this.cellSize;
          const cy = this.y + r * this.cellSize;

          if (hp === 3) {
            ctx.fillStyle = '#00ff9d';
            ctx.shadowColor = '#00ff9d';
            ctx.shadowBlur = 4;
          } else if (hp === 2) {
            ctx.fillStyle = '#00b36b';
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = '#00663d';
            ctx.shadowBlur = 0;
          }

          ctx.fillRect(cx, cy, this.cellSize - 0.5, this.cellSize - 0.5);
        }
      }
    }
    ctx.restore();
  }
}

// --- PROJECTILE (BULLET) ---

class Bullet {
  constructor(x, y, vx, vy, source = 'player', color = '#00f0ff', width = 3, height = 12) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.source = source; // 'player' or 'enemy'
    this.color = color;
    this.width = width;
    this.height = height;
    this.isAlive = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    if (!this.isAlive) return;
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    
    if (this.source === 'player') {
      ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
      // Front laser tip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x - 1, this.y, 2, 4);
    } else {
      // Jagged zig-zag alien plasma
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + 3, this.y + 4);
      ctx.lineTo(this.x - 3, this.y + 8);
      ctx.lineTo(this.x, this.y + 12);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// --- POWER-UP CAPSULE ---

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'spread', 'rapid', 'shield', 'emp'
    this.width = 24;
    this.height = 24;
    this.vy = 2.0;
    this.isAlive = true;
    this.rotation = 0;

    this.colors = {
      spread: '#00f0ff',
      rapid: '#ffb800',
      shield: '#00ff9d',
      emp: '#ff2a5f'
    };
    this.labels = {
      spread: 'S',
      rapid: 'R',
      shield: 'D',
      emp: 'E'
    };
  }

  update() {
    this.y += this.vy;
    this.rotation += 0.04;
  }

  draw(ctx) {
    if (!this.isAlive) return;
    const col = this.colors[this.type] || '#ffffff';
    const label = this.labels[this.type] || 'P';

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Glowing Diamond
    ctx.strokeStyle = col;
    ctx.fillStyle = 'rgba(10, 18, 30, 0.85)';
    ctx.shadowColor = col;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;

    const size = 12;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Label icon
    ctx.rotate(-this.rotation); // un-rotate text
    ctx.fillStyle = col;
    ctx.font = 'bold 11px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 0);

    ctx.restore();
  }
}
