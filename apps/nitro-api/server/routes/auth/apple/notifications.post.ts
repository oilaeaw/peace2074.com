import { defineEventHandler, readBody } from 'h3'

/**
 * Apple Server-to-Server Notifications endpoint.
 * Apple calls this when users change mail forwarding preferences,
 * delete their app account, or permanently delete their Apple Account.
 * https://developer.apple.com/documentation/sign_in_with_apple/processing_changes_for_sign_in_with_apple_accounts
 */
export default defineEventHandler(async (event) => {
    let body: Record<string, unknown>
    try {
        body = await readBody(event)
    } catch {
        body = {}
    }

    const payload = body?.payload
    console.log('[apple/notifications] Received notification, payload:', payload)

    // Apple sends a signed JWT in body.payload — decode and handle event types:
    // - consent-revoked: user revoked consent
    // - account-delete: user deleted their Apple account
    // - email-disabled: user disabled email forwarding
    // - email-enabled: user re-enabled email forwarding
    // For now we acknowledge receipt (200) — add DB handling as needed.

    return { received: true }
})
