import { createError, defineEventHandler, readBody } from 'h3'
import nodemailer from 'nodemailer'

const REQUIRED_FIELDS = ['name', 'email', 'message'] as const

function boolFromEnv(value: string | undefined, fallback = false) {
    if (value === undefined) return fallback
    return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

export default defineEventHandler(async (event) => {
    const body = (await readBody<Record<string, any>>(event)) || {}
    const missing = REQUIRED_FIELDS.filter((k) => !body[k] || String(body[k]).trim() === '')
    if (missing.length) {
        throw createError({ statusCode: 400, statusMessage: `Missing required fields: ${missing.join(', ')}` })
    }

    const name = String(body.name).trim()
    const email = String(body.email).trim()
    const project = String(body.project || 'General').trim()
    const message = String(body.message).trim()

    const config = useRuntimeConfig()

    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT || 587)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const from = (config as any).contactFrom || process.env.SMTP_FROM || user
    const to = (config as any).contactTo || process.env.CONTACT_TO || process.env.SMTP_FROM || user
    const secure = boolFromEnv(process.env.SMTP_SECURE, port === 465)

    if (!host || !port || !from || !to) {
        throw createError({
            statusCode: 500,
            statusMessage: 'SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, CONTACT_TO.',
        })
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
    })

    const html = `
    <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
    <p><strong>Project:</strong> ${project}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-line;">${message}</p>
  `

    try {
        await transporter.sendMail({
            from,
            to,
            replyTo: email,
            subject: `[Contact] ${project} - ${name}`,
            text: `From: ${name} <${email}>
Project: ${project}

${message}`,
            html,
        })

        return { ok: true }
    } catch (err: any) {
        throw createError({
            statusCode: 502,
            statusMessage: err?.message || 'Failed to send email',
        })
    }
})
