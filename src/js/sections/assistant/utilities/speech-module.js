import Speech from 'speak-tts';
import annyang from 'annyang';

export default class SpeechModule {
  constructor() {
    this._speech = new Speech();
    this._speech.init({ volume: 1, lang: 'en-GB', rate: 1, pitch: 1, voice:'Google US English',
      splitSentences: true, listeners: { onvoiceschanged: (voices) => {} }
    });
  };

  say = (text) => this._speech.speak({ text, listeners: { onend: () => {} } });
};