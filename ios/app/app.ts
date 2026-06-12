import { createApp, registerElement } from 'nativescript-vue'
import { isIOS } from '@nativescript/core'

import Home from './components/Home.vue'
import { AutoplayWebView } from './components/AutoplayWebView'

// iOS only allows audible, JS-initiated autoplay (e.g. the WebView's
// `new Audio().play()` for Siri recitation) when the app's shared audio session
// is in the `.playback` category. The default `soloAmbient` session keeps audio
// gated behind a user gesture, which is why recitation needed a manual tap.
declare const AVAudioSession: any
declare const AVAudioSessionCategoryPlayback: any

if (isIOS) {
  try {
    const session = AVAudioSession.sharedInstance()
    session.setCategoryError(AVAudioSessionCategoryPlayback)
    session.setActiveError(true)
  } catch (err) {
    console.error('[Peace2074] Failed to configure AVAudioSession:', err)
  }
}

registerElement('AutoplayWebView', () => AutoplayWebView)

createApp(Home).start()
