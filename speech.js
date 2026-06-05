class SpeechController {
  constructor() {
    this.synth        = window.speechSynthesis;
    this.ttsEnabled   = true;
    this.rate         = 0.9;
    this.onStart      = null;   // callback() — avatar empieza a "hablar"
    this.onEnd        = null;   // callback() — avatar termina de "hablar"
    this.onTranscript = null;   // callback(text) — STT devuelve texto
    this._recognition = null;
    this.voices = [];
    this.synth.onvoiceschanged = () => {
      this.voices = this.synth.getVoices();
    };
    this._initSTT();
    this.isListening = false;
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

    // Preferir voz en español de Colombia o Latinoamérica
    let voices = this.voices.length ? this.voices : this.synth.getVoices();
    const esVoice = voices.find(v => v.lang === 'es-CO')
                 || voices.find(v => v.lang.startsWith('es') && v.name.includes('Google'))
                 || voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utt.voice = esVoice;

    utt.onstart = () => { if (this.onStart) this.onStart(); };
    utt.onend   = () => { if (this.onEnd)   this.onEnd();   };
    utt.onerror = () => { if (this.onEnd)   this.onEnd();   };
    console.log("Rate:", this.rate);
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
    this._recognition.continuous    = true;
    this._recognition.interimResults = true;
    this._recognition.onresult = e => {
      let transcript = '';

      for(let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
      }

      const input = document.getElementById('user-input');

      if(input){
          input.value = transcript;
      }
    };
    this._recognition.onerror = () => {};
  }

  startListening() {
    if(!this._recognition) return false;

    this.isListening = true;

    try{
        this._recognition.start();
        return true;
    }catch{
        return false;
    }
  }

  stopListening() {
    this.isListening = false;

    if(this._recognition){
        this._recognition.stop();
    }
  }

  get sttSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}
