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

class AvatarController {
  constructor(canvasId) {
    this.canvas  = document.getElementById(canvasId);
    this.ctx     = this.canvas.getContext('2d');
    this.W       = this.canvas.width;   // 220
    this.H       = this.canvas.height;  // 240
    this.current = 'neutral';
    this._blinkTimer = null;
    this._scheduleNextBlink();
  }

  // Configuración visual por emoción
  // browsOffset: desplazamiento vertical de cejas (negativo = arriba)
  // browsAngle:  rotación de cejas (positivo = extremo externo hacia abajo = tristeza)
  // eyeScale:    tamaño relativo del ojo (1 = normal)
  // mouthType:   neutral | smile | frown | open | thinking | wavy
  _config(emotion) {
    return {
      neutral:   { browsOffset:0,   browsAngle:0,     eyeScale:1,    mouthType:'neutral',  color: EMOTION_COLORS.neutral   },
      happy:     { browsOffset:-7,  browsAngle:-0.1,  eyeScale:1,    mouthType:'smile',    color: EMOTION_COLORS.happy     },
      sad:       { browsOffset:5,   browsAngle:0.18,  eyeScale:0.95, mouthType:'frown',    color: EMOTION_COLORS.sad       },
      surprised: { browsOffset:-11, browsAngle:0,     eyeScale:1.1,  mouthType:'open',     color: EMOTION_COLORS.surprised },
      thinking:  { browsOffset:-4,  browsAngle:-0.22, eyeScale:1,    mouthType:'thinking', color: EMOTION_COLORS.thinking  },
      confused:  { browsOffset:3,   browsAngle:0.1,   eyeScale:1,    mouthType:'wavy',     color: EMOTION_COLORS.confused  },
    }[emotion];
  }

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
        ctx.arc(ex, eyeY + 2, eyeR * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#1a0a02';
        ctx.fill();
        // Reflejo
        ctx.beginPath();
        ctx.arc(ex + eyeR * 0.22, eyeY - eyeR * 0.22, eyeR * 0.2, 0, Math.PI * 2);
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
    setTimeout(() => this._draw(false), 130);
    this._scheduleNextBlink();
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
      this.canvas.classList.add('thinking');
      this.setEmotion('thinking');
    } else {
      this.canvas.classList.remove('thinking');
    }
  }

  destroy() { clearTimeout(this._blinkTimer); }
}
