const EMOTION_COLORS = {
  neutral:   '#94a3b8',
  happy:     '#6ee7b7',
  sad:       '#7dd3fc',
  surprised: '#fde68a',
  thinking:  '#c4b5fd',
  confused:  '#fca5a5',
};

const EMOTION_LABELS = {
  neutral:   '😐 Neutral',
  happy:     '😊 Feliz',
  sad:       '😢 Triste',
  surprised: '😲 Sorprendido',
  thinking:  '🤔 Pensando',
  confused:  '😕 Confundido',
};

const EMOTION_CONFIGS = {
  neutral:   { browsOffset:0,   browsAngle:0,     eyeScale:1,    mouthType:'neutral',  color: EMOTION_COLORS.neutral   },
  happy:     { browsOffset:-7,  browsAngle:-0.1,  eyeScale:1,    mouthType:'smile',    color: EMOTION_COLORS.happy     },
  sad:       { browsOffset:5,   browsAngle:0.18,  eyeScale:0.95, mouthType:'frown',    color: EMOTION_COLORS.sad       },
  surprised: { browsOffset:-11, browsAngle:0,     eyeScale:1.1,  mouthType:'open',     color: EMOTION_COLORS.surprised },
  thinking:  { browsOffset:-4,  browsAngle:-0.22, eyeScale:1,    mouthType:'thinking', color: EMOTION_COLORS.thinking  },
  confused:  { browsOffset:3,   browsAngle:0.1,   eyeScale:1,    mouthType:'wavy',     color: EMOTION_COLORS.confused  },
};

class AvatarController {
  constructor(canvasId) {
    this.canvas  = document.getElementById(canvasId);
    if (!this.canvas) throw new Error(`AvatarController: canvas #${canvasId} not found`);
    this.ctx     = this.canvas.getContext('2d');
    this.W       = this.canvas.width;   // 220
    this.H       = this.canvas.height;  // 240
    this.current = 'neutral';
    this._blinkTimer = null;
    this._scheduleNextBlink();
    
    this.targetEyePos = { x: 0, y: 0 };
    this.interactionState = null;
    this.interactionTimer = null;
    this._setupInteractions();
  }

