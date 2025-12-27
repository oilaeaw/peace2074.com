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
  });
  audio.addEventListener("pause", () => {
    // pause also fires on end; guard with ended event
    if (audio.ended) return;
    isPlaying.value = false;
  });
  audio.addEventListener("ended", () => {
    isPlaying.value = false;
    currentTime.value = 0;
  });
}

function play() {
  if (!audio) return;
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

function pause() {
  if (!audio) return;
  audio.pause();
}

function stop() {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  isPlaying.value = false;
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
