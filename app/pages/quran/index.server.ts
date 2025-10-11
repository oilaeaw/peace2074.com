import { eventHandler, sendRedirect } from 'h3'

export default eventHandler((event) => {
  // Server-side redirect from /quran to legacy /quran.bak
  // This ensures requests and prerendering for `/quran` succeed while keeping
  // the original `quran.bak` page intact.
  sendRedirect(event, '/quran.bak', 302)
})
