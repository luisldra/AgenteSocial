const EMOTION_COLORS = {
<<<<<<< HEAD
  neutral: '#94a3b8',
  happy: '#6ee7b7',
  sad: '#7dd3fc',
  surprised: '#fde68a',
  thinking: '#c4b5fd',
  confused: '#fca5a5',
  listening: '#93c5fd',
  excited: '#fbbf24',
  empathetic: '#2dd4bf',
  worried: '#f97316',
  curious: '#a855f7'
};

const EMOTION_LABELS = {
  neutral: '😐 Neutral',
  happy: '😊 Feliz',
  sad: '😢 Triste',
  surprised: '😲 Sorprendido',
  thinking: '🤔 Pensando',
  confused: '😕 Confundido',
  listening: '👂 Escuchando',
  excited: '🤩 Entusiasmado',
  empathetic: '🥺 Empático',
  worried: '😟 Preocupado',
  curious: '🧐 Curioso'
};

const EMOTION_CONFIGS = {
  neutral: { browsOffset: 0, browsAngle: 0, eyeScale: 1, mouthType: 'neutral', color: EMOTION_COLORS.neutral },
  happy: { browsOffset: -7, browsAngle: -0.1, eyeScale: 1, mouthType: 'smile', color: EMOTION_COLORS.happy },
  sad: { browsOffset: 5, browsAngle: 0.18, eyeScale: 0.95, mouthType: 'frown', color: EMOTION_COLORS.sad },
  surprised: { browsOffset: -11, browsAngle: 0, eyeScale: 1.1, mouthType: 'open', color: EMOTION_COLORS.surprised },
  thinking: { browsOffset: -4, browsAngle: -0.22, eyeScale: 1, mouthType: 'thinking', color: EMOTION_COLORS.thinking },
  confused: { browsOffset: 3, browsAngle: 0.1, eyeScale: 1, mouthType: 'wavy', color: EMOTION_COLORS.confused },
  listening: { browsOffset: -2, browsAngle: -0.05, eyeScale: 1, mouthType: 'neutral', color: EMOTION_COLORS.listening },
  excited: { browsOffset: -12, browsAngle: -0.15, eyeScale: 1.15, mouthType: 'open-smile', color: EMOTION_COLORS.excited },
  empathetic: { browsOffset: 2, browsAngle: 0.12, eyeScale: 1, mouthType: 'soft-smile', color: EMOTION_COLORS.empathetic },
  worried: { browsOffset: 4, browsAngle: 0.2, eyeScale: 0.9, mouthType: 'frown', color: EMOTION_COLORS.worried },
  curious: { browsOffset: -3, browsAngle: -0.1, eyeScale: 1, mouthType: 'thinking', color: EMOTION_COLORS.curious }
=======
  neutral:   '#94a3b8',
  happy:     '#6ee7b7',
  sad:       '#7dd3fc',
  surprised: '#fde68a',
  thinking:  '#c4b5fd',
  confused:  '#fca5a5',
  listening: '#93c5fd'
};

const EMOTION_LABELS = {
  neutral:   '😐 Neutral',
  happy:     '😊 Feliz',
  sad:       '😢 Triste',
  surprised: '😲 Sorprendido',
  thinking:  '🤔 Pensando',
  confused:  '😕 Confundido',
  listening: '👂 Escuchando'
};

const EMOTION_CONFIGS = {
  neutral:   { browsOffset:0,   browsAngle:0,     eyeScale:1,    mouthType:'neutral',  color: EMOTION_COLORS.neutral   },
  happy:     { browsOffset:-7,  browsAngle:-0.1,  eyeScale:1,    mouthType:'smile',    color: EMOTION_COLORS.happy     },
  sad:       { browsOffset:5,   browsAngle:0.18,  eyeScale:0.95, mouthType:'frown',    color: EMOTION_COLORS.sad       },
  surprised: { browsOffset:-11, browsAngle:0,     eyeScale:1.1,  mouthType:'open',     color: EMOTION_COLORS.surprised },
  thinking:  { browsOffset:-4,  browsAngle:-0.22, eyeScale:1,    mouthType:'thinking', color: EMOTION_COLORS.thinking  },
  confused:  { browsOffset:3,   browsAngle:0.1,   eyeScale:1,    mouthType:'wavy',     color: EMOTION_COLORS.confused  },
  listening: { browsOffset:-2,  browsAngle:-0.05, eyeScale:1,    mouthType:'neutral',  color: EMOTION_COLORS.listening }
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
};

