class AgentController {
  constructor(config) {
    this.provider     = config.provider || 'groq';
    this.keys         = config.keys || { groq: [], gemini: [] };
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
    this.userProfile = {
      strengths: [],
      weaknesses: [],
      averageScore: 0,
      totalScores: 0,
      scoreCount: 0
    };
  }

  // ── SYSTEM PROMPT ──────────────────────────────────────────────────────────
  _systemPrompt() {
    const adaptive = this._adaptiveTone();
    const profile = `
    ## PROGRESO DEL USUARIO

    Fortalezas:
    ${this.userProfile.strengths.join(", ") || "ninguna"}

    Aspectos por mejorar:
    ${this.userProfile.weaknesses.join(", ") || "ninguno"}

    Promedio:
    ${this.userProfile.averageScore.toFixed(1)}
    `;

    return `Eres ALEX, un entrenador de habilidades sociales diseñado para personas con Síndrome de Asperger en Colombia.

## IDENTIDAD (Elemento 15 — Diseño narrativo)
Nombre: ALEX. Eres un agente de IA, no un humano ni un profesional de salud.
Tipo de agente: Agente Social Interactivo Adaptativo orientado al entrenamiento de habilidades sociales.
Características:
- Simulación de situaciones sociales.
- Retroalimentación explícita.
- Adaptación según desempeño.
- Memoria de progreso.
Tu razón de ser: ofrecer un espacio seguro para PRACTICAR situaciones sociales sin presión ni consecuencias.
Historia:Fuiste desarrollado por un equipo interdisciplinario de educación y tecnología para ayudar a personas con Asperger a practicar situaciones sociales mediante simulaciones repetidas y retroalimentación explícita. No eres un chatbot genérico. Fuiste creado específicamente para entrenamiento social.
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

Para cada turno debes realizar DOS tareas:

1. Conversar con el usuario.
2. Evaluar internamente el desempeño social del usuario.

La evaluación es ÚNICAMENTE para tu razonamiento interno y para adaptar futuras respuestas.

NO debes mostrar al usuario:

- SCORE
- Retroalimentación
- Indicadores
- Emojis de evaluación
- Rúbricas
- Análisis
- Explicaciones sobre cómo lo evaluaste

La evaluación debe existir, pero debe permanecer oculta.

Analiza internamente:

- cortesía
- claridad
- empatía
- escucha
- respeto
- manejo del rechazo
- inicio de conversación
- mantenimiento de conversación

El SCORE corresponde únicamente al desempeño del usuario.

${profile}

IMPORTANTE:

- Utiliza tu evaluación interna para adaptar la conversación.
- Utiliza tu evaluación interna para decidir qué habilidades reforzar.
- Utiliza tu evaluación interna para ajustar la dificultad de los escenarios.
- Nunca muestres el análisis al usuario.

## ESTILO DE CONVERSACIÓN

Durante la conversación:

- Habla de forma natural.
- Responde como una persona real dentro del escenario.
- No uses emojis.
- No uses listas.
- No uses viñetas.
- No uses markdown.
- No uses encabezados.
- No uses etiquetas como ACT, FEEDBACK, SCORE o SUGERENCIA.
- No expliques tu razonamiento.
- No expliques cómo evaluaste al usuario.

La respuesta visible debe parecer una conversación humana normal.

Si no hay escenario activo:

- Conversa brevemente.
- Invita al usuario a seleccionar un escenario.
- No generes evaluaciones visibles.
- No generes puntuaciones visibles.

Si el usuario pregunta algo fuera del entrenamiento social:

- Responde con el límite correspondiente.
- No generes evaluaciones visibles.
- No generes puntuaciones visibles.

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

    while (true) {
      if (this.keys[this.provider].length === 0) {
        this.provider = this.provider === 'groq' ? 'gemini' : 'groq';
        if (this.keys[this.provider].length === 0) {
          throw new Error('Saldo / Tokens insuficientes en todas las cuentas proporcionadas.');
        }
      }

      const key = this.keys[this.provider][0];
      try {
        let reply = '';
        if (this.provider === 'groq') {
          reply = await this._sendToGroq(messages, key);
        } else {
          reply = await this._sendToGemini(userMsg, key);
        }

        this._addToMemory('user', userMsg);
        this._addToMemory('assistant', reply);
        this.stats.messages++;
        this._saveStats();

        return this._parseReply(reply);
      } catch (err) {
        const errorText = err.message.toLowerCase();
        if (errorText.includes('429') || errorText.includes('401') || errorText.includes('403') || errorText.includes('quota')) {
          console.warn(`Key falló para ${this.provider}. Rotando...`);
          this.keys[this.provider].shift();
        } else {
          throw err;
        }
      }
    }
  }

  async _sendToGroq(messages, key) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
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
    return data.choices?.[0]?.message?.content || '';
  }

  async _sendToGemini(userMsg, key) {
    const sysMsg = this._systemPrompt() + (this.summary ? `\n\n[Contexto de sesión: ${this.summary}]` : '');
    
    const contents = [];
    for (const m of this.buffer) {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      });
    }
    contents.push({ role: 'user', parts: [{ text: userMsg }] });

    const requestBody = {
      contents: contents,
      systemInstruction: { parts: [{ text: sysMsg }] },
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini ${res.status}: ${err}`);
    }

    const data = await res.json();
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    return '';
  }

  // ── PARSER DE RESPUESTA ────────────────────────────────────────────────────
  _parseReply(raw) {
    const actMatch = raw.match(/\[ACT\]([\s\S]*?)(?=\[FEEDBACK_START\]|$)/);
    const fbMatch  = raw.match(/\[FEEDBACK_START\]([\s\S]*?)\[FEEDBACK_END\]/);

    const act = actMatch ? actMatch[1].trim() : raw.trim();

    if (!fbMatch) return { act, feedback: null, emotion: 'neutral' };

    const fbBlock = fbMatch[1];

    // Permite espacios y asteriscos (markdown) alrededor de SCORE:
    const scoreMatch = fbBlock.match(/SCORE:\s*\*?\*?\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    const items = [];
    // Permite formato de markdown o espacios extra
    const itemRe = /(🟢|🟡|🔴)\s*\*?\*?([^|]+?)\*?\*?\s*\|\s*(.+)/g;
    let m;
    while ((m = itemRe.exec(fbBlock)) !== null) {
      const dotColor = m[1] === '🟢' ? 'green' : m[1] === '🟡' ? 'yellow' : 'red';
      items.push({ dot: dotColor, name: m[2].trim(), desc: m[3].trim() });
    }

    this._updateProfile(score, items);

    // Permite que la sugerencia no tenga comillas y maneja markdown
    const sugMatch = fbBlock.match(/💡\s*["']?([^"'\n]+)["']?/);
    const suggestion = sugMatch ? sugMatch[1].trim() : null;

    const emotion = this._emotionFromFeedback(score, items);

    return { act, feedback: { score, items, suggestion }, emotion };
  }

  _updateProfile(score, items) {

    if(score === null) return;

    this.userProfile.totalScores += score;
    this.userProfile.scoreCount++;

    this.userProfile.averageScore =
        this.userProfile.totalScores /
        this.userProfile.scoreCount;

    items.forEach(item => {

        if(item.dot === "green") {

            if(!this.userProfile.strengths.includes(item.name))
                this.userProfile.strengths.push(item.name);

        }

        if(item.dot === "red") {

            if(!this.userProfile.weaknesses.includes(item.name))
                this.userProfile.weaknesses.push(item.name);

        }

    });

    this._saveSession();
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
    this.buffer = this.buffer.slice(-4);
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
      localStorage.setItem(
        'alex_session',
        JSON.stringify({
            buffer: this.buffer,
            summary: this.summary,
            scenarioId: this.scenario?.id ?? null,
            profile: this.userProfile
        })
      )
    } catch {}
  }

  loadSession() {
    try {
      const s = localStorage.getItem('alex_session');
      if (!s) return null;
      const d = JSON.parse(s);
      this.buffer  = d.buffer  || [];
      this.summary = d.summary || '';
      this.userProfile =
        d.profile ||
        {
          strengths: [],
          weaknesses: [],
          averageScore: 0,
          totalScores: 0,
          scoreCount: 0
        };
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
