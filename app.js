let agent  = null;
let avatar = null;
let speech = null;
let busy   = false;
let micOn  = false;
let trainingHistory = [];

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  
  const checkKeys = () => {
    const groqHasKey = Array.from(document.querySelectorAll('.groq-key')).some(i => i.value.trim().length > 5);
    const geminiHasKey = Array.from(document.querySelectorAll('.gemini-key')).some(i => i.value.trim().length > 5);
    startBtn.disabled = !(groqHasKey || geminiHasKey);
  };

  _loadKeysStorage();
  checkKeys();
  
  document.addEventListener('input', e => {
    if (
        e.target.classList.contains('groq-key') ||
        e.target.classList.contains('gemini-key')
    ) {
        checkKeys();
        _saveKeysStorage();
    }
  });

  startBtn.addEventListener('click', () => {
    document.getElementById('keys-modal-body').appendChild(document.getElementById('api-keys-module'));
    _boot();
  });

  // Modal de keys
  document.getElementById('open-keys-btn').addEventListener('click', () => {
    document.getElementById('keys-modal').classList.add('active');
  });
  document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('keys-modal').classList.remove('active');
  });

  // Botones para agregar más inputs de keys
  document.getElementById('add-groq-btn').addEventListener('click', () => {
    const c = document.getElementById('groq-keys-container');
    const div = document.createElement('div');
    div.className = 'key-row';
    div.style.cssText = 'display:flex; gap:4px; align-items:center;';
    div.innerHTML = `
      <input type="password" class="key-input groq-key" placeholder="Key Groq (gsk_...)">
      <button class="btn-icon delete-key-btn" style="color:#ef4444; font-size:1rem; cursor:pointer;" title="Eliminar llave">✖</button>
    `;
    c.appendChild(div);
    _saveKeysStorage();
  });
  document.getElementById('add-gemini-btn').addEventListener('click', () => {
    const c = document.getElementById('gemini-keys-container');
    const div = document.createElement('div');
    div.className = 'key-row';
    div.style.cssText = 'display:flex; gap:4px; align-items:center;';
    div.innerHTML = `
      <input type="password" class="key-input gemini-key" placeholder="Key Gemini (AIza...)">
      <button class="btn-icon delete-key-btn" style="color:#ef4444; font-size:1rem; cursor:pointer;" title="Eliminar llave">✖</button>
    `;
    c.appendChild(div);
    _saveKeysStorage();
  });

  // Delegación para eliminar llaves
  document.addEventListener('click', e => {
    if (e.target.closest('.delete-key-btn')) {
      const row = e.target.closest('.key-row');
      if (row) {
        row.remove();
        checkKeys();
        _saveKeysStorage();
      }
    }
  });
});

// ── INICIALIZACIÓN ─────────────────────────────────────────────────────────
function _boot() {
  const provider = document.getElementById('provider-select').value;
  agent  = new AgentController({ provider, keys: { groq: [], gemini: [] } });
  avatar = new AvatarController('avatar-canvas');
  speech = new SpeechController();
  _loadTrainingStorage();
  _renderTrainingHistory();
  _loadAccessibility();
  _renderStrengthSummary();

  speech.onStart = () => {
    avatar.animateTalking(true);
    setAgentStatus("💬 Respondiendo...");
  };
  speech.onEnd = () => {
      avatar.animateTalking(false);
      avatar.setEmotion('neutral');
      setAgentStatus("🟢 Disponible");
  };
  speech.onTranscript = txt => {
    document.getElementById('user-input').value = txt;
  };  

  // Mostrar pantalla principal
  document.getElementById('ethics-screen').classList.remove('active');
  const main = document.getElementById('main-screen');
  main.classList.add('active');

  // Cargar escenarios
  _renderScenarios();

  // Restaurar sesión o mostrar bienvenida
  const savedId = agent.loadSession();
  if (savedId) {
    const sc = SCENARIOS.find(s => s.id === savedId);
    if (sc) _selectScenario(sc, false);
    agent.buffer.forEach(m => {
      let text = m.content;
      // Limpiar posibles restos de formato del LLM en sesiones guardadas anteriormente
      if (m.role === 'assistant') {
        const actMatch = text.match(/\[ACT\]([\s\S]*?)(?=\[FEEDBACK_START\]|\[SUGGESTIONS\]|$)/);
        if (actMatch) text = actMatch[1].trim();
        text = text.replace(/\[FEEDBACK_START\][\s\S]*?\[FEEDBACK_END\]/, '').replace(/\[SUGGESTIONS\][\s\S]*$/, '').trim();
      }
      _appendMessage(m.role === 'user' ? 'user' : 'agent', text);
    });
  } else {
    _welcome();
  }

  agent.stats.sessions++;
  agent._saveStats();
  _renderStats();
  _setupListeners();
  setAgentStatus("🟢 Disponible");
}

