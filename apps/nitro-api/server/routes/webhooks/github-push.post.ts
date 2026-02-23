import { defineEventHandler, readBody, getHeader } from 'h3'
import { getVapidConfig } from '../../utils/vapid'
import { getCollection } from '../../utils/kv-db'
import crypto from 'node:crypto'

/**
 * POST /api/webhooks/github-push
 * GitHub webhook for push events - sends push notifications to all subscribers
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const signature = getHeader(event, 'x-hub-signature-256')

        // Verify webhook signature if secret is configured
        const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET
        if (webhookSecret && signature) {
            const hmac = crypto.createHmac('sha256', webhookSecret)
            const digest = 'sha256=' + hmac.update(JSON.stringify(body)).digest('hex')

            if (digest !== signature) {
                console.error('[GitHub Webhook] Invalid signature')
                return { ok: false, error: 'Invalid signature' }
            }
        }

        // Only process push events
        const eventType = getHeader(event, 'x-github-event')
        if (eventType !== 'push') {
            return { ok: true, message: 'Event ignored (not a push)' }
        }

        const { ref, commits, pusher, repository } = body

        // Extract branch name from ref (refs/heads/main -> main)
        const branch = ref?.split('/').pop() || 'unknown'

        // Only notify for main/one branch (adjust as needed)
        if (branch !== 'one' && branch !== 'main') {
            return { ok: true, message: `Ignored push to ${branch}` }
        }

        const commitCount = commits?.length || 0
        const pusherName = pusher?.name || 'Someone'
        const repoName = repository?.name || 'repository'

        console.log(`[GitHub Webhook] Push to ${branch}: ${commitCount} commit(s) by ${pusherName}`)

        // Send push notifications
        const webpush = await import('web-push')
        const vapid = getVapidConfig()

        if (!vapid) {
            console.warn('[GitHub Webhook] VAPID not configured, skipping notifications')
            return { ok: true, message: 'VAPID not configured' }
        }

        webpush.default.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

        const Subscriptions = await getCollection('push_subscriptions')
        const subscriptions = await Subscriptions.find({}).toArray()

        if (subscriptions.length === 0) {
            return { ok: true, message: 'No subscribers to notify' }
        }

        // Get the latest commit message
        const latestCommit = commits?.[commits.length - 1]
        const commitMessage = latestCommit?.message?.split('\n')[0] || 'New update'

        const payload = JSON.stringify({
            title: `🚀 ${repoName} updated`,
            body: `${pusherName} pushed ${commitCount} commit(s) to ${branch}\n${commitMessage}`,
            icon: '/android-chrome-192x192.png',
            badge: '/android-chrome-192x192.png',
            tag: 'github-push',
            data: {
                url: repository?.html_url || '/',
                branch,
                commits: commitCount,
            },
        })

        let sentCount = 0
        let failedCount = 0

        // Send notifications
        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.default.sendNotification(sub.subscription, payload)
                    sentCount++
                } catch (err: any) {
                    // Remove expired subscriptions
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await Subscriptions.deleteOne({ endpoint: sub.subscription.endpoint })
                    }
                    failedCount++
                    throw err
                }
            })
        )

        console.log(`[GitHub Webhook] Sent ${sentCount} notification(s), ${failedCount} failed`)

        return {
            ok: true,
            message: `Sent ${sentCount} notification(s)`,
            details: {
                branch,
                commits: commitCount,
                pusher: pusherName,
                sent: sentCount,
                failed: failedCount,
            }
        }

    } catch (err: any) {
        console.error('[GitHub Webhook] Error:', err)
        return { ok: false, error: err?.message || 'Webhook processing failed' }
    }
})
