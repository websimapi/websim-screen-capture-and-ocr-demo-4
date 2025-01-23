// Text-to-speech related functions
let voices = [];
let utterQueue = [];
let isSpeaking = false;
let singleLineMode = false;

function queueSpeech(utterance) {
  utterQueue.push(utterance);
  updateQueueUI();
  processSpeechQueue();
}

// ...rest of TTS functions...