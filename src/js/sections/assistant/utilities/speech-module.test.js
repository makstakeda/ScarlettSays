import SpeechModule from './speech-module';

import Speech from 'speak-tts';
jest.mock('speak-tts');
const speechInitMock = jest.fn();
const speechSpeakMock = jest.fn();
Speech.mockImplementation(() => {
  return {
    init: speechInitMock,
    speak: speechSpeakMock
  }
});

import annyang from 'annyang';
jest.mock('annyang', () => {
  return {
    start: jest.fn(),
    abort: jest.fn(),
    addCommands: jest.fn()
  };
});


describe('SpeechModule', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should create expected instance', () => {
    const speechModule = new SpeechModule();
    expect(speechInitMock).toHaveBeenCalledTimes(1);
    const initObject = speechInitMock.mock.calls[0][0];
    delete initObject.listeners;
    expect(initObject).toMatchObject(
      { volume: 1, lang: 'en-GB', rate: 1, pitch: 1, voice:'Google US English', splitSentences: true }
    );
    expect(annyang.start).toHaveBeenCalledTimes(1);
    const phraseToSpeech = 'phrase';
    speechModule.say(phraseToSpeech);
    expect(speechSpeakMock).toHaveBeenCalledTimes(1);
    expect(speechSpeakMock.mock.calls[0][0].text).toBe(phraseToSpeech);
    speechModule.startListen();
    expect(annyang.start).toHaveBeenCalledTimes(2);
    speechModule.stopListen();
    expect(annyang.abort).toHaveBeenCalledTimes(1);
    const commandToAdd = { snippet: 'to-add' };
    speechModule.addCommands(commandToAdd);
    expect(annyang.addCommands).toHaveBeenCalledTimes(1);
    expect(annyang.addCommands.mock.calls[0][0]).toMatchObject(commandToAdd);
  });
});
