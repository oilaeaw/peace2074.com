import { ref, onMounted, onUnmounted } from 'vue';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { useAthanPlayer } from './useAthanPlayer';

export function usePrayerTimes() {
  const { play } = useAthanPlayer();
  const prayerTimes = ref<PrayerTimes | null>(null);
  const nextPrayer = ref<string | null>(null);
  const nextPrayerTime = ref<Date | null>(null);
  
  // Default to Jerusalem (Al-Aqsa)
  const location = ref({
    latitude: 31.7761,
    longitude: 35.2358,
    name: 'Jerusalem'
  });

  let checkInterval: ReturnType<typeof setInterval> | null = null;
  let hasPlayedForCurrentPrayer = false;

  const calculateTimes = () => {
    const coordinates = new Coordinates(location.value.latitude, location.value.longitude);
    const date = new Date();
    // Use Muslim World League or Umm Al-Qura depending on region, MWL is a good default
    const params = CalculationMethod.MuslimWorldLeague();
    
    const times = new PrayerTimes(coordinates, date, params);
    prayerTimes.value = times;
    
    // Find next prayer
    const next = times.nextPrayer();
    if (next && next !== 'none') {
      nextPrayer.value = next;
      nextPrayerTime.value = times.timeForPrayer(next);
      hasPlayedForCurrentPrayer = false;
    }
  };

  const checkForAthan = () => {
    if (!nextPrayerTime.value) return;

    const now = new Date();
    // If we are within 1 minute of the prayer time, play the athan!
    if (
      !hasPlayedForCurrentPrayer &&
      now.getHours() === nextPrayerTime.value.getHours() &&
      now.getMinutes() === nextPrayerTime.value.getMinutes()
    ) {
      console.log(`Time for ${nextPrayer.value}!`);
      
      const isAutoPlayEnabled = typeof window !== 'undefined' 
        ? window.localStorage.getItem('pref-autoplay-prayer-times') !== 'false'
        : true; // Default to true if not set
        
      if (isAutoPlayEnabled) {
        console.log('Playing Athan...');
        play();
      } else {
        console.log('Athan auto-play is disabled in settings.');
      }
      
      hasPlayedForCurrentPrayer = true;
      
      // Recalculate to set the next prayer
      setTimeout(() => calculateTimes(), 60000); 
    }
  };

  const updateLocationToCurrent = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        location.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          name: 'Current Location'
        };
        calculateTimes();
      }, (error) => {
        console.warn('Geolocation failed, falling back to Jerusalem.', error);
      });
    }
  };

  const startAthanScheduler = () => {
    calculateTimes();
    
    // Check every 30 seconds
    if (checkInterval) clearInterval(checkInterval);
    checkInterval = setInterval(checkForAthan, 30000);
  };

  const stopAthanScheduler = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  };

  onMounted(() => {
    startAthanScheduler();
  });

  onUnmounted(() => {
    stopAthanScheduler();
  });

  return {
    prayerTimes,
    nextPrayer,
    nextPrayerTime,
    location,
    updateLocationToCurrent,
    startAthanScheduler,
    stopAthanScheduler
  };
}

export default usePrayerTimes;
