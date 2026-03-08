import { ref, onUnmounted } from "vue";
import athanSrc from "@/assets/audio/Athan.mp3";

const isClient = typeof Audio !== "undefined";
const audio = isClient ? new Audio(athanSrc) : null;
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);

if (audio) {
  audio.preload = "auto";
  audio.addEventListener("loadedmetadata", () => {
    duration.value = audio.duration || 0;
  });
  audio.addEventListener("timeupdate", () => {
    currentTime.value = audio.currentTime || 0;
  });
  audio.addEventListener("play", () => {
    isPlaying.value = true;

    // Track athan play event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'athan_interaction', {
        action: 'play',
        duration_remaining: Math.round((duration.value - currentTime.value)),
        page_path: window.location.pathname
      });
    }
  });
  audio.addEventListener("pause", () => {
    // pause also fires on end; guard with ended event
    if (audio.ended) return;
    isPlaying.value = false;

    // Track athan pause event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'athan_interaction', {
        action: 'pause',
        seconds_played: Math.round(currentTime.value),
        completion_percent: Math.round((currentTime.value / duration.value) * 100),
        page_path: window.location.pathname
      });
    }
  });
  audio.addEventListener("ended", () => {
    isPlaying.value = false;
    currentTime.value = 0;

    // Track athan completion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'athan_interaction', {
        action: 'completed',
        total_duration: Math.round(duration.value),
        page_path: window.location.pathname
      });
    }
  });
}

function play() {
  if (!audio) return;
  audio.currentTime = 0;
  void audio.play().catch(() => { });
}

function pause() {
  if (!audio) return;
  audio.pause();
}

function stop() {
  if (!audio) return;
  const secondsPlayed = Math.round(currentTime.value);
  const completionPercent = duration.value > 0 ? Math.round((currentTime.value / duration.value) * 100) : 0;

  audio.pause();
  audio.currentTime = 0;
  isPlaying.value = false;

  // Track athan stop event (explicit user action)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'athan_interaction', {
      action: 'stop',
      seconds_played: secondsPlayed,
      completion_percent: completionPercent,
      page_path: window.location.pathname
    });
  }
}

function toggle() {
  if (!audio) return;
  if (isPlaying.value) {
    pause();
  } else {
    play();
  }
}

export function useAthanPlayer() {
  onUnmounted(() => {
    // do not destroy shared audio; keep singleton state
  });

  return {
    play,
    pause,
    stop,
    toggle,
    isPlaying,
    currentTime,
    duration,
  };
}

export default useAthanPlayer;