// ── EVENT LISTENERS ────────────────────────────────────────────────────────
function _setupListeners() {
  document.getElementById('send-btn').addEventListener('click', _send);
  document.getElementById('user-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _send(); }
  });
  document.getElementById('tts-toggle').addEventListener('click', () => {
    const on = speech.toggleTTS();
    const btn = document.getElementById('tts-toggle');
    btn.textContent = on ? '🔊' : '🔇';
    btn.classList.toggle('active', on);
  });
  document.getElementById('speech-rate').addEventListener('input', e => {
    speech.setRate(parseFloat(e.target.value));
  });
  document.getElementById('chat-mic-btn').addEventListener('click', _toggleMic);
  document.getElementById('clear-btn').addEventListener('click', _clear);
  document.getElementById("feedback-btn")
  .addEventListener("click", () => {

      const panel = document.getElementById("feedback-panel");

      panel.classList.remove("hidden");
      panel.classList.add("active");
  });
  document.getElementById("close-feedback-btn")
  .addEventListener("click", () => {

      const panel = document.getElementById("feedback-panel");

      panel.classList.remove("active");
      panel.classList.add("hidden");
  });
  document
  .getElementById("settings-btn")
  .addEventListener("click", (e) => {

      console.log("CLICK CONFIG");

      e.stopPropagation();

      const menu =
          document.getElementById(
              "settings-dropdown"
          );

      console.log(menu);

      menu.classList.toggle("hidden");
  });
  document
  .getElementById("settings-dropdown")
  .addEventListener("click", (e) => {
      e.stopPropagation();
  });
  document
  .getElementById(
      "reduce-brightness-modal"
  )
  .addEventListener("change", e => {

      document.body.classList.toggle(
          "reduce-brightness",
          e.target.checked
      );
      _saveAccessibility();
  });
  document
  .getElementById(
      "high-contrast-modal"
  )
  .addEventListener("change", e => {

      document.body.classList.toggle(
          "high-contrast",
          e.target.checked
      );
      _saveAccessibility();
  });

  // Chat flotante minimize/maximize
  const chatZone = document.getElementById('chat-zone');
  document.getElementById('minimize-chat-btn').addEventListener('click', e => {
    e.stopPropagation();
    chatZone.classList.toggle('minimized');
  });
  document.getElementById('chat-header').addEventListener('click', () => {
    if (chatZone.classList.contains('minimized')) {
      chatZone.classList.remove('minimized');
    }
  });
}

