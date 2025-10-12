import { /* fasEarthAmericas, */ fasFlask } from 'https://use.fontawesome.com/releases/v6.1.1/css/all.css'
import { QSpinnerGears } from 'quasar'
// isClient!
export const isClient: bool = (): boolean => computed(() => Boolean(typeof window !== 'undefined' && 'serviceWorker' in navigator))
// App Name
export const appName = 'Peace2074'

// App Desciption
export const appDescription = 'Quran research and study'

// Local Storage Key Name
export const LSNAME = 'peace_ls:data'

// Session Storage Key Name
export const SSNAME = 'peace_ss:data'

// Cookie Storage Key Name
export const CSNAME = 'peace_cs:data'

// Nuxt Storage Key Name
export const NSNAME = 'peace_ns:data'

// Nuxt Mongo Key Name
export const MONSNAME = 'peace_ms:data'

export const StaticName = 'holybook';
export const allah = String.fromCharCode(1575, 1604, 1604, 1607);

export const links1 = [
  { icon: 'person', text: 'navigation.Profile', dist: '/auth/profile' },
  { icon: 'star_border', text: 'navigation.Favorites', dist: '/auth/favorites' },
  { icon: 'settings', text: 'navigation.SettingsPageTitle', dist: '/settings' },
  { icon: 'info', text: 'navigation.AboutPageTitle', dist: '/about' },
  { icon: 'mail', text: 'navigation.Messages', dist: '/user/inbox' },
  { icon: 'contact_page', text: 'navigation.ContactPageTitle', dist: '/contact' },
  { icon: 'manage_accounts', text: 'navigation.AdminPage', dist: '/admin' },
];

export const links2 = [
  { icon: 'web', text: 'Our blog', dist: '/blog' },
  { icon: 'science', text: 'Science', dist: '/' },
];

export const links3 = [
  { icon: '', text: 'navigation.SettingsPageTitle', dist: '/settings' },
  { icon: '', text: 'Send feedback', dist: '/contact' },
  { icon: 'help', text: 'Help', dist: '/help' },
];

export const projects = [
  { key: 'FavsShuffler', value: 'FavsShuffler', selected: false },
  { key: 'Sudoku17', value: 'Sudoku17', selected: false },
  { key: 'PicMyMenu.com', value: 'PicMyMenu.com', selected: false },
  { key: 'Api.PicMyMenu.com', value: 'PicMyMenu.com API', selected: false },
  { key: 'QuranInPixels', value: 'Quran in Pixels', selected: false },
  { key: 'TulipGlowShop', value: 'Tulip Glow Shop', selected: false },
  { key: 'Waelio.com', value: 'Waelio.com Site', selected: false },
];

export const sponsors = [
  { name: 'Quasar', img: 'https://cdn.quasar.dev/logo/svg/quasar-logo.svg', url: 'https://quasar.dev' },
  { name: 'Vue', img: 'https://vuejs.org/images/logo.png', url: 'https://vuejs.org/' },
  { name: 'Amazon', img: 'https://d1.awsstatic.com/training-and-certification/Certification%20Badges/AWS-Certified_Cloud-Practitioner_512x512.bc006f14f986fa4f3ca238b0b62be458ce1fb5ce.png', url: 'https://aws.amazon.com' },
  { name: 'Amplify', img: 'https://docs.amplify.aws/assets/ogp.jpg', url: 'https://aws.amazon.com/amplify/' },
  { name: 'Node', img: 'https://nodejs.org/static/images/logo.svg', url: 'https://nodejs.org/' },
  { name: 'MongoDB', img: 'https://infinapps.com/wp-content/uploads/2018/10/mongodb-logo.png', url: 'https://www.mongodb.com/' },
];

export const dialogDefaults = {
  title: 'Loading ...',
  dark: false,
  message: '0%',
  progress: { spinner: null },
  persistent: false,
  ok: false,
};

export const notifyDefaults = { timeout: 10000, position: 'top' };

export const loadingDefaults = { spinner: null, message: 'Processing ...' };

export const loadingBarDefaults = { color: 'primary', size: '10px', position: 'top' };

export const defaultStyles = {
  info: { icon: 'info', color: 'info', type: 'info' },
  success: { icon: 'check', color: 'positive', type: 'positive' },
  warning: { icon: 'warning', color: 'warning', type: 'warning' },
  error: { icon: 'announcement', color: 'negative', type: 'negative' },
};

export function c(can: (action: string, subject: string) => void) {
  can('read', 'post');
  can('update', 'post');
  can('add', 'post');
}

export const AlFateha = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';
