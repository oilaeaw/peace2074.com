import { defineEventHandler, readBody } from 'h3'

async function sendWelcomeEmail(email: string) {
  const config = useRuntimeConfig()
  const MAILJS_PUBLIC_KEY = config.email_public_key
  const MAILJS_PRIVATE_KEY = config.email_private_key
  const MAILJS_TEMPLATE = config.email_template
  const MAILJS_API_URL = config.mailjs_api_url

  // MailJS API endpoint from runtime config
  const url = MAILJS_API_URL
  const payload = {
    service_id: MAILJS_TEMPLATE,
    template_id: 'template_welcome', // You may need to adjust this to your actual template ID
    user_id: MAILJS_PUBLIC_KEY,
    accessToken: MAILJS_PRIVATE_KEY,
    template_params: {
      to_email: email,
    },
  }
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // Log or handle the event as needed
  console.warn('Netlify Identity webhook event:', body)
  // Custom logic: send welcome email on signup
  if (body.event === 'signup' && body.user && body.user.email) {
    await sendWelcomeEmail(body.user.email)
  }
  return { received: true }
})