// ── ENVÍO DE MENSAJE ───────────────────────────────────────────────────────
async function _send() {
  if (busy) return;
  const input = document.getElementById('user-input');
  const text  = input.value.trim();
  if (!text) return;

  // Actualizar llaves en el agente antes de enviar
  const groqInputs = Array.from(document.querySelectorAll('.groq-key'));
  const geminiInputs = Array.from(document.querySelectorAll('.gemini-key'));
  
  agent.keys.groq = groqInputs.map(i => i.value.trim()).filter(k => k);
  agent.keys.gemini = geminiInputs.map(i => i.value.trim()).filter(k => k);
  agent.provider = document.getElementById('provider-select').value;

  if (agent.keys.groq.length === 0 && agent.keys.gemini.length === 0) {
    _appendMessage('system', '⚠️ No has introducido ninguna API Key en el panel derecho. Por favor, agrega al menos una para poder enviarle el mensaje a ALEX.');
    return;
  }

  input.value = '';
  busy = true;
  document.getElementById('send-btn').disabled = true;

  _appendMessage('user', text);
  _clearQR();

  avatar.animateThinking(true);
  _setStatus('Pensando...');

  try {
    setAgentStatus("🤔 Analizando...");
    const { act, feedback, emotion, quickReplies } = await agent.send(text);
    avatar.animateThinking(false);
    avatar.setEmotion(emotion);
    setAgentStatus("💬 Respondiendo...");

    if (act) _appendMessage('agent', act);

    if (feedback && feedback.trainingType === "TRAINING") {
      _saveTraining({
          userMessage: text,
          agentResponse: act,
          feedback: feedback,
          emotion: emotion,
          scenario: agent.scenario
              ? agent.scenario.title
              : "Sin escenario"
      });

      _renderStrengthSummary();

      speech.speak(act);

      setTimeout(() => {
          if (!speech.ttsEnabled) {
              setAgentStatus("🟢 Disponible");
          }
      }, 100);

      if (agent.scenario) {
        agent.markDone(agent.scenario.id);
        _renderScenarios();
      }
    }
    else{
      speech.speak(act);
    }

    if (quickReplies && quickReplies.length > 0) {
      _showIdeasBtn(quickReplies);
    }

    _renderStats();
    _setStatus('');

  } catch (err) {
    setAgentStatus("⚠️ Error");
    avatar.animateThinking(false);
    avatar.setEmotion('confused');
    _appendMessage('agent', `Hubo un error al conectar con el LLM: ${err.message}. Verifica tu API key e inténtalo de nuevo.`);
    setTimeout(() => {
        setAgentStatus("🟢 Disponible");
    }, 3000);
  }

  busy = false;
  document.getElementById('send-btn').disabled = false;
  document.getElementById('user-input').focus();
}

