<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

interface HolyNameI {
  name: string
  text: string
  transliterationKey: string
  meaningKey: string
}

// The 99 Names of Allah
const holynames: HolyNameI[] = [
  { name: 'الرَّحْمَنُ', text: 'Ar-Rahman', transliterationKey: 'holyNames.1.transliteration', meaningKey: 'holyNames.1.meaning' },
  { name: 'الرَّحِيمُ', text: 'Ar-Raheem', transliterationKey: 'holyNames.2.transliteration', meaningKey: 'holyNames.2.meaning' },
  { name: 'الْمَلِكُ', text: 'Al-Malik', transliterationKey: 'holyNames.3.transliteration', meaningKey: 'holyNames.3.meaning' },
  { name: 'الْقُدُّوسُ', text: 'Al-Quddus', transliterationKey: 'holyNames.4.transliteration', meaningKey: 'holyNames.4.meaning' },
  { name: 'السَّلاَمُ', text: 'As-Salam', transliterationKey: 'holyNames.5.transliteration', meaningKey: 'holyNames.5.meaning' },
  { name: 'الْمُؤْمِنُ', text: 'Al-Mu\'min', transliterationKey: 'holyNames.6.transliteration', meaningKey: 'holyNames.6.meaning' },
  { name: 'الْمُهَيْمِنُ', text: 'Al-Muhaymin', transliterationKey: 'holyNames.7.transliteration', meaningKey: 'holyNames.7.meaning' },
  { name: 'الْعَزِيزُ', text: 'Al-Aziz', transliterationKey: 'holyNames.8.transliteration', meaningKey: 'holyNames.8.meaning' },
  { name: 'الْجَبَّارُ', text: 'Al-Jabbar', transliterationKey: 'holyNames.9.transliteration', meaningKey: 'holyNames.9.meaning' },
  { name: 'الْمُتَكَبِّرُ', text: 'Al-Mutakabbir', transliterationKey: 'holyNames.10.transliteration', meaningKey: 'holyNames.10.meaning' },
  { name: 'الْخَالِقُ', text: 'Al-Khaliq', transliterationKey: 'holyNames.11.transliteration', meaningKey: 'holyNames.11.meaning' },
  { name: 'الْبَارِئُ', text: 'Al-Bari', transliterationKey: 'holyNames.12.transliteration', meaningKey: 'holyNames.12.meaning' },
  { name: 'الْمُصَوِّرُ', text: 'Al-Musawwir', transliterationKey: 'holyNames.13.transliteration', meaningKey: 'holyNames.13.meaning' },
  { name: 'الْغَفَّارُ', text: 'Al-Ghaffar', transliterationKey: 'holyNames.14.transliteration', meaningKey: 'holyNames.14.meaning' },
  { name: 'الْقَهَّارُ', text: 'Al-Qahhar', transliterationKey: 'holyNames.15.transliteration', meaningKey: 'holyNames.15.meaning' },
  { name: 'الْوَهَّابُ', text: 'Al-Wahhab', transliterationKey: 'holyNames.16.transliteration', meaningKey: 'holyNames.16.meaning' },
  { name: 'الرَّزَّاقُ', text: 'Ar-Razzaq', transliterationKey: 'holyNames.17.transliteration', meaningKey: 'holyNames.17.meaning' },
  { name: 'الْفَتَّاحُ', text: 'Al-Fattah', transliterationKey: 'holyNames.18.transliteration', meaningKey: 'holyNames.18.meaning' },
  { name: 'الْعَلِيمُ', text: 'Al-Alim', transliterationKey: 'holyNames.19.transliteration', meaningKey: 'holyNames.19.meaning' },
  { name: 'الْقَابِضُ', text: 'Al-Qabid', transliterationKey: 'holyNames.20.transliteration', meaningKey: 'holyNames.20.meaning' },
  { name: 'الْبَاسِطُ', text: 'Al-Basit', transliterationKey: 'holyNames.21.transliteration', meaningKey: 'holyNames.21.meaning' },
  { name: 'الْخَافِضُ', text: 'Al-Khafid', transliterationKey: 'holyNames.22.transliteration', meaningKey: 'holyNames.22.meaning' },
  { name: 'الرَّافِعُ', text: 'Ar-Rafi', transliterationKey: 'holyNames.23.transliteration', meaningKey: 'holyNames.23.meaning' },
  { name: 'الْمُعِزُّ', text: 'Al-Mu\'izz', transliterationKey: 'holyNames.24.transliteration', meaningKey: 'holyNames.24.meaning' },
  { name: 'الْمُذِلُّ', text: 'Al-Muzil', transliterationKey: 'holyNames.25.transliteration', meaningKey: 'holyNames.25.meaning' },
  { name: 'السَّمِيعُ', text: 'As-Sami', transliterationKey: 'holyNames.26.transliteration', meaningKey: 'holyNames.26.meaning' },
  { name: 'الْبَصِيرُ', text: 'Al-Basir', transliterationKey: 'holyNames.27.transliteration', meaningKey: 'holyNames.27.meaning' },
  { name: 'الْحَكَمُ', text: 'Al-Hakam', transliterationKey: 'holyNames.28.transliteration', meaningKey: 'holyNames.28.meaning' },
  { name: 'الْعَدْلُ', text: 'Al-Adl', transliterationKey: 'holyNames.29.transliteration', meaningKey: 'holyNames.29.meaning' },
  { name: 'اللَّطِيفُ', text: 'Al-Latif', transliterationKey: 'holyNames.30.transliteration', meaningKey: 'holyNames.30.meaning' },
  { name: 'الْخَبِيرُ', text: 'Al-Khabir', transliterationKey: 'holyNames.31.transliteration', meaningKey: 'holyNames.31.meaning' },
  { name: 'الْحَلِيمُ', text: 'Al-Halim', transliterationKey: 'holyNames.32.transliteration', meaningKey: 'holyNames.32.meaning' },
  { name: 'الْعَظِيمُ', text: 'Al-Azim', transliterationKey: 'holyNames.33.transliteration', meaningKey: 'holyNames.33.meaning' },
  { name: 'الْغَفُورُ', text: 'Al-Ghafur', transliterationKey: 'holyNames.34.transliteration', meaningKey: 'holyNames.34.meaning' },
  { name: 'الشَّكُورُ', text: 'Ash-Shakur', transliterationKey: 'holyNames.35.transliteration', meaningKey: 'holyNames.35.meaning' },
  { name: 'الْعَلِيُّ', text: 'Al-Ali', transliterationKey: 'holyNames.36.transliteration', meaningKey: 'holyNames.36.meaning' },
  { name: 'الْكَبِيرُ', text: 'Al-Kabir', transliterationKey: 'holyNames.37.transliteration', meaningKey: 'holyNames.37.meaning' },
  { name: 'الْحَفِيظُ', text: 'Al-Hafiz', transliterationKey: 'holyNames.38.transliteration', meaningKey: 'holyNames.38.meaning' },
  { name: 'الْمُقِيتُ', text: 'Al-Muqit', transliterationKey: 'holyNames.39.transliteration', meaningKey: 'holyNames.39.meaning' },
  { name: 'الْحَسِيبُ', text: 'Al-Hasib', transliterationKey: 'holyNames.40.transliteration', meaningKey: 'holyNames.40.meaning' },
  { name: 'الْجَلِيلُ', text: 'Al-Jalil', transliterationKey: 'holyNames.41.transliteration', meaningKey: 'holyNames.41.meaning' },
  { name: 'الْكَرِيمُ', text: 'Al-Karim', transliterationKey: 'holyNames.42.transliteration', meaningKey: 'holyNames.42.meaning' },
  { name: 'الرَّقِيبُ', text: 'Ar-Raqib', transliterationKey: 'holyNames.43.transliteration', meaningKey: 'holyNames.43.meaning' },
  { name: 'الْمُجِيبُ', text: 'Al-Mujib', transliterationKey: 'holyNames.44.transliteration', meaningKey: 'holyNames.44.meaning' },
  { name: 'الْوَاسِعُ', text: 'Al-Wasi', transliterationKey: 'holyNames.45.transliteration', meaningKey: 'holyNames.45.meaning' },
  { name: 'الْحَكِيمُ', text: 'Al-Hakim', transliterationKey: 'holyNames.46.transliteration', meaningKey: 'holyNames.46.meaning' },
  { name: 'الْوَدُودُ', text: 'Al-Wadud', transliterationKey: 'holyNames.47.transliteration', meaningKey: 'holyNames.47.meaning' },
  { name: 'الْمَجِيدُ', text: 'Al-Majid', transliterationKey: 'holyNames.48.transliteration', meaningKey: 'holyNames.48.meaning' },
  { name: 'الْبَاعِثُ', text: 'Al-Ba\'ith', transliterationKey: 'holyNames.49.transliteration', meaningKey: 'holyNames.49.meaning' },
  { name: 'الشَّهِيدُ', text: 'Ash-Shahid', transliterationKey: 'holyNames.50.transliteration', meaningKey: 'holyNames.50.meaning' },
  { name: 'الْحَقُّ', text: 'Al-Haqq', transliterationKey: 'holyNames.51.transliteration', meaningKey: 'holyNames.51.meaning' },
  { name: 'الْوَكِيلُ', text: 'Al-Wakil', transliterationKey: 'holyNames.52.transliteration', meaningKey: 'holyNames.52.meaning' },
  { name: 'الْقَوِيُّ', text: 'Al-Qawiyy', transliterationKey: 'holyNames.53.transliteration', meaningKey: 'holyNames.53.meaning' },
  { name: 'الْمَتِينُ', text: 'Al-Matin', transliterationKey: 'holyNames.54.transliteration', meaningKey: 'holyNames.54.meaning' },
  { name: 'الْوَلِيُّ', text: 'Al-Waliyy', transliterationKey: 'holyNames.55.transliteration', meaningKey: 'holyNames.55.meaning' },
  { name: 'الْحَمِيدُ', text: 'Al-Hamid', transliterationKey: 'holyNames.56.transliteration', meaningKey: 'holyNames.56.meaning' },
  { name: 'الْمُحْصِي', text: 'Al-Muhsi', transliterationKey: 'holyNames.57.transliteration', meaningKey: 'holyNames.57.meaning' },
  { name: 'الْمُبْدِئُ', text: 'Al-Mubdi', transliterationKey: 'holyNames.58.transliteration', meaningKey: 'holyNames.58.meaning' },
  { name: 'الْمُعِيدُ', text: 'Al-Mu\'id', transliterationKey: 'holyNames.59.transliteration', meaningKey: 'holyNames.59.meaning' },
  { name: 'الْمُحْيِي', text: 'Al-Muhyi', transliterationKey: 'holyNames.60.transliteration', meaningKey: 'holyNames.60.meaning' },
  { name: 'الْمُمِيتُ', text: 'Al-Mumit', transliterationKey: 'holyNames.61.transliteration', meaningKey: 'holyNames.61.meaning' },
  { name: 'الْحَيُّ', text: 'Al-Hayy', transliterationKey: 'holyNames.62.transliteration', meaningKey: 'holyNames.62.meaning' },
  { name: 'الْقَيُّومُ', text: 'Al-Qayyum', transliterationKey: 'holyNames.63.transliteration', meaningKey: 'holyNames.63.meaning' },
  { name: 'الْوَاجِدُ', text: 'Al-Wajid', transliterationKey: 'holyNames.64.transliteration', meaningKey: 'holyNames.64.meaning' },
  { name: 'الْمَاجِدُ', text: 'Al-Majid', transliterationKey: 'holyNames.65.transliteration', meaningKey: 'holyNames.65.meaning' },
  { name: 'الْوَاحِدُ', text: 'Al-Wahid', transliterationKey: 'holyNames.66.transliteration', meaningKey: 'holyNames.66.meaning' },
  { name: 'الأَحَد', text: 'Al-Ahad', transliterationKey: 'holyNames.67.transliteration', meaningKey: 'holyNames.67.meaning' },
  { name: 'الصَّمَدُ', text: 'As-Samad', transliterationKey: 'holyNames.68.transliteration', meaningKey: 'holyNames.68.meaning' },
  { name: 'الْقَادِرُ', text: 'Al-Qadir', transliterationKey: 'holyNames.69.transliteration', meaningKey: 'holyNames.69.meaning' },
  { name: 'الْمُقْتَدِرُ', text: 'Al-Muqtadir', transliterationKey: 'holyNames.70.transliteration', meaningKey: 'holyNames.70.meaning' },
  { name: 'الْمُقَدِّمُ', text: 'Al-Muqaddim', transliterationKey: 'holyNames.71.transliteration', meaningKey: 'holyNames.71.meaning' },
  { name: 'الْمُؤَخِّرُ', text: 'Al-Mu\'akhkhir', transliterationKey: 'holyNames.72.transliteration', meaningKey: 'holyNames.72.meaning' },
  { name: 'الأَوَّلُ', text: 'Al-Awwal', transliterationKey: 'holyNames.73.transliteration', meaningKey: 'holyNames.73.meaning' },
  { name: 'الآخِرُ', text: 'Al-Akhir', transliterationKey: 'holyNames.74.transliteration', meaningKey: 'holyNames.74.meaning' },
  { name: 'الظَّاهِرُ', text: 'Az-Zahir', transliterationKey: 'holyNames.75.transliteration', meaningKey: 'holyNames.75.meaning' },
  { name: 'الْبَاطِنُ', text: 'Al-Batin', transliterationKey: 'holyNames.76.transliteration', meaningKey: 'holyNames.76.meaning' },
  { name: 'الْوَالِي', text: 'Al-Wali', transliterationKey: 'holyNames.77.transliteration', meaningKey: 'holyNames.77.meaning' },
  { name: 'الْمُتَعَالِي', text: 'Al-Muta\'ali', transliterationKey: 'holyNames.78.transliteration', meaningKey: 'holyNames.78.meaning' },
  { name: 'الْبَرُّ', text: 'Al-Barr', transliterationKey: 'holyNames.79.transliteration', meaningKey: 'holyNames.79.meaning' },
  { name: 'التَّوَّابُ', text: 'At-Tawwab', transliterationKey: 'holyNames.80.transliteration', meaningKey: 'holyNames.80.meaning' },
  { name: 'الْمُنْتَقِمُ', text: 'Al-Muntaqim', transliterationKey: 'holyNames.81.transliteration', meaningKey: 'holyNames.81.meaning' },
  { name: 'الْعَفُوُّ', text: 'Al-Afuww', transliterationKey: 'holyNames.82.transliteration', meaningKey: 'holyNames.82.meaning' },
  { name: 'الرَّؤُوفُ', text: 'Ar-Ra\'uf', transliterationKey: 'holyNames.83.transliteration', meaningKey: 'holyNames.83.meaning' },
  { name: 'مَالِكُ الْمُلْكِ', text: 'Malik-ul-Mulk', transliterationKey: 'holyNames.84.transliteration', meaningKey: 'holyNames.84.meaning' },
  { name: 'ذُو الْجَلاَلِ وَالإِكْرَامِ', text: 'Dhul-Jalali wal-Ikram', transliterationKey: 'holyNames.85.transliteration', meaningKey: 'holyNames.85.meaning' },
  { name: 'الْمُقْسِطُ', text: 'Al-Muqsit', transliterationKey: 'holyNames.86.transliteration', meaningKey: 'holyNames.86.meaning' },
  { name: 'الْجَامِعُ', text: 'Al-Jami', transliterationKey: 'holyNames.87.transliteration', meaningKey: 'holyNames.87.meaning' },
  { name: 'الْغَنِيُّ', text: 'Al-Ghani', transliterationKey: 'holyNames.88.transliteration', meaningKey: 'holyNames.88.meaning' },
  { name: 'الْمُغْنِي', text: 'Al-Mughni', transliterationKey: 'holyNames.89.transliteration', meaningKey: 'holyNames.89.meaning' },
  { name: 'الْمَانِعُ', text: 'Al-Mani', transliterationKey: 'holyNames.90.transliteration', meaningKey: 'holyNames.90.meaning' },
  { name: 'الضَّارُّ', text: 'Ad-Darr', transliterationKey: 'holyNames.91.transliteration', meaningKey: 'holyNames.91.meaning' },
  { name: 'النَّافِعُ', text: 'An-Nafi', transliterationKey: 'holyNames.92.transliteration', meaningKey: 'holyNames.92.meaning' },
  { name: 'النُّورُ', text: 'An-Nur', transliterationKey: 'holyNames.93.transliteration', meaningKey: 'holyNames.93.meaning' },
  { name: 'الْهَادِي', text: 'Al-Hadi', transliterationKey: 'holyNames.94.transliteration', meaningKey: 'holyNames.94.meaning' },
  { name: 'الْبَدِيعُ', text: 'Al-Badi', transliterationKey: 'holyNames.95.transliteration', meaningKey: 'holyNames.95.meaning' },
  { name: 'الْبَاقِي', text: 'Al-Baqi', transliterationKey: 'holyNames.96.transliteration', meaningKey: 'holyNames.96.meaning' },
  { name: 'الْوَارِثُ', text: 'Al-Warith', transliterationKey: 'holyNames.97.transliteration', meaningKey: 'holyNames.97.meaning' },
  { name: 'الرَّشِيدُ', text: 'Ar-Rashid', transliterationKey: 'holyNames.98.transliteration', meaningKey: 'holyNames.98.meaning' },
  { name: 'الصَّبُورُ', text: 'As-Sabur', transliterationKey: 'holyNames.99.transliteration', meaningKey: 'holyNames.99.meaning' },
]
</script>

