import { NoteAcionsE } from '@shared/types'
import { defaultStyles, notifyDefaults } from '../constants'
import { Dialog, Notify } from 'quasar'

/**
 * useNote composable for managing notifications and dialogs.
 * Provides methods for success, info, warning, error notifications, and more.
 */
export default function useNote() {
  const $q = useQuasar()
  // Set default notification options
  Notify.setDefaults({
    position: notifyDefaults.position as any,
    timeout: notifyDefaults.timeout,
    textColor: 'white',
  })

  /**
   * Creates a notification with the given message and configuration.
   * @param message - The message to display.
   */
  function note(message: string) {
    return $q.notify({
      message,
      type: defaultStyles.success.type,
    })
  }

  /**
   * Displays a dialog with the given message.
   * @param message - The message to display in the dialog.
   */
  note.dialog = (message?: string) => {
    return Dialog.create({ message })
  }

  /**
   * Displays a success notification.
   * @param message - The success message to display.
   * @param config - Optional configuration for the notification.
   */
  note.success = (message: string, config = notifyDefaults) => {
    return Notify.create({
      message,
      type: defaultStyles.success.type as any,
      ...(config as any),
    })
  }

  /**
   * Displays an info notification.
   * @param message - The info message to display.
   * @param config - Optional configuration for the notification.
   */
  note.info = (message: string, config = notifyDefaults) => {
    return Notify.create({
      message,
      type: NoteAcionsE.Info as any,
      ...(config as any),
    })
  }

  /**
   * Displays a warning notification.
   * @param message - The warning message to display.
   * @param config - Optional configuration for the notification.
   */
  note.warning = (message: string, config = notifyDefaults) => {
    return Notify.create({
      message,
      type: NoteAcionsE.warning as any,
      ...(config as any),
    })
  }

  /**
   * Displays an error notification.
   * @param error - The error object or message to display.
   * @param config - Optional configuration for the notification.
   */
  note.error = (error: unknown, config = notifyDefaults) => {
    // handle unknown error shapes safely
    const e: any = error || {}
    const { status, statusCode, errorMessage, message, statusMessage } = e
    const errorMsg = message || errorMessage || statusMessage || 'Unhandled Error!'
    Notify.create({
      message: errorMsg,
      type: 'negative',
      caption: (status || statusCode) as any,
      ...(config as any),
    })
  }

  /**
   * Logs a warning message to the console.
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   */
  note.log = (message: string, ...args: any[]) => {
    console.warn(message, ...args)
  }

  /**
   * Logs debug information to the console.
   * @param title - The title of the debug log.
   * @param err - The error object to log.
   * @param err.message - The error message to log.
   */
  note.debug = (title: string, err: { message: string }) => {
    console.warn(title, JSON.stringify(err?.message || err || {}, null, 2))
  }

  return {
    note: Object.assign(note, {
      dialog: note.dialog,
      success: note.success,
      info: note.info,
      warning: note.warning,
      error: note.error,
      log: note.log,
      debug: note.debug,
    }),
  }
}
