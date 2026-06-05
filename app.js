let agent  = null;
let avatar = null;
let speech = null;
let busy   = false;
let micOn  = false;

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  
  const checkKeys = () => {
    const groqHasKey = Array.from(document.querySelectorAll('.groq-key')).some(i => i.value.trim().length > 5);
    const geminiHasKey = Array.from(document.querySelectorAll('.gemini-key')).some(i => i.value.trim().length > 5);
    startBtn.disabled = !(groqHasKey || geminiHasKey);
  };
  
  document.addEventListener('input', e => {
    if (e.target.classList.contains('groq-key') || e.target.classList.contains('gemini-key')) {
      checkKeys();
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
  });

  // Delegación para eliminar llaves
  document.addEventListener('click', e => {
    if (e.target.closest('.delete-key-btn')) {
      const row = e.target.closest('.key-row');
      if (row) {
        row.remove();
        checkKeys();
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

  speech.onStart = () => avatar.animateTalking(true);
  speech.onEnd   = () => { avatar.animateTalking(false); avatar.setEmotion('neutral'); };
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
    agent.buffer.forEach(m => _appendMessage(m.role === 'user' ? 'user' : 'agent', m.content));
  } else {
    _welcome();
  }

  agent.stats.sessions++;
  agent._saveStats();
  _renderStats();
  _setupListeners();
}

// ── EVENT LISTENERS ────────────────────────────────────────────────────────
function _setupListeners() {
  document.getElementById('send-btn').addEventListener('click', _send);
  document.getElementById('user-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _send(); }
  });
  document.getElementById('greet-btn').addEventListener('click', () => {
    document.getElementById('user-input').value = '¡Hola ALEX!';
    _send();
  });
  document.getElementById('encourage-btn').addEventListener('click', () => {
    document.getElementById('user-input').value = 'Necesito motivación para practicar';
    _send();
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
  document.getElementById('reduce-brightness').addEventListener('change', e => {
    document.body.classList.toggle('reduce-brightness', e.target.checked);
  });
  document.getElementById('high-contrast').addEventListener('change', e => {
    document.body.classList.toggle('high-contrast', e.target.checked);
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
  document
  .getElementById('chat-mic-btn')
  .addEventListener('click', _toggleMic);
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
    const { act, feedback, emotion } = await agent.send(text);
    avatar.animateThinking(false);
    avatar.setEmotion(emotion);

    if (act) _appendMessage('agent', act);

    if (feedback) {
      _appendFeedbackCard(feedback);
      speech.speak(act);
      if (agent.scenario) {
        agent.markDone(agent.scenario.id);
        _renderScenarios();
      }
    } else {
      speech.speak(act);
    }

    if (agent.scenario) _showQR(agent.scenario.quickReplies);

    _renderStats();
    _setStatus('');

  } catch (err) {
    avatar.animateThinking(false);
    avatar.setEmotion('confused');
    _appendMessage('agent', `Hubo un error al conectar con el LLM: ${err.message}. Verifica tu API key e inténtalo de nuevo.`);
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

function _appendFeedbackCard({ score, items, suggestion }) {
  const log  = document.getElementById('chat-messages');
  const card = document.createElement('div');
  card.className = 'feedback-card';

  const scoreClass = score >= 8 ? 'score-high' : score >= 5 ? 'score-mid' : 'score-low';

  const itemsHTML = items.map(i => `
    <div class="feedback-item">
      <div class="feedback-dot ${i.dot}"></div>
      <div>
        <div class="feedback-item-name">${i.name}</div>
        <div class="feedback-item-desc">${i.desc}</div>
      </div>
    </div>`).join('');

  card.innerHTML = `
    <div class="feedback-header">
      <span>📋 Análisis del intercambio</span>
      ${score !== null ? `<span class="feedback-score ${scoreClass}">${score} / 10</span>` : ''}
    </div>
    <div class="feedback-items">${itemsHTML}</div>
    ${suggestion ? `<div class="feedback-suggestion">💡 Siguiente vez: <em>"${suggestion}"</em></div>` : ''}
  `;

  log.appendChild(card);
  log.scrollTop = log.scrollHeight;
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
    _appendMessage('system', `▶ Escenario: ${sc.title}\n${sc.desc}\nEmpieza cuando quieras.`);
  }
  _showQR(sc.quickReplies);
  avatar.setEmotion('neutral');
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
      _send();
    });
    c.appendChild(btn);
  });
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
  }
}

// ── STATS Y UTILIDADES ─────────────────────────────────────────────────────
function _renderStats() {
  if (!agent) return;
  const { messages, done, sessions } = agent.stats;
  document.getElementById('progress-display').innerHTML = `
    <div class="stat-row"><span>Mensajes</span><span class="stat-value">${messages}</span></div>
    <div class="stat-row"><span>Escenarios</span><span class="stat-value">${done.length}/${SCENARIOS.length}</span></div>
    <div class="stat-row"><span>Sesiones</span><span class="stat-value">${sessions}</span></div>
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
  if (!confirm('¿Borrar el historial y empezar de nuevo?')) return;
  agent.clearSession();
  document.getElementById('chat-messages').innerHTML = '';
  _clearQR();
  _renderScenarios();
  avatar.setEmotion('neutral');
  _welcome();
}