class AvatarController {
  constructor(canvasId) {
<<<<<<< HEAD
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) throw new Error(`AvatarController: canvas #${canvasId} not found`);
    this.ctx = this.canvas.getContext('2d');
    this.W = this.canvas.width;   // 220
    this.H = this.canvas.height;  // 240
=======
    this.canvas  = document.getElementById(canvasId);
    if (!this.canvas) throw new Error(`AvatarController: canvas #${canvasId} not found`);
    this.ctx     = this.canvas.getContext('2d');
    this.W       = this.canvas.width;   // 220
    this.H       = this.canvas.height;  // 240
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
    this.current = 'neutral';
    this._blinkTimer = null;
    this._scheduleNextBlink();

<<<<<<< HEAD
    this.targetEyePos = { x: 0, y: 0 };
=======
    this.targetEyePos = {x:0, y:0};
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
    this.interactionState = null;
    this.interactionTimer = null;
    this._setupInteractions();
  }

  _setupInteractions() {
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
<<<<<<< HEAD

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const angle = Math.atan2(dy, dx);
      const maxDist = 8;
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.04, maxDist);

=======
      
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      
      const angle = Math.atan2(dy, dx);
      const maxDist = 8;
      const dist = Math.min(Math.sqrt(dx*dx + dy*dy) * 0.04, maxDist);
      
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
      this.targetEyePos = {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist
      };
<<<<<<< HEAD

=======
      
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
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
<<<<<<< HEAD

    this.canvas.addEventListener('mouseleave', () => {
      isDown = false;
      this.canvas.classList.remove('avatar-hover');
    });
