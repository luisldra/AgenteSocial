class SpeechController {
  constructor() {
    this.synth        = window.speechSynthesis;
    this.ttsEnabled   = true;
    this.rate         = 0.9;
    this.onStart      = null;   // callback() — avatar empieza a "hablar"
    this.onEnd        = null;   // callback() — avatar termina de "hablar"
    this.onTranscript = null;   // callback(text) — STT devuelve texto
    this._recognition = null;
    this._initSTT();
  }

  speak(text) {
    if (!this.ttsEnabled) return;
    this.synth.cancel();
    // Limpiar marcadores del formato estructurado
    const clean = text
      .replace(/\[ACT\]/g, '')
      .replace(/\[FEEDBACK_START\][\s\S]*?\[FEEDBACK_END\]/g, '')
      .replace(/\*\*/g, '')
      .trim();
    if (!clean) return;

    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang  = 'es-CO';
    utt.rate  = this.rate;
    utt.pitch = 1.0;

    // Preferir voz en español
    const voices = this.synth.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Google'))
                 || voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utt.voice = esVoice;

    utt.onstart = () => { if (this.onStart) this.onStart(); };
    utt.onend   = () => { if (this.onEnd)   this.onEnd();   };
    utt.onerror = () => { if (this.onEnd)   this.onEnd();   };
    this.synth.speak(utt);
  }

  stop() { this.synth.cancel(); }

  setRate(r) { this.rate = r; }

  toggleTTS() {
    this.ttsEnabled = !this.ttsEnabled;
    if (!this.ttsEnabled) this.stop();
    return this.ttsEnabled;
  }

  _initSTT() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    this._recognition               = new SR();
    this._recognition.lang          = 'es-CO';
    this._recognition.continuous    = false;
    this._recognition.interimResults = false;
    this._recognition.onresult = e => {
      const t = e.results[0][0].transcript;
      if (this.onTranscript) this.onTranscript(t);
    };
    this._recognition.onerror = () => {};
  }

  startListening() {
    if (!this._recognition) return false;
    try { this._recognition.start(); return true; } catch { return false; }
  }

  stopListening() {
    if (this._recognition) this._recognition.stop();
  }

  get sttSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}
