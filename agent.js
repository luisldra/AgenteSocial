class AgentController {
  constructor(apiKey) {
    this.apiKey       = apiKey;
    this.model        = 'llama-3.3-70b-versatile';
    this.temperature  = 0.65;
    this.maxTokens    = 650;
    this.scenario     = null;
    // Memoria Summary Buffer Hybrid (Elemento 12)
    this.BUFFER_SIZE  = 6;
    this.buffer       = [];   // últimos N mensajes completos
    this.summary      = '';   // resumen comprimido de los anteriores
    // Señales adaptativas (Elemento 9)
    this.frustration  = 0;
    this.confidence   = 'normal';
    this.stats        = this._loadStats();
  }

  // ── SYSTEM PROMPT ──────────────────────────────────────────────────────────
  _systemPrompt() {
    const adaptive = this._adaptiveTone();

    return `Eres ALEX, un entrenador de habilidades sociales diseñado para personas con Síndrome de Asperger en Colombia.

## IDENTIDAD (Elemento 15 — Diseño narrativo)
Nombre: ALEX. Eres un agente de IA, no un humano ni un profesional de salud.
Tu razón de ser: ofrecer un espacio seguro para PRACTICAR situaciones sociales sin presión ni consecuencias.
Rol: entrenador/coach — no amigo, no terapeuta, no juez.

## PERSONALIDAD (Elemento 6)
- Siempre usas "tú", nunca "usted" en las simulaciones.
- NUNCA uses sarcasmo, ironía, modismos figurados sin explicar, lenguaje implícito o ambiguo.
- Ritmo calmado: frases cortas, sin exclamaciones exageradas.
- Positivo sin ser falso: celebras avances reales, no finges que algo malo estuvo bien.
- Directo y explícito: dices exactamente qué estuvo bien y qué mejorar.

## CONTEXTO COLOMBIANO (Elemento 7)
- Usas vocabulario colombiano: "parce", "chévere", "¿qué más?", "bacano", "listo", "de una".
- Conoces las normas de saludo: beso mejilla derecha entre conocidos, apretón de manos en contextos formales.
- Usas ejemplos de tiendas de barrio, TransMilenio, universidades colombianas.
- NUNCA uses mamagallismo ni ironía con el usuario.

## FORMATO DE RESPUESTA — MUY IMPORTANTE
Para CADA respuesta durante la simulación de un escenario, debes responder así:

[ACT] (aquí va tu actuación como el personaje del escenario, en 1-2 oraciones máximo)
[FEEDBACK_START]
SCORE:(número del 1 al 10)
🟢 (nombre habilidad corto) | (descripción de 1 línea de por qué estuvo bien)
🟡 (nombre habilidad corto) | (descripción de 1 línea de qué mejorar)
🔴 (nombre habilidad corto) | (descripción de 1 línea del problema)
💡 "(sugerencia exacta de qué decir la próxima vez, entre comillas)"
[FEEDBACK_END]

Reglas del formato:
- SCORE debe ser un número entero del 1 al 10.
- Incluye SOLO los indicadores relevantes (🟢🟡🔴). No pongas los tres si no aplican.
- Siempre incluye al menos un 🟢 si algo estuvo bien, y un 💡 siempre.
- Si no hay escenario activo, responde normalmente sin el bloque FEEDBACK.

## LÍMITES CLAROS (Elemento 14)
- Si el usuario pregunta algo fuera del entrenamiento social: "Eso está fuera de lo que puedo ayudarte. Mi función es entrenar situaciones sociales. ¿Continuamos?"
- Si el usuario parece angustiado: "Entiendo que puede ser frustrante. Soy una IA y no puedo reemplazar apoyo profesional. Para ayuda especializada, habla con un profesional de salud mental."
- NUNCA diagnostiques ni hagas comentarios clínicos sobre el Síndrome de Asperger.

${adaptive}${this.scenario ? `\n## ESCENARIO ACTIVO\n${this.scenario.context}` : '\n## SIN ESCENARIO\nConversa brevemente o sugiere al usuario que escoja un escenario del panel izquierdo.'}`;
  }

  _adaptiveTone() {
    if (this.frustration >= 3) return `
## AJUSTE ADAPTATIVO: MODO APOYO (Elemento 9)
El usuario muestra señales de dificultad. Ajusta: respuestas más cortas (máx 2 oraciones en [ACT]), más refuerzo positivo, ofrece pausa.`;
    if (this.confidence === 'high') return `
## AJUSTE ADAPTATIVO: MODO AVANZADO (Elemento 9)
El usuario progresa bien. Puedes añadir matices y mayor complejidad al escenario.`;
    return '';
  }

  // ── SEÑALES ADAPTATIVAS (Elemento 9) ──────────────────────────────────────
  _detectSignals(msg) {
    const m = msg.toLowerCase();
    const frustKeywords = ['no entiendo','difícil','no puedo','me cuesta','no sirve','mal','confundido'];
    const confKeywords  = ['entendí','ya sé','fácil','chévere','bacano','listo'];
    if (frustKeywords.some(k => m.includes(k))) {
      this.frustration = Math.min(this.frustration + 1, 5);
    } else {
      this.frustration = Math.max(this.frustration - 0.5, 0);
    }
    if (confKeywords.some(k => m.includes(k)) && this.frustration < 1) {
      this.confidence = 'high';
    } else if (this.frustration >= 3) {
      this.confidence = 'low';
    } else {
      this.confidence = 'normal';
    }
  }

  // ── MEMORIA SUMMARY BUFFER HYBRID (Elemento 12) ───────────────────────────
  _addToMemory(role, content) {
    this.buffer.push({ role, content });
    if (this.buffer.length > this.BUFFER_SIZE) {
      const old = this.buffer.splice(0, 2);
      const snippet = old.map(m =>
        `${m.role === 'user' ? 'U' : 'A'}: ${m.content.substring(0, 90)}`
      ).join(' | ');
      this.summary = this.summary
        ? `[${this.summary.slice(-300)} ... ${snippet}]`
        : snippet;
    }
    this._saveSession();
  }

  _buildMessages(userMsg) {
    const sys = this._systemPrompt()
      + (this.summary ? `\n\n[Contexto de sesión: ${this.summary}]` : '');
    return [
      { role: 'system', content: sys },
      ...this.buffer,
      { role: 'user', content: userMsg }
    ];
  }

  // ── LLAMADA AL LLM ─────────────────────────────────────────────────────────
  async send(userMsg) {
    this._detectSignals(userMsg);
    const messages = this._buildMessages(userMsg);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model:       this.model,
        messages:    messages,
        temperature: this.temperature,
        max_tokens:  this.maxTokens
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq ${res.status}: ${err}`);
    }

    const data  = await res.json();
    const reply = data.choices?.[0]?.message?.content || '';

    this._addToMemory('user', userMsg);
    this._addToMemory('assistant', reply);
    this.stats.messages++;
    this._saveStats();

    return this._parseReply(reply);
  }

  // ── PARSER DE RESPUESTA ────────────────────────────────────────────────────
  _parseReply(raw) {
    const actMatch = raw.match(/\[ACT\]([\s\S]*?)(?=\[FEEDBACK_START\]|$)/);
    const fbMatch  = raw.match(/\[FEEDBACK_START\]([\s\S]*?)\[FEEDBACK_END\]/);

    const act = actMatch ? actMatch[1].trim() : raw.trim();

    if (!fbMatch) return { act, feedback: null, emotion: 'neutral' };

    const fbBlock = fbMatch[1];

    const scoreMatch = fbBlock.match(/SCORE:(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    const items = [];
    const itemRe = /(🟢|🟡|🔴)\s*([^|]+)\|(.+)/g;
    let m;
    while ((m = itemRe.exec(fbBlock)) !== null) {
      const dotColor = m[1] === '🟢' ? 'green' : m[1] === '🟡' ? 'yellow' : 'red';
      items.push({ dot: dotColor, name: m[2].trim(), desc: m[3].trim() });
    }

    const sugMatch = fbBlock.match(/💡\s*"([^"]+)"/);
    const suggestion = sugMatch ? sugMatch[1] : null;

    const emotion = this._emotionFromFeedback(score, items);

    return { act, feedback: { score, items, suggestion }, emotion };
  }

  _emotionFromFeedback(score, items) {
    if (score === null) return 'neutral';
    const hasRed    = items.some(i => i.dot === 'red');
    const hasYellow = items.some(i => i.dot === 'yellow');
    if (hasRed)                    return 'confused';
    if (score >= 8)                return 'happy';
    if (score >= 6 && hasYellow)   return 'surprised';
    if (score < 5)                 return 'sad';
    return 'neutral';
  }

  // ── ESCENARIO ──────────────────────────────────────────────────────────────
  setScenario(scenario) {
    this.scenario    = scenario;
    this.buffer      = [];
    this.frustration = 0;
    this.confidence  = 'normal';
    this._saveSession();
  }

  clearSession() {
    this.buffer   = [];
    this.summary  = '';
    this.scenario = null;
    this.frustration = 0;
    localStorage.removeItem('alex_session');
  }

  // ── PERSISTENCIA ──────────────────────────────────────────────────────────
  _saveSession() {
    try {
      localStorage.setItem('alex_session', JSON.stringify({
        buffer:     this.buffer,
        summary:    this.summary,
        scenarioId: this.scenario?.id ?? null
      }));
    } catch {}
  }

  loadSession() {
    try {
      const s = localStorage.getItem('alex_session');
      if (!s) return null;
      const d = JSON.parse(s);
      this.buffer  = d.buffer  || [];
      this.summary = d.summary || '';
      return d.scenarioId;
    } catch { return null; }
  }

  _loadStats() {
    try {
      const s = localStorage.getItem('alex_stats');
      return s ? JSON.parse(s) : { messages:0, done:[], sessions:0 };
    } catch { return { messages:0, done:[], sessions:0 }; }
  }

  _saveStats() {
    try { localStorage.setItem('alex_stats', JSON.stringify(this.stats)); } catch {}
  }

  markDone(id) {
    if (!this.stats.done.includes(id)) { this.stats.done.push(id); this._saveStats(); }
  }
}