=======
    
    this.canvas.addEventListener('mouseleave', () => { isDown = false; });
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
  }

  _triggerInteraction(emotion) {
    if (this._blinkTimer) clearTimeout(this._blinkTimer);
    if (this.interactionTimer) clearTimeout(this.interactionTimer);
<<<<<<< HEAD

    this.interactionState = emotion;
    const oldEmotion = this.current;
    this.setEmotion(emotion);

=======
    
    this.interactionState = emotion;
    const oldEmotion = this.current;
    this.setEmotion(emotion);
    
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
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
    this.canvas.classList.remove("emotion-pop");
    void this.canvas.offsetWidth;
    this.canvas.classList.add("emotion-pop");
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
    ctx.ellipse(cx, cy, 105, 118, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1a3a5c';
    ctx.fill();
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // ── ANTENAS ─────────────────────────────────────────
<<<<<<< HEAD
    [[cx - 32, cy - 88, cx - 40, cy - 108], [cx + 32, cy - 88, cx + 40, cy - 108]].forEach(([x1, y1, x2, y2]) => {
=======
    [[cx-32, cy-88, cx-40, cy-108], [cx+32, cy-88, cx+40, cy-108]].forEach(([x1,y1,x2,y2]) => {
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
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
<<<<<<< HEAD
    const eyeY = cy - 18;
    [cx - 40, cx + 40].forEach((ex, idx) => {
      let currentEyeScale = cfg.eyeScale;
      if (this.current === 'curious') {
        currentEyeScale = idx === 0 ? 1.15 : 0.85; // ojo izquierdo más abierto, derecho más cerrado
      }
      const eyeR = 32 * currentEyeScale;

=======
    const eyeR = 32 * cfg.eyeScale;
    const eyeY = cy - 18;
    [cx-40, cx+40].forEach(ex => {
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
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
<<<<<<< HEAD

    let leftBrowsOffset = cfg.browsOffset;
    let rightBrowsOffset = cfg.browsOffset;
    let leftBrowsAngle = -cfg.browsAngle;
    let rightBrowsAngle = cfg.browsAngle;

    if (this.current === 'curious') {
      leftBrowsOffset = -9; // levantada
      leftBrowsAngle = -0.22;
      rightBrowsOffset = 3;  // bajada
      rightBrowsAngle = 0.15;
    }

    const defaultEyeR = 32 * cfg.eyeScale;

    // Ceja izquierda
    ctx.save();
    ctx.translate(cx - 30, eyeY - defaultEyeR - 10 + leftBrowsOffset);
    ctx.rotate(leftBrowsAngle);
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.stroke();
    ctx.restore();
    // Ceja derecha
    ctx.save();
    ctx.translate(cx + 30, eyeY - defaultEyeR - 10 + rightBrowsOffset);
    ctx.rotate(rightBrowsAngle);
=======
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
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
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
<<<<<<< HEAD
        ctx.moveTo(cx - 20, my); ctx.lineTo(cx + 20, my); break;
      case 'smile':
        ctx.moveTo(cx - 24, my - 4);
        ctx.bezierCurveTo(cx - 10, my + 16, cx + 10, my + 16, cx + 24, my - 4); break;
      case 'open-smile':
        ctx.moveTo(cx - 24, my - 4);
        ctx.lineTo(cx + 24, my - 4);
        ctx.bezierCurveTo(cx + 16, my + 18, cx - 16, my + 18, cx - 24, my - 4);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fill();
        break;
      case 'soft-smile':
        ctx.moveTo(cx - 16, my - 2);
        ctx.bezierCurveTo(cx - 8, my + 6, cx + 8, my + 6, cx + 16, my - 2);
        break;
      case 'frown':
        ctx.moveTo(cx - 24, my + 4);
        ctx.bezierCurveTo(cx - 10, my - 14, cx + 10, my - 14, cx + 24, my + 4); break;
=======
        ctx.moveTo(cx-20, my); ctx.lineTo(cx+20, my); break;
      case 'smile':
        ctx.moveTo(cx-24, my-4);
        ctx.bezierCurveTo(cx-10, my+16, cx+10, my+16, cx+24, my-4); break;
      case 'frown':
        ctx.moveTo(cx-24, my+4);
        ctx.bezierCurveTo(cx-10, my-14, cx+10, my-14, cx+24, my+4); break;
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
      case 'open':
        ctx.ellipse(cx, my, 20, 14, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fill(); break;
      case 'thinking':
<<<<<<< HEAD
        ctx.moveTo(cx - 20, my);
        ctx.lineTo(cx + 6, my);
        ctx.bezierCurveTo(cx + 12, my, cx + 20, my - 10, cx + 20, my - 10); break;
      case 'wavy':
        ctx.moveTo(cx - 20, my);
        ctx.bezierCurveTo(cx - 10, my + 8, cx, my - 8, cx + 10, my);
        ctx.bezierCurveTo(cx + 14, my + 6, cx + 18, my + 4, cx + 22, my); break;
=======
        ctx.moveTo(cx-20, my);
        ctx.lineTo(cx+6, my);
        ctx.bezierCurveTo(cx+12, my, cx+20, my-10, cx+20, my-10); break;
      case 'wavy':
        ctx.moveTo(cx-20, my);
        ctx.bezierCurveTo(cx-10, my+8,  cx,    my-8,  cx+10, my);
        ctx.bezierCurveTo(cx+14, my+6,  cx+18, my+4,  cx+22, my); break;
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
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
<<<<<<< HEAD
      : this.canvas.classList.remove('speaking');
=======
       : this.canvas.classList.remove('speaking');
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
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
