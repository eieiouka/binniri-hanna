let audioContext = null;
let masterGain = null;
let bgmGain = null;
let voiceGain = null;
let bgmSource = null;
let currentVoiceSource = null;

const audioBufferCache = new Map();

const getAudioContext = () => {
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    audioContext = new AudioContextClass();

    masterGain = audioContext.createGain();
    bgmGain = audioContext.createGain();
    voiceGain = audioContext.createGain();

    masterGain.gain.value = 1.0;
    bgmGain.gain.value = 0.25;
    voiceGain.gain.value = 1.0;

    bgmGain.connect(masterGain);
    voiceGain.connect(masterGain);
    masterGain.connect(audioContext.destination);
  }

  return audioContext;
};

const loadAudioBuffer = async (src) => {
  const ctx = getAudioContext();

  if (audioBufferCache.has(src)) {
    return audioBufferCache.get(src);
  }

  const response = await fetch(src);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  audioBufferCache.set(src, audioBuffer);

  return audioBuffer;
};

export const unlockAudio = async () => {
  const ctx = getAudioContext();

  if (ctx.state === "suspended") {
    await ctx.resume();
  }
};

export const preloadAudio = async (srcList) => {
  await unlockAudio();

  await Promise.all(
    srcList.map((src) => loadAudioBuffer(src))
  );
};

export const startBgm = async (src) => {
  const ctx = getAudioContext();

  await unlockAudio();

  if (bgmSource) {
    try {
      bgmSource.stop();
    } catch {
      //
    }

    bgmSource.disconnect();
    bgmSource = null;
  }

  const buffer = await loadAudioBuffer(src);

  bgmGain.gain.cancelScheduledValues(
    ctx.currentTime
  );

  bgmGain.gain.setValueAtTime(
    0.25,
    ctx.currentTime
  );

  bgmSource = ctx.createBufferSource();
  bgmSource.buffer = buffer;
  bgmSource.loop = true;

  bgmSource.connect(bgmGain);
  bgmSource.start(0);
};

export const stopBgm = () => {
  if (!bgmSource) {
    return;
  }

  bgmSource.stop();
  bgmSource.disconnect();
  bgmSource = null;
};

export const playVoice = async (src) => {
  const ctx = getAudioContext();

  await unlockAudio();

  if (currentVoiceSource) {
    try {
      currentVoiceSource.stop();
    } catch {
      //
    }

    currentVoiceSource.disconnect();
    currentVoiceSource = null;
  }

  const buffer = await loadAudioBuffer(src);

  const source = ctx.createBufferSource();

  source.buffer = buffer;

  source.connect(voiceGain);

  currentVoiceSource = source;

  source.start(0);

  source.onended = () => {
    if (currentVoiceSource === source) {
      currentVoiceSource = null;
    }

    source.disconnect();
  };
};

export const setBgmVolume = (volume) => {
  getAudioContext();

  bgmGain.gain.value = volume;
};

export const setVoiceVolume = (volume) => {
  getAudioContext();

  voiceGain.gain.value = volume;
};

export const fadeOutBgm = (duration = 2.0) => {
  const ctx = getAudioContext();

  const now = ctx.currentTime;
  const currentVolume = bgmGain.gain.value;

  bgmGain.gain.cancelScheduledValues(now);
  bgmGain.gain.setValueAtTime(currentVolume, now);
  bgmGain.gain.linearRampToValueAtTime(0, now + duration);
};