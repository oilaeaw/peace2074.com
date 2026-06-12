import { WebView, isIOS } from '@nativescript/core'

// iOS runtime globals (provided by @nativescript/ios). The project's tsconfig
// limits `types` to node, so declare the few we touch to keep ts-loader happy.
declare const WKUserScript: any
declare const WKUserContentController: any
declare const WKWebViewConfiguration: any
declare const WKWebView: any
declare const CGRectZero: any
declare const AVAudioSession: any
declare const AVAudioSessionCategoryPlayback: any

/**
 * WebView subclass that allows media (audio recitation) to autoplay inside the
 * iOS WKWebView without a prior user gesture.
 *
 * The stock NativeScript WebView never sets
 * `mediaTypesRequiringUserActionForPlayback`, so WKWebView defaults to `.all`
 * and silently blocks programmatic `audio.play()` until the user taps. The Siri
 * deep link (`peace2074://quran/<id>?autoplay=true`) relies on that programmatic
 * playback, so we must clear the requirement before the WKWebView is created
 * (the media policy cannot be changed after initialization).
 */
export class AutoplayWebView extends WebView {
  initNativeView() {
    super.initNativeView()
    // Ensure the audio session is in `.playback` right before the recitation
    // page loads, so the WebView's JS-initiated autoplay is audible without a
    // tap (and plays even when the ringer switch is silent).
    if (isIOS) {
      try {
        const session = AVAudioSession.sharedInstance()
        session.setCategoryError(AVAudioSessionCategoryPlayback)
        session.setActiveError(true)
      } catch (err) {
        console.error('[AutoplayWebView] AVAudioSession setup failed:', err)
      }
    }
  }

  createNativeView() {
    if (!isIOS) {
      return super.createNativeView()
    }

    console.log('[AutoplayWebView] createNativeView: enabling media autoplay')

    const jScript =
      "var meta = document.createElement('meta'); meta.setAttribute('name', 'viewport'); meta.setAttribute('content', 'initial-scale=1.0'); document.getElementsByTagName('head')[0].appendChild(meta);"
    const wkUScript = WKUserScript.alloc().initWithSourceInjectionTimeForMainFrameOnly(
      jScript,
      1, // WKUserScriptInjectionTime.AtDocumentEnd
      true
    )
    const wkUController = WKUserContentController.new()
    wkUController.addUserScript(wkUScript)

    const configuration = WKWebViewConfiguration.new()
    configuration.allowsInlineMediaPlayback = true
    configuration.allowsPictureInPictureMediaPlayback = true
    // 0 === WKAudiovisualMediaTypes.None -> no user gesture required to autoplay.
    configuration.mediaTypesRequiringUserActionForPlayback = 0
    configuration.userContentController = wkUController
    configuration.preferences.setValueForKey(true, 'allowFileAccessFromFileURLs')

    return new WKWebView({
      frame: CGRectZero,
      configuration: configuration,
    })
  }
}