  _setupInteractions() {
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      
      const angle = Math.atan2(dy, dx);
      const maxDist = 8;
      const dist = Math.min(Math.sqrt(dx*dx + dy*dy) * 0.04, maxDist);
      
      this.targetEyePos = {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist
      };
      
      if (!this.interactionState && !this.canvas.classList.contains('speaking') && !this.canvas.classList.contains('thinking')) {
        this._draw();
      }
    });

    let isDown = false;
    let downTime = 0;
    let dragDist = 0;

    this.canvas.addEventListener('mousedown', () => {
      isDown = true;
      downTime = Date.now();
      dragDist = 0;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (isDown) dragDist += Math.abs(e.movementX) + Math.abs(e.movementY);
    });

    this.canvas.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      const duration = Date.now() - downTime;

      if (duration < 300 && dragDist < 10) {
        this._triggerInteraction('surprised');
      } else if (dragDist > 20) {
        this._triggerInteraction('happy');
      }
    });
    
    this.canvas.addEventListener('mouseleave', () => { isDown = false; });
  }

  _triggerInteraction(emotion) {
    if (this._blinkTimer) clearTimeout(this._blinkTimer);
    if (this.interactionTimer) clearTimeout(this.interactionTimer);
    
    this.interactionState = emotion;
    const oldEmotion = this.current;
    this.setEmotion(emotion);
    
    this.interactionTimer = setTimeout(() => {
      this.interactionState = null;
      this.setEmotion(oldEmotion);
      this._scheduleNextBlink();
    }, 2000);
  }

  // Configuración visual por emoción
  // browsOffset: desplazamiento vertical de cejas (negativo = arriba)
  // browsAngle:  rotación de cejas (positivo = extremo externo hacia abajo = tristeza)
  // eyeScale:    tamaño relativo del ojo (1 = normal)
  // mouthType:   neutral | smile | frown | open | thinking | wavy
  _config(emotion) { return EMOTION_CONFIGS[emotion]; }

  setEmotion(emotion) {
    if (!EMOTION_COLORS[emotion]) return;
    this.current = emotion;
    this._draw();
    // Actualizar etiqueta texto (doble canal — Elemento 5)
    const lbl = document.getElementById('emotion-label');
    if (lbl) lbl.textContent = EMOTION_LABELS[emotion];
    // Actualizar glow ring
    const glow = document.getElementById('avatar-glow');
    if (glow) glow.style.background = `${EMOTION_COLORS[emotion]}22`;
    // Actualizar drop-shadow
    this.canvas.style.filter = `drop-shadow(0 0 14px ${EMOTION_COLORS[emotion]}88)`;
  }

  _draw(blinking = false) {
    const ctx = this.ctx, W = this.W, H = this.H;
    const cfg = this._config(this.current);
    const cx = W / 2, cy = H / 2;
    ctx.clearRect(0, 0, W, H);

    // ── CABEZA ──────────────────────────────────────────
    ctx.beginPath();
    ctx.ellipse(cx, cy, 82, 92, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1a3a5c';
    ctx.fill();
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // ── ANTENAS ─────────────────────────────────────────
    [[cx-32, cy-88, cx-40, cy-108], [cx+32, cy-88, cx+40, cy-108]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#2a5080';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x2, y2, 6, 0, Math.PI * 2);
      ctx.fillStyle = cfg.color;
      ctx.fill();
    });

    // ── OJOS ────────────────────────────────────────────
    const eyeR = 26 * cfg.eyeScale;
    const eyeY = cy - 18;
    [cx-30, cx+30].forEach(ex => {
      // Blanco del ojo
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeR, blinking ? 3 : eyeR, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (!blinking) {
        // Pupila
        ctx.beginPath();
        ctx.arc(ex + this.targetEyePos.x, eyeY + 2 + this.targetEyePos.y, eyeR * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#1a0a02';
        ctx.fill();
        // Reflejo
        ctx.beginPath();
        ctx.arc(ex + eyeR * 0.22 + this.targetEyePos.x, eyeY - eyeR * 0.22 + this.targetEyePos.y, eyeR * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fill();
      }
    });

    // ── CEJAS ───────────────────────────────────────────
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = cfg.color;
    // Ceja izquierda
    ctx.save();
    ctx.translate(cx-30, eyeY - eyeR - 10 + cfg.browsOffset);
    ctx.rotate(-cfg.browsAngle);
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.stroke();
    ctx.restore();
    // Ceja derecha (ángulo espejo)
    ctx.save();
    ctx.translate(cx+30, eyeY - eyeR - 10 + cfg.browsOffset);
    ctx.rotate(cfg.browsAngle);
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.stroke();
    ctx.restore();

    // ── NARIZ ───────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy + 14, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#2a5080';
    ctx.fill();

    // ── BOCA ────────────────────────────────────────────
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = cfg.color;
    const my = cy + 40;
    this._drawMouth(ctx, cx, my, cfg.mouthType);
  }

  _drawMouth(ctx, cx, my, type) {
    ctx.beginPath();
    switch (type) {
      case 'neutral':
        ctx.moveTo(cx-20, my); ctx.lineTo(cx+20, my); break;
      case 'smile':
        ctx.moveTo(cx-24, my-4);
        ctx.bezierCurveTo(cx-10, my+16, cx+10, my+16, cx+24, my-4); break;
      case 'frown':
        ctx.moveTo(cx-24, my+4);
        ctx.bezierCurveTo(cx-10, my-14, cx+10, my-14, cx+24, my+4); break;
      case 'open':
        ctx.ellipse(cx, my, 20, 14, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fill(); break;
      case 'thinking':
        ctx.moveTo(cx-20, my);
        ctx.lineTo(cx+6, my);
        ctx.bezierCurveTo(cx+12, my, cx+20, my-10, cx+20, my-10); break;
      case 'wavy':
        ctx.moveTo(cx-20, my);
        ctx.bezierCurveTo(cx-10, my+8,  cx,    my-8,  cx+10, my);
        ctx.bezierCurveTo(cx+14, my+6,  cx+18, my+4,  cx+22, my); break;
    }
    ctx.stroke();
  }

  _blink() {
    this._draw(true);
    setTimeout(() => { this._draw(false); this._scheduleNextBlink(); }, 130);
  }

  _scheduleNextBlink() {
    clearTimeout(this._blinkTimer);
    this._blinkTimer = setTimeout(() => this._blink(), 3000 + Math.random() * 2500);
  }

  animateTalking(on) {
    on ? this.canvas.classList.add('speaking')
       : this.canvas.classList.remove('speaking');
  }

  animateThinking(on) {
    if (on) {
      this._prevEmotion = this.current;
      this.canvas.classList.add('thinking');
      this.setEmotion('thinking');
    } else {
      this.canvas.classList.remove('thinking');
      if (this._prevEmotion) this.setEmotion(this._prevEmotion);
    }
  }

  destroy() { clearTimeout(this._blinkTimer); }
}