// ── RENDERIZADO DE MENSAJES ────────────────────────────────────────────────
function _appendMessage(role, content) {
  const log = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className   = `message ${role}`;
  div.textContent = content;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function _saveTraining(data){
    trainingHistory.unshift({
        date:new Date().toLocaleString(),
        scenario:data.scenario,
        emotion:data.emotion,
        score:data.feedback.score,
        items:data.feedback.items,
        suggestion:data.feedback.suggestion,
        trainingType:data.feedback.trainingType,
        userMessage:data.userMessage,
        agentResponse:data.agentResponse
    });
    _saveTrainingStorage();
    _renderTrainingHistory();
}

function _saveFeedback(feedback){
    feedbackHistory.unshift({
        date:new Date(),
        scenario:agent.scenario
            ? agent.scenario.title
            :"Sin escenario",
        emotion:avatar.current,
        score:feedback.score,
        items:feedback.items,
        suggestion:feedback.suggestion
    });
    _renderFeedbackPanel();
}

function _saveTrainingStorage(){
    localStorage.setItem(
        "alex_training_history",
        JSON.stringify(trainingHistory)
    );
}

function _loadTrainingStorage(){
    const s=localStorage.getItem(
        "alex_training_history"
    );
    if(s){
        trainingHistory=JSON.parse(s);
    }
}

function _renderTrainingHistory() {
    const container = document.getElementById("feedback-content");

    if (!container) return;

    if (trainingHistory.length === 0) {
        container.innerHTML = `
            <div class="training-empty">
                <h3>📚 Historial de Entrenamientos</h3>
                <p>
                    Aún no has realizado ningún entrenamiento.
                </p>
                <p>
                    Cuando completes conversaciones con ALEX,
                    aquí aparecerá tu progreso.
                </p>
            </div>
        `;
        return;
    }

    let promedio = 0;

    trainingHistory.forEach(t => {
        if (t.score != null)
            promedio += t.score;
    });

    promedio /= trainingHistory.length;

    let html = `
        <div class="training-summary">
            <div class="training-stat">
                <strong>Total entrenamientos</strong>
                <div>${trainingHistory.length}</div>
            </div>
            <div class="training-stat">
                <strong>Promedio</strong>
                <div>${promedio.toFixed(1)} / 10 ⭐</div>
            </div>
        </div>
    `;

    trainingHistory.forEach((t, index) => {
        const greens =
            t.items.filter(i => i.dot === "green");
        const reds =
            t.items.filter(i => i.dot === "red");
        const yellows =
            t.items.filter(i => i.dot === "yellow");

        html += `
        <div class="training-card">
            <div class="training-title">
                📚 Entrenamiento #${trainingHistory.length-index}
            </div>

            <div class="training-info">
                <p><strong>📅 Fecha:</strong> ${t.date}</p>
                <p><strong>🎯 Escenario:</strong> ${t.scenario}</p>
                <p><strong>😊 Emoción del agente:</strong> ${t.emotion}</p>
                <p><strong>⭐ Resultado:</strong> ${t.score ?? "-"} / 10</p>
                <p>
                    <strong>📂 Tipo:</strong>
                    ${
                        t.trainingType === "TRAINING"
                            ? "Entrenamiento"
                            : "Chat"
                    }
                </p>
            </div>

            <hr>

            <div>
                <strong>🟢 Fortalezas</strong>
                <ul>
                    ${
                        greens.length
                        ?
                        greens.map(g=>`<li><strong>${g.name}</strong>: ${g.desc}</li>`).join("")
                        :
                        "<li>No registradas</li>"
                    }
                </ul>
            </div>

            <div>
                <strong>🟡 Aspectos intermedios</strong>
                <ul>
                    ${
                        yellows.length
                        ?
                        yellows.map(g=>`<li><strong>${g.name}</strong>: ${g.desc}</li>`).join("")
                        :
                        "<li>Ninguno</li>"
                    }
                </ul>
            </div>

            <div>
                <strong>🔴 Aspectos por mejorar</strong>
                <ul>
                    ${
                        reds.length
                        ?
                        reds.map(g=>`<li><strong>${g.name}</strong>: ${g.desc}</li>`).join("")
                        :
                        "<li>Ninguno</li>"
                    }
                </ul>
            </div>

            <div class="training-suggestion">
                <strong>💡 Recomendación</strong>
                <p>
                    ${
                        t.suggestion ??
                        "Sin recomendaciones."
                    }
                </p>
            </div>

            <details style="margin-top:10px;">
                <summary style="cursor:pointer;font-weight:bold;">
                    📜 Ver conversación
                </summary>

                <div style="margin-top:10px;">

                    <p>
                        <strong>👤 Usuario:</strong>
                    </p>

                    <div class="training-message">
                        ${t.userMessage}
                    </div>

                    <p style="margin-top:10px;">
                        <strong>🤖 ALEX:</strong>
                    </p>

                    <div class="training-message">
                        ${t.agentResponse}
                    </div>
                </div>
            </details>
        </div>
        `;
    });
    container.innerHTML = html;
}

// ── ESCENARIOS ─────────────────────────────────────────────────────────────
function _renderScenarios() {
  const list = document.getElementById('scenarios-list');
  list.innerHTML = '';
  SCENARIOS.forEach(sc => {
    const card = document.createElement('div');
    card.className = 'scenario-card' + (agent?.scenario?.id === sc.id ? ' active' : '');
    card.dataset.id = sc.id;
    const done = agent?.stats.done.includes(sc.id) ? ' ✓' : '';
    card.innerHTML = `<h3>${sc.title}${done}</h3><p>${sc.desc}</p>`;
    card.addEventListener('click', () => _selectScenario(sc));
    list.appendChild(card);
  });
}

function _selectScenario(sc, notify = true) {
  agent.setScenario(sc);
  _renderScenarios();
  if (notify) {
    _appendMessage('system', `▶ Escenario: ${sc.title}\n${sc.desc}`);
    _triggerAgentStart();
  } else {
    _showQR(sc.quickReplies);
  }
  avatar.setEmotion('neutral');
}

async function _triggerAgentStart() {
  if (busy) return;
  const groqInputs = Array.from(document.querySelectorAll('.groq-key'));
  const geminiInputs = Array.from(document.querySelectorAll('.gemini-key'));
  agent.keys.groq = groqInputs.map(i => i.value.trim()).filter(k => k);
  agent.keys.gemini = geminiInputs.map(i => i.value.trim()).filter(k => k);
  agent.provider = document.getElementById('provider-select').value;

  if (agent.keys.groq.length === 0 && agent.keys.gemini.length === 0) {
    return;
  }

  busy = true;
  document.getElementById('send-btn').disabled = true;
  _clearQR();
  avatar.animateThinking(true);
  _setStatus('Iniciando escenario...');

  try {
    const initMsg = "[SISTEMA: El usuario acaba de entrar a este escenario. Da el primer paso e inicia la interacción en tu rol. Saluda o haz un comentario para arrancar la situación. Aún no evalúes nada.]";
    setAgentStatus("🤔 Analizando...");
    const { act, emotion, quickReplies } = await agent.send(initMsg, true);
    
    avatar.animateThinking(false);
    avatar.setEmotion(emotion);
    setAgentStatus("💬 Respondiendo...");

    if (act) _appendMessage('agent', act);
    speech.speak(act);

    if (quickReplies && quickReplies.length > 0) {
      _showIdeasBtn(quickReplies);
    } else if (agent.scenario) {
      _showQR(agent.scenario.quickReplies);
    }

    _renderStats();
    _setStatus('');
  } catch (err) {
    avatar.animateThinking(false);
    avatar.setEmotion('confused');
    _appendMessage('agent', `Error al iniciar: ${err.message}`);
  }
  busy = false;
  document.getElementById('send-btn').disabled = false;
}

// ── QUICK REPLIES ──────────────────────────────────────────────────────────
function _showQR(replies) {
  const c = document.getElementById('quick-replies-container');
  c.innerHTML = '';
  replies.forEach(r => {
    const btn = document.createElement('button');
    btn.className   = 'qr-btn';
    btn.textContent = r;
    btn.addEventListener('click', () => {
      document.getElementById('user-input').value = r;
      document.getElementById('user-input').focus();
    });
    c.appendChild(btn);
  });
}

function _showIdeasBtn(replies) {
  const c = document.getElementById('quick-replies-container');
  c.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'btn-action';
  btn.style.margin = '0 auto';
  btn.textContent = '💡 Generar ideas para responder';
  btn.addEventListener('click', () => {
    _showQR(replies);
  });
  c.appendChild(btn);
}

function _clearQR() {
  document.getElementById('quick-replies-container').innerHTML = '';
}

// ── MICRÓFONO ──────────────────────────────────────────────────────────────
function _toggleMic() {
  if (!speech.sttSupported) {
    _appendMessage('system',
      'Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.'
    );
    return;
  }

  micOn = !micOn;

  const btn = document.getElementById('chat-mic-btn');

  if (micOn) {
    setAgentStatus("🎤 Escuchando...");
    speech.startListening();
    avatar.setEmotion('listening');

    btn.classList.add('active');
    btn.textContent = '🔴';

    _setStatus('Escuchando...');
  } else {
    speech.stopListening();

    btn.classList.remove('active');
    btn.textContent = '🎤';

    _setStatus('');
    setAgentStatus("🟢 Disponible");
  }
}

function _saveKeysStorage() {

    const groqKeys = Array.from(
        document.querySelectorAll('.groq-key')
    )
    .map(i => i.value.trim())
    .filter(k => k);

    const geminiKeys = Array.from(
        document.querySelectorAll('.gemini-key')
    )
    .map(i => i.value.trim())
    .filter(k => k);

    localStorage.setItem(
        'alex_api_keys',
        JSON.stringify({
            groq: groqKeys,
            gemini: geminiKeys
        })
    );
}

function _loadKeysStorage() {
    const data = localStorage.getItem(
        'alex_api_keys'
    );

    if (!data) return;

    const keys = JSON.parse(data);

    const groqContainer =
        document.getElementById(
            'groq-keys-container'
        );

    const geminiContainer =
        document.getElementById(
            'gemini-keys-container'
        );

    groqContainer.innerHTML = '';
    geminiContainer.innerHTML = '';

    (keys.groq || []).forEach(key => {

        const div = document.createElement('div');

        div.className = 'key-row';

        div.style.cssText =
            'display:flex; gap:4px; align-items:center;';

        div.innerHTML = `
            <input
                type="password"
                class="key-input groq-key"
                value="${key}"
            >

            <button
                class="btn-icon delete-key-btn"
                style="color:#ef4444;font-size:1rem;cursor:pointer;"
            >
                ✖
            </button>
        `;

        groqContainer.appendChild(div);
    });

    (keys.gemini || []).forEach(key => {

        const div = document.createElement('div');

        div.className = 'key-row';

        div.style.cssText =
            'display:flex; gap:4px; align-items:center;';

        div.innerHTML = `
            <input
                type="password"
                class="key-input gemini-key"
                value="${key}"
            >

            <button
                class="btn-icon delete-key-btn"
                style="color:#ef4444;font-size:1rem;cursor:pointer;"
            >
                ✖
            </button>
        `;

        geminiContainer.appendChild(div);
    });
}

function _saveAccessibility() {

    const config = {

        brightness:
            document.getElementById(
                "reduce-brightness-modal"
            ).checked,

        contrast:
            document.getElementById(
                "high-contrast-modal"
            ).checked

    };

    localStorage.setItem(
        "alex_accessibility",
        JSON.stringify(config)
    );
}

function _loadAccessibility() {

    const raw =
        localStorage.getItem(
            "alex_accessibility"
        );

    if(!raw) return;

    const config = JSON.parse(raw);

    document.body.classList.toggle(
        "reduce-brightness",
        config.brightness
    );

    document.body.classList.toggle(
        "high-contrast",
        config.contrast
    );

    document.getElementById(
        "reduce-brightness-modal"
    ).checked =
        config.brightness;

    document.getElementById(
        "high-contrast-modal"
    ).checked =
        config.contrast;
}

function _renderStrengthSummary() {
    const div =
        document.getElementById(
            "strength-summary"
        );

    if(!agent) return;

    const strengths =
        agent.userProfile.strengths;

    if(strengths.length === 0){
        div.innerHTML =
            "Aún no hay fortalezas registradas";

        return;
    }

    div.innerHTML =
        `
        <strong>
            ✔ Fortalezas detectadas
        </strong>

        <br>

        ${strengths
            .slice(-3)
            .join(" • ")
        }
        `;
}

// ── STATS Y UTILIDADES ─────────────────────────────────────────────────────
function _renderStats() {
    if(!agent) return;

    const p =
        agent.userProfile.averageScore;

    const level =
        Math.min(
            100,
            Math.round(
                p * 10
            )
        );

    document.getElementById(
        "progress-display"
    ).innerHTML =

    `
    <div>
        <strong>
            Nivel social
        </strong>

        <div class="level-bar">

            <div
                class="level-fill"
                style="width:${level}%">
            </div>

        </div>

        <p>
            ${p.toFixed(1)} / 10
        </p>

    </div>

    <hr>

    <p>
        ✔ Fortalezas:
        ${agent.userProfile.strengths.length}
    </p>

    <p>
        🔴 Mejorar:
        ${agent.userProfile.weaknesses.length}
    </p>

    <p>
        🎯 Escenarios:
        ${agent.stats.done.length}
        /
        ${SCENARIOS.length}
    </p>
    `;
}

function _setStatus(txt) {
  const lbl = document.getElementById('emotion-label');
  if (!lbl) return;
  if (txt) {
    lbl.textContent = txt;
  } else if (avatar) {
    // Restaurar la etiqueta de emoción actual
    lbl.textContent = '';
    avatar.setEmotion(avatar.current);
  }
}

function _welcome() {
  _appendMessage('agent',
    '¡Hola! Soy ALEX, tu entrenador de habilidades sociales.\n\n' +
    'Ya tengo registradas tus llaves. Selecciona un escenario en el panel izquierdo y envíame un mensaje para empezar a practicar.\n\n' +
    '(Si necesitas agregar más llaves o cambiar el proveedor, haz clic en el botón "🔑 Configurar Proveedor y Keys" en el panel derecho).'
  );
}

function _clear() {
  if (!confirm('¿Borrar el historial y empezar de nuevo?')) {
      return;
  }
  agent.clearSession();
  trainingHistory = [];
  localStorage.removeItem(
      "alex_training_history"
  );
  _renderTrainingHistory();
  document.getElementById('chat-messages').innerHTML = '';
  _clearQR();
  _renderScenarios();
  avatar.setEmotion('neutral');
  _welcome();
}

function setAgentStatus(text) {
    const el = document.getElementById("agent-status");

    if (el) {
        el.textContent = text;
    }
}