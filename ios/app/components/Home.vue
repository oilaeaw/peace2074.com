<template>
  <Frame class="app-frame">
    <Page
      class="app-page"
      actionBarHidden="true"
      backgroundColor="#08111c"
      :iosOverflowSafeArea="true"
      :iosOverflowSafeAreaEnabled="true"
    >
      <GridLayout
        rows="*"
        class="app-shell"
        :iosOverflowSafeArea="true"
        :iosOverflowSafeAreaEnabled="true"
      >
        <WebView
          row="0"
          class="app-webview"
          :key="webViewKey"
          :src="webViewSrc"
          :iosOverflowSafeArea="true"
          :iosOverflowSafeAreaEnabled="true"
          @loadStarted="onLoadStarted"
          @loadFinished="onLoadFinished"
        />

        <GridLayout
          v-if="isLoading"
          rows="auto,auto"
          class="overlay-card loading-card"
          :width="loadingCardWidth"
          verticalAlignment="center"
          horizontalAlignment="center"
        >
          <ActivityIndicator
            row="0"
            busy="true"
            width="36"
            height="36"
            color="#0A6B44"
          />
          <Label
            row="1"
            :text="loadingMessage"
            class="overlay-text"
            textAlignment="center"
          />
        </GridLayout>

        <GridLayout
          v-if="errorMessage"
          rows="auto,auto,auto"
          class="overlay-card error-card"
          :width="errorCardWidth"
          verticalAlignment="center"
          horizontalAlignment="center"
        >
          <Label
            row="0"
            text="Unable to load PEACE2074"
            class="overlay-title"
            textAlignment="center"
          />
          <Label
            row="1"
            :text="errorMessage"
            class="overlay-text"
            textWrap="true"
            textAlignment="center"
          />
          <Button row="2" text="Retry" class="retry-button" @tap="retryLoad" />
        </GridLayout>
      </GridLayout>
    </Page>
  </Frame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'nativescript-vue'
import {
  Utils,
  Screen,
  android as androidApp,
  ios as iosApp,
  isAndroid,
  isIOS,
  type LoadEventData,
  type WebView as NativeScriptWebView,
} from '@nativescript/core'

type OAuthProvider = 'google' | 'apple'

const appOrigin = 'https://peace2074.com'
const nativeCallbackBase = 'peace2074://auth/callback'
const CARD_SIDE_MARGIN = 32
const LOADING_CARD_MAX_WIDTH = 360
const ERROR_CARD_MAX_WIDTH = 420
const webViewSrc = ref(`${appOrigin}?native=1`)
const isLoading = ref(true)
const loadingMessage = ref('Loading PEACE2074...')
const errorMessage = ref('')
const webViewKey = ref(0)
const webView = ref<NativeScriptWebView | null>(null)
const oauthInProgress = ref<OAuthProvider | null>(null)
const currentAppUrl = ref(appOrigin)

let iosOpenUrlObserver: unknown = null
let androidIntentHandler: ((args: unknown) => void) | null = null
let safariAuthController: SFSafariViewController | null = null

function getResponsiveCardWidth(maxWidth: number) {
  const availableWidth = Math.max(
    Screen.mainScreen.widthDIPs - CARD_SIDE_MARGIN,
    280
  )
  return Math.min(availableWidth, maxWidth)
}

const loadingCardWidth = getResponsiveCardWidth(LOADING_CARD_MAX_WIDTH)
const errorCardWidth = getResponsiveCardWidth(ERROR_CARD_MAX_WIDTH)

function buildNativeOAuthUrl(provider: OAuthProvider) {
  return `${appOrigin}/api/auth/${provider}?ts=${Date.now()}&native=1`
}

function getProviderLabel(provider: OAuthProvider) {
  return provider === 'google' ? 'Google' : 'Apple'
}

function isPeaceAppUrl(url: string) {
  return url.startsWith(`${appOrigin}/`) || url === appOrigin
}

function resolveOAuthProvider(url: string): OAuthProvider | null {
  const normalized = String(url || '')
    .trim()
    .toLowerCase()
  if (!normalized) return null

  if (
    normalized.startsWith(`${appOrigin}/api/auth/google`) ||
    normalized.startsWith('https://accounts.google.com') ||
    normalized.startsWith('https://oauth2.googleapis.com') ||
    normalized.startsWith('https://openidconnect.googleapis.com')
  ) {
    return 'google'
  }

  if (
    normalized.startsWith(`${appOrigin}/api/auth/apple`) ||
    normalized.startsWith('https://appleid.apple.com')
  ) {
    return 'apple'
  }

  return null
}

function isBenignLoadError(error: string) {
  return /cancel|cancelled|canceled|frame load interrupted|unsupported url/i.test(
    error
  )
}

function updateLoadingState(message = 'Loading PEACE2074...') {
  loadingMessage.value = message
  isLoading.value = true
  errorMessage.value = ''
}

function finishLoading() {
  if (!oauthInProgress.value) {
    loadingMessage.value = 'Loading PEACE2074...'
    isLoading.value = false
  }
}

function rememberCurrentAppUrl(url: string) {
  if (!isPeaceAppUrl(url)) return
  if (url.includes('/api/auth/')) return
  currentAppUrl.value = url
}

function getPresentingController() {
  if (!isIOS) return null

  let controller = iosApp.rootController
  while (controller?.presentedViewController) {
    controller = controller.presentedViewController
  }

  return controller
}

function dismissIosAuthController() {
  if (!isIOS || !safariAuthController) return

  const controller = safariAuthController
  safariAuthController = null
  controller.dismissViewControllerAnimatedCompletion(true, null)
}

function openNativeOAuth(provider: OAuthProvider) {
  if (oauthInProgress.value) return

  const url = buildNativeOAuthUrl(provider)
  oauthInProgress.value = provider
  updateLoadingState(
    `Continue ${getProviderLabel(provider)} sign-in in the secure browser...`
  )

  let opened = false

  if (isIOS) {
    const presentingController = getPresentingController()
    const nsUrl = NSURL.URLWithString(url)

    if (presentingController && nsUrl) {
      safariAuthController = SFSafariViewController.alloc().initWithURL(nsUrl)
      presentingController.presentViewControllerAnimatedCompletion(
        safariAuthController,
        true,
        null
      )
      opened = true
    }
  } else {
    opened = Utils.openUrl(url)
  }

  if (!opened) {
    oauthInProgress.value = null
    loadingMessage.value = 'Loading PEACE2074...'
    isLoading.value = false
    errorMessage.value = `Unable to open ${getProviderLabel(provider)} sign-in.`
  }
}

function reloadApp(url = appOrigin) {
  webViewSrc.value = url
  webViewKey.value += 1
  updateLoadingState()
}

function getOAuthErrorMessage(code: string) {
  switch (code) {
    case 'google-state-invalid':
      return 'Google sign-in expired. Please try again.'
    case 'apple-state-invalid':
      return 'Apple sign-in expired. Please try again.'
    case 'apple-not-configured':
      return 'Apple sign-in is not configured yet.'
    case 'oauth-state-invalid':
      return 'The secure sign-in session expired. Please try again.'
    default:
      return 'Secure sign-in did not complete. Please try again.'
  }
}

function handleNativeCallback(url: string) {
  if (!url.startsWith('peace2074://')) return

  dismissIosAuthController()

  // Handle generic deep links (e.g. peace2074://quran)
  if (!url.startsWith(nativeCallbackBase)) {
    const path = url.replace('peace2074://', '')
    const webUrl = `${appOrigin}/${path}${path.includes('?') ? '&' : '?'}native=1`
    reloadApp(webUrl)
    return
  }

  const parsed = new URL(url)
  const authComplete = parsed.searchParams.get('authComplete')
  const oauthError = parsed.searchParams.get('oauthError')

  oauthInProgress.value = null
  loadingMessage.value = 'Loading PEACE2074...'

  if (oauthError) {
    isLoading.value = false
    errorMessage.value = getOAuthErrorMessage(oauthError)
    return
  }

  if (authComplete === '1') {
    const token = parsed.searchParams.get('token')
    let reloadUrl = currentAppUrl.value || appOrigin
    const urlObj = new URL(reloadUrl)
    urlObj.searchParams.set('native', '1')
    if (token) {
      urlObj.searchParams.set('token', token)
    }
    reloadApp(urlObj.toString())
    return
  }

  isLoading.value = false
}

function donateSiriActivity(activityType: string, title: string, suggestedInvocationPhrase: string) {
  if (!isIOS) return
  try {
    const activity = NSUserActivity.alloc().initWithActivityType(activityType)
    activity.title = title
    activity.eligibleForSearch = true
    activity.eligibleForPrediction = true
    activity.suggestedInvocationPhrase = suggestedInvocationPhrase
    
    const controller = getPresentingController()
    if (controller) {
      controller.userActivity = activity
    }
    activity.becomeCurrent()
  } catch (err) {
    console.error('Failed to donate Siri activity:', err)
  }
}

function handleIosOpenUrl(notification: NSNotification) {
  const userInfo = notification.userInfo
  const value = userInfo?.objectForKey?.('url')
  const url = String(value || '')

  if (url) {
    handleNativeCallback(url)
  }
}

function handleAndroidIntent(args: unknown) {
  const intent = (args as { intent?: android.content.Intent | null })?.intent
  const url =
    intent && typeof intent.getDataString === 'function'
      ? String(intent.getDataString() || '')
      : ''

  if (url) {
    handleNativeCallback(url)
  }
}

const onLoadStarted = (event: LoadEventData) => {
  webView.value = event.object as NativeScriptWebView

  const url = String(event.url || '')
  const provider = resolveOAuthProvider(url)

  if (provider) {
    webView.value?.stopLoading()
    openNativeOAuth(provider)
    return
  }

  rememberCurrentAppUrl(url)
  updateLoadingState()
}

const onLoadFinished = (event: LoadEventData) => {
  webView.value = event.object as NativeScriptWebView

  if (event.url) {
    const loadedUrl = String(event.url)
    rememberCurrentAppUrl(loadedUrl)
    
    if (isIOS) {
      if (loadedUrl.includes('/quran')) {
        donateSiriActivity('com.peace2074.quran', 'Read Quran', 'Open Quran in Peace')
      } else if (loadedUrl.includes('/tasbeeh')) {
        donateSiriActivity('com.peace2074.tasbeeh', 'Start Tasbeeh', 'Start Tasbeeh in Peace')
      }
    }
  }

  if (event.error) {
    if (oauthInProgress.value && isBenignLoadError(event.error)) {
      return
    }

    errorMessage.value = event.error
    loadingMessage.value = 'Loading PEACE2074...'
    isLoading.value = false
    return
  }

  errorMessage.value = ''
  finishLoading()
}

const retryLoad = () => {
  oauthInProgress.value = null
  dismissIosAuthController()
  errorMessage.value = ''
  reloadApp(currentAppUrl.value || appOrigin)
}

onMounted(() => {
  if (isIOS) {
    iosApp.addDelegateHandler(
      'applicationOpenURLOptions' as keyof UIApplicationDelegate,
      (_application, url) => {
        const callbackUrl = String(url?.absoluteString || '')
        if (callbackUrl) {
          handleNativeCallback(callbackUrl)
        }
        return true
      }
    )

    iosApp.addDelegateHandler(
      'applicationContinueUserActivityRestorationHandler' as keyof UIApplicationDelegate,
      (_application, userActivity) => {
        const activityType = String((userActivity as any).activityType || '')
        if (activityType === 'com.peace2074.quran') {
          handleNativeCallback('peace2074://quran')
          return true
        } else if (activityType === 'com.peace2074.tasbeeh') {
          handleNativeCallback('peace2074://tasbeeh')
          return true
        }
        return false
      }
    )

    iosOpenUrlObserver = iosApp.addNotificationObserver(
      'NativeScriptOpenURL',
      handleIosOpenUrl
    )
  }

  if (isAndroid) {
    androidIntentHandler = (args: unknown) => handleAndroidIntent(args)
    androidApp.on(androidApp.activityNewIntentEvent, androidIntentHandler)
    handleAndroidIntent({
      intent: androidApp.foregroundActivity?.getIntent?.(),
    })
  }
})

onUnmounted(() => {
  dismissIosAuthController()

  if (isIOS && iosOpenUrlObserver) {
    iosApp.removeNotificationObserver(iosOpenUrlObserver, 'NativeScriptOpenURL')
    iosOpenUrlObserver = null
  }

  if (isAndroid && androidIntentHandler) {
    androidApp.off(androidApp.activityNewIntentEvent, androidIntentHandler)
    androidIntentHandler = null
  }
})
</script>

<style scoped>
.app-frame,
.app-page,
.app-shell,
.app-webview {
  background-color: #08111c;
}

.overlay-card {
  padding: 24;
  background-color: rgba(255, 255, 255, 0.94);
  border-radius: 24;
  margin: 16;
}

.loading-card {
  min-width: 220;
}

.error-card {
  min-width: 280;
}

.overlay-title {
  font-size: 24;
  color: #0a6b44;
  margin-bottom: 12;
}

.overlay-text {
  font-size: 16;
  color: #4b5563;
  margin-top: 12;
  margin-bottom: 12;
}

.retry-button {
  margin-top: 16;
  padding: 12;
  background-color: #0a6b44;
  color: #ffffff;
  border-radius: 999;
}
</style>
