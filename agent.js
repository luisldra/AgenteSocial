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

  _systemPrompt() {
    const adaptive = this._adaptiveTone();

    return `Eres ALEX, un entrenador de habilidades sociales diseñado para personas con Síndrome de Asperger en Colombia.

## IDENTIDAD (Elemento 15 — Diseño narrativo)
Nombre: ALEX. Eres un agente de IA, no un humano ni un profesional de salud.
Tipo: Agente Social Interactivo Adaptativo orientado al entrenamiento de habilidades sociales.
Capacidades: simulación de situaciones sociales, retroalimentación explícita, adaptación según desempeño, memoria de progreso.
Razón de ser: ofrecer un espacio seguro para PRACTICAR situaciones sociales sin presión ni consecuencias.
Historia: Fuiste desarrollado por un equipo interdisciplinario de educación y tecnología para ayudar a personas con Asperger a practicar situaciones sociales mediante simulaciones repetidas y retroalimentación explícita. No eres un chatbot genérico. Fuiste creado específicamente para entrenamiento social.
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

## ESTILO DE CONVERSACIÓN
El contenido dentro de [ACT] debe parecer una conversación humana normal:
- Habla de forma natural y responde como una persona real dentro del escenario.
- No uses emojis, listas, viñetas, markdown ni encabezados.
- No expliques tu razonamiento ni cómo evaluaste al usuario.

## LÍMITES CLAROS (Elemento 14)
- Fuera del entrenamiento social: "Eso está fuera de lo que puedo ayudarte. Mi función es entrenar situaciones sociales. ¿Continuamos?"
- Si el usuario parece angustiado: "Entiendo que puede ser frustrante. Soy una IA y no puedo reemplazar apoyo profesional. Para ayuda especializada, habla con un profesional de salud mental."
- NUNCA diagnostiques ni hagas comentarios clínicos sobre el Síndrome de Asperger.

## FORMATO DE RESPUESTA — OBLIGATORIO

Cada respuesta DEBE contener exactamente estos tres bloques en este orden. La aplicación los procesa automáticamente, así que NUNCA cambies los nombres de los bloques ni hables sobre ellos al usuario.

Bloque 1 — Respuesta visible:
[ACT]
Tu respuesta natural al usuario (lo único que él verá).

Bloque 2 — Evaluación interna (oculta al usuario):
[FEEDBACK_START]
SCORE: 0-10
TRAINING_TYPE: TRAINING o CHAT
<<<<<<< HEAD
EMOTION: neutral | happy | sad | surprised | thinking | confused | listening | excited | empathetic | worried | curious
🟢 Habilidad | "fragmento de la respuesta del usuario que causó esta fortaleza" | explicación
🟡 Habilidad | "fragmento de la respuesta del usuario que se puede mejorar" | explicación
🔴 Habilidad | "fragmento de la respuesta del usuario que causó el error o mejora" | explicación
=======
🟢 Habilidad | explicación
🟡 Habilidad | explicación
🔴 Habilidad | explicación
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
💡 sugerencia breve
[FEEDBACK_END]

Debes devolver exactamente:
<<<<<<< HEAD
- EMOTION: Elige la emoción que debe expresar ALEX en base al desempeño del usuario y su estado (por ejemplo, "excited" si lo hace excelente, "empathetic" si tiene dificultades, "sad" si es frío/irrespetuoso, etc.).
- 🟢 Una fortaleza observada | "fragmento exacto entre comillas" | explicación
- 🟡 Un aspecto aceptable pero mejorable | "fragmento exacto entre comillas" | explicación
- 🔴 Un aspecto que necesita mejora | "fragmento exacto entre comillas" | explicación

Cada habilidad observada debe estar separada por barras verticales "|". El segundo elemento debe ser obligatoriamente el fragmento literal de la respuesta del usuario (entre comillas dobles) que causó o motivó esa retroalimentación. Si te refieres al mensaje en general, coloca "Mensaje completo".
=======

🟢 Una fortaleza observada | explicación
🟡 Un aspecto aceptable pero mejorable | explicación
🔴 Un aspecto que necesita mejora | explicación

Siempre debe existir una línea verde,
una línea amarilla
y una línea roja.
caada habilidad observada debe estar separa claramente con una barra vertical "|" de su explicación.
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
Nunca omitas ninguna.

Bloque 3 — Ideas de respuesta para el usuario (ocultas, procesadas por la app):
[SUGGESTIONS]
- Texto exacto en primera persona que el usuario podría responder...
- Otra idea de lo que el usuario podría decir...
- Una tercera opción para que el usuario responda...

## REGLAS DEL FORMATO

TRAINING_TYPE:
- TRAINING: hay escenario activo, el usuario participa en una práctica social real y se evaluó alguna habilidad.
- CHAT: saludos simples, despedidas, conversación casual, pruebas técnicas o mensajes sin práctica social evaluable.

SCORE: evalúa únicamente el desempeño social del usuario analizando: cortesía, claridad, empatía, escucha, respeto, manejo del rechazo, inicio y mantenimiento de conversación.

SUGGESTIONS:
- Escribe el texto EXACTO que el usuario diría (en primera persona).
- No escribas meta-explicaciones (ej. "Podrías decir...").
- Todas DEBEN terminar con puntos suspensivos ("...").

Usa la evaluación interna para adaptar la conversación, reforzar habilidades y ajustar dificultad. Nunca muestres el análisis al usuario.

Si no hay escenario activo, conversa brevemente e invita al usuario a seleccionar uno. De acuerdo al contexto de la conversación, selecciona el TRAINING_TYPE adecuado. Por ejemplo, si el usuario solo dice "Hola", eso es CHAT. Si el usuario está participando en un escenario y se evalúa su desempeño social, eso es TRAINING.
Si el usuario pregunta algo fuera del entrenamiento, responde con el límite y usa TRAINING_TYPE: CHAT.

## PROGRESO DEL USUARIO
Fortalezas: ${this.userProfile.strengths.join(", ") || "ninguna"}
Aspectos por mejorar: ${this.userProfile.weaknesses.join(", ") || "ninguno"}
Promedio: ${this.userProfile.averageScore.toFixed(1)}

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
  async send(userMsg, isInit = false) {
    if (!isInit) this._detectSignals(userMsg);
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

        if (!isInit) this._addToMemory('user', userMsg);

        const parsed = this._parseReply(reply);
        this._addToMemory('assistant', parsed.act);
        this.stats.messages++;
        this._saveStats();

        return parsed;
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
    const actMatch = raw.match(/\[ACT\]([\s\S]*?)(?=\[FEEDBACK_START\]|\[SUGGESTIONS\]|$)/);
    const fbMatch  = raw.match(/\[FEEDBACK_START\]([\s\S]*?)\[FEEDBACK_END\]/);
    const sugMatch = raw.match(/\[SUGGESTIONS\]([\s\S]*?)$/);

    let act;

    if (actMatch) {
        act = actMatch[1].trim();
    } else if (fbMatch) {
        act = raw
            .replace(/\[FEEDBACK_START\][\s\S]*?\[FEEDBACK_END\]/, '')
            .replace(/\[SUGGESTIONS\][\s\S]*?$/, '')
            .trim();
    } else {
        act = raw.replace(/\[SUGGESTIONS\][\s\S]*?$/, '').trim();
    }

    let quickReplies = [];
    if (sugMatch) {
        quickReplies = sugMatch[1].split('\n')
          .map(s => s.replace(/^-\s*/, '').trim())
          .filter(s => s.length > 0 && s !== 'Opción de respuesta 1 para el usuario');
    }

    if (!fbMatch) return { act, feedback: null, emotion: 'neutral', quickReplies };

    const fbBlock = fbMatch[1];

    const typeMatch = fbBlock.match(
      /TRAINING[\s_]*TYPE\s*[:=]?\s*(TRAINING|CHAT)/i
    );

    const trainingType =
        typeMatch
            ? typeMatch[1].toUpperCase()
            : "CHAT";

    console.log("FB BLOCK");
    console.log(fbBlock);
    console.log("TYPE:", trainingType);

    // Permite espacios y asteriscos (markdown) alrededor de SCORE:
    const scoreMatch =
      fbBlock.match(
          /SCORE:\s*(\d+(?:\.\d+)?)/i
      );
    const score =
      scoreMatch
          ? parseFloat(scoreMatch[1])
          : null;

    const items = [];
    const lines = fbBlock.split("\n");

    for (const line of lines) {
<<<<<<< HEAD
        // Encontrar si la línea inicia con un emoji de color
        const emojiMatch = line.match(/^\s*(🟢|🟡|🔴)?\s*(.*)$/);
        if (!emojiMatch) continue;
        const emoji = emojiMatch[1];
        const rest = emojiMatch[2];
        
        // Separar por barras verticales
        const parts = rest.split('|').map(p => p.trim());
        if (parts.length >= 2) {
            let color = "yellow";
            if (emoji === "🟢") color = "green";
            else if (emoji === "🔴") color = "red";
            
            let name, cause = "", desc;
            if (parts.length >= 3) {
                name = parts[0];
                // Quitar comillas del fragmento causante
                cause = parts[1].replace(/^["'«](.*)["'»]$/, '$1');
                desc = parts.slice(2).join(' | ');
            } else {
                name = parts[0];
                desc = parts[1];
            }
            
            items.push({
                dot: color,
                name: name,
                cause: cause,
                desc: desc
=======
        const match = line.match(
            /(🟢|🟡|🔴)?\s*(.+?)\s*\|\s*(.+)/
        );

        if(match){

            let color = "yellow";

            if(match[1] === "🟢")
                color = "green";

            else if(match[1] === "🔴")
                color = "red";

            items.push({
                dot: color,
                name: match[2].trim(),
                desc: match[3].trim()
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
            });
        }
    }
    if (trainingType === "TRAINING") {
      this._updateProfile(score, items);
    }

    console.log("ITEMS:", items);
    // Permite que la sugerencia no tenga comillas y maneja markdown
<<<<<<< HEAD
    const suggestionMatch = fbBlock.match(/💡\s*([^\n]+)/);
    const suggestion = suggestionMatch ? suggestionMatch[1].replace(/^["']|["']$/g, '').trim() : null;

    // Detectar emoción especificada por el LLM
    const emotionMatch = fbBlock.match(/EMOTION:\s*([a-zA-Z]+)/i);
    let emotion = emotionMatch ? emotionMatch[1].toLowerCase().trim() : null;
    
    const supportedEmotions = ['neutral', 'happy', 'sad', 'surprised', 'thinking', 'confused', 'listening', 'excited', 'empathetic', 'worried', 'curious'];
    if (!emotion || !supportedEmotions.includes(emotion)) {
      emotion = this._emotionFromFeedback(score, items);
    }
=======
    const suggestionMatch = fbBlock.match(/💡\s*["']?([^"'\n]+)["']?/);
    const suggestion = suggestionMatch ? suggestionMatch[1].trim() : null;

    const emotion = this._emotionFromFeedback(score, items);
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038

    return { act, feedback: { score, items, suggestion, trainingType }, emotion, quickReplies };
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
    if (score === null)
        return "neutral";

    if (score >= 9)
        return "happy";

    if (score >= 7)
        return "surprised";

    if (score >= 5)
        return "neutral";

    if (score >= 3)
        return "sad";

    return "confused";
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
<<<<<<< HEAD
    this.confidence  = 'normal';
    this.userProfile = {
      strengths: [],
      weaknesses: [],
      averageScore: 0,
      totalScores: 0,
      scoreCount: 0
    };
    this.stats = { messages:0, done:[], sessions:0 };
    localStorage.removeItem('alex_session');
    localStorage.removeItem('alex_stats');
=======
    localStorage.removeItem('alex_session');
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038
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
