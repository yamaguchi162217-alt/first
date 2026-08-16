/**
 * NEO INVADERS: Particle & Visual Effects Engine
 * Handles starfield parallax, explosions, thruster flames, shockwaves, floating text, and screen shake.
 */

class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.stars = [];
    this.warpSpeed = 1.0;
    this.targetWarpSpeed = 1.0;

    // Screen Shake
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    this.shakeX = 0;
    this.shakeY = 0;

    this.initStars(120);
  }

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.8 + 0.6,
        speed: Math.random() * 1.5 + 0.4,
        layer: Math.floor(Math.random() * 3), // 0: faint/far, 1: mid, 2: near/bright
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.04 + 0.01,
        twinkleVal: Math.random() * Math.PI
      });
    }
  }

  setWarpSpeed(target) {
    this.targetWarpSpeed = target;
  }

  addShake(intensity) {
    this.shakeIntensity = Math.min(this.shakeIntensity + intensity, 25);
  }

  // --- PARTICLE EMITTERS ---

  createExplosion(x, y, color = '#00f0ff', count = 25, speedScale = 1.0) {
    // Shockwave ring
    this.shockwaves.push({
      x, y,
      radius: 5,
      maxRadius: 40 * speedScale,
      color,
      alpha: 1.0,
      decay: 0.035
    });

    // Particle debris
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 4 + 1.5) * speedScale;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        color,
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.015,
        shape: Math.random() > 0.5 ? 'circle' : 'square'
      });
    }
  }

  createEmpWave(x, y) {
    this.shockwaves.push({
      x, y,
      radius: 10,
      maxRadius: 600,
      color: '#ffb800',
      alpha: 1.0,
      decay: 0.015,
      lineWidth: 8
    });

    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: i % 2 === 0 ? '#ffb800' : '#00f0ff',
        alpha: 1.0,
        decay: 0.01 + Math.random() * 0.01
      });
    }
  }

  createSparks(x, y, color = '#ffb800', count = 8, dirY = -1) {
    for (let i = 0; i < count; i++) {
      const angle = (dirY > 0 ? Math.PI / 2 : -Math.PI / 2) + (Math.random() - 0.5) * 1.5;
      const speed = Math.random() * 3.5 + 1.0;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 1,
        color,
        alpha: 1.0,
        decay: Math.random() * 0.05 + 0.03
      });
    }
  }

  createThrusterFlame(x, y, vxBias = 0) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y,
      vx: (Math.random() - 0.5) * 1.0 - vxBias * 0.3,
      vy: Math.random() * 2.5 + 2.0,
      size: Math.random() * 3.5 + 1.5,
      color: Math.random() > 0.4 ? '#00f0ff' : '#00ff9d',
      alpha: 0.9,
      decay: 0.06
    });
  }

  addFloatingText(text, x, y, color = '#00f0ff', size = 16) {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -1.2,
      alpha: 1.0,
      decay: 0.02,
      color,
      size
    });
  }

  // --- UPDATE & RENDER ---

  update() {
    // Warp speed lerp
    this.warpSpeed += (this.targetWarpSpeed - this.warpSpeed) * 0.05;

    // Screen Shake
    if (this.shakeIntensity > 0.1) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeIntensity = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Stars
    for (const star of this.stars) {
      star.y += star.speed * (star.layer + 1) * this.warpSpeed;
      if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
      star.twinkleVal += star.twinkleSpeed;
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.15 + 1.5;
      sw.alpha -= sw.decay;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= ft.decay;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  renderStars() {
    const ctx = this.ctx;
    ctx.save();
    for (const star of this.stars) {
      const twinkle = Math.sin(star.twinkleVal) * 0.3 + 0.7;
      const alpha = star.alpha * twinkle;

      if (this.warpSpeed > 2.0) {
        // Warp streak
        ctx.strokeStyle = star.layer === 2 ? '#00f0ff' : '#ffffff';
        ctx.globalAlpha = alpha;
        ctx.lineWidth = star.size * 0.8;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x, star.y + star.speed * 8 * (this.warpSpeed - 1));
        ctx.stroke();
      } else {
        ctx.fillStyle = star.layer === 2 ? '#90e0ef' : '#ffffff';
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  renderFX() {
    const ctx = this.ctx;
    ctx.save();

    // Shockwaves
    for (const sw of this.shockwaves) {
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha;
      ctx.lineWidth = sw.lineWidth || 3;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, Math.max(1, sw.radius), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      if (p.shape === 'square') {
        ctx.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // Floating texts
    ctx.font = 'bold 14px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.alpha;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();
  }

  clear() {
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.shakeIntensity = 0;
  }
}