<template>
  <q-page class="holynames-page">
    <div class="page-content">
      <div class="bismillah">﷽</div>
      
      <h1 class="page-title text-h3 q-mb-xs">
        {{ $t("The 99 Holy Names of Allah") }}
      </h1>
      
      <div class="subtitle text-subtitle1 q-mb-lg">
        {{ $t("Asma' Allah Al-Husna") }}
      </div>
      
      <div class="names-grid">
        <div v-for="one in holynames" :key="one.text" class="glory-card islamic-border">
          <span class="arabic-name">{{ one.name }}</span>
          <span v-if="locale !== 'ar'" class="latin-name">{{ one.text }}</span>
          <span class="transliteration">{{ $t(one.transliterationKey) }}</span>
          <span class="meaning">{{ $t(one.meaningKey) }}</span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Noto+Naskh+Arabic:wght@700&display=swap');

.holynames-page {
  background: linear-gradient(135deg, #f9fafb 0%, #e8f0e8 100%);
  min-height: 100vh;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.bismillah {
  font-family: 'Amiri', serif;
  font-size: clamp(2rem, 6vw, 8rem);
  color: #bfa14a;
  text-align: center;
  letter-spacing: 0.2em;
  text-shadow: 0 2px 8px #e0d7c6;
  margin-bottom: 2rem;
}

.page-title {
  text-align: center;
  font-family: 'Noto Naskh Arabic', 'Amiri', serif;
  color: #176a3a;
  font-weight: bold;
  letter-spacing: 0.05em;
}

.subtitle {
  text-align: center;
  font-family: 'Amiri', serif;
  color: #bfa14a;
  letter-spacing: 0.1em;
}

.names-grid {
  column-count: 4;
  column-gap: 2rem;
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 1rem;
  box-sizing: border-box;
}

@media (max-width: 1200px) {
  .names-grid {
    column-count: 3;
  }
}

@media (max-width: 900px) {
  .names-grid {
    column-count: 2;
  }
}

@media (max-width: 600px) {
  .names-grid {
    column-count: 1;
  }
}

.glory-card {
  background: #fffbe6;
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px 0 rgba(34, 139, 34, 0.08);
  padding: 1.2rem 0.5rem;
  text-align: center;
  border: 2px solid #e0d7c6;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  word-break: break-word;
  box-sizing: border-box;
  margin-bottom: 2rem;
  break-inside: avoid;
  page-break-inside: avoid;
}

.glory-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 8px 32px 0 rgba(34, 139, 34, 0.18);
  border-color: #bfa14a;
}

.islamic-border {
  border-image: url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="38" height="38" rx="8" stroke="%23bfa14a" stroke-width="2" stroke-dasharray="6 4"/></svg>')
    8 stretch;
}

.arabic-name {
  display: block;
  font-family: 'Noto Naskh Arabic', 'Amiri', serif;
  font-size: 2.2rem;
  color: #176a3a;
  margin-bottom: 0.5rem;
  font-weight: bold;
  letter-spacing: 0.1em;
}

.latin-name {
  display: block;
  font-size: 1.1rem;
  color: #7c6f57;
  font-family: 'Lato', sans-serif;
  margin-top: 0.2rem;
}

.transliteration {
  display: block;
  font-size: 1rem;
  color: #bfa14a;
  font-family: 'Lato', sans-serif;
  margin-top: 0.2rem;
}

.meaning {
  display: block;
  font-size: 0.95rem;
  color: #176a3a;
  font-family: 'Lato', sans-serif;
  margin-top: 0.2rem;
}

@media (max-width: 600px) {
  .names-grid {
    column-count: 1;
    padding: 0 0.3rem;
  }

  .glory-card {
    padding: 1rem 0.3rem;
    font-size: 1.1rem;
    margin-bottom: 1.2rem;
  }

  .arabic-name {
    font-size: 1.4rem;
  }
}
</style>
