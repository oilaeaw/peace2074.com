export async function sendVerificationEmail(email: string, token: string) {
	const verifyUrl = `${import.meta.env.BASE_URL || 'http://localhost:3001'}/api/auth/verify-email?token=${token}`

	const templateParams = {
		to_email: email,
		verify_url: verifyUrl,
		// Add any other variables your EmailJS template expects
	}

	const data = {
		service_id: import.meta.env.EMAILJS_SERVICE_ID,
		template_id: import.meta.env.EMAILJS_TEMPLATE_ID,
		user_id: import.meta.env.EMAILJS_PUBLIC_KEY,
		template_params: templateParams,
		accessToken: import.meta.env.EMAILJS_PRIVATE_KEY,
	}

	try {
		const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorText = await response.text()
			throw new Error(`Failed to send verification email: ${response.status} ${response.statusText} - ${errorText}`)
		}

		// Email sent successfully
		console.log('Verification email sent successfully via EmailJS.')
	}
	catch (error) {
		console.error('Error sending verification email with EmailJS:', error)
		throw error
	}
}
