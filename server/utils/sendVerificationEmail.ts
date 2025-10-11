import nodemailer from 'nodemailer'

export async function sendVerificationEmail(email: string, token: string) {
  // Configure your SMTP or email service here
  const transporter = nodemailer.createTransport({
    host: import.meta.env.SMTP_HOST,
    port: Number(import.meta.env.SMTP_PORT),
    secure: false,
    auth: {
      user: import.meta.env.SMTP_USER,
      pass: import.meta.env.SMTP_PASS,
    },
  })

  const verifyUrl = `${import.meta.env.BASE_URL || 'http://localhost:3001'}/api/auth/verify-email?token=${token}`
  const mailOptions = {
    from: import.meta.env.SMTP_FROM || 'peace2074@yourdomain.com',
    to: email,
    subject: 'Verify your email',
    html: `<p>Thank you for signing up! Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  }

  await transporter.sendMail(mailOptions)
}
