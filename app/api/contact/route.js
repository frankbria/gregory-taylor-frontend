import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const VALID_ANSWERS = ['wildlife', 'rattlesnakes', 'powershot s120']
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

let resend = null
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

function sanitizeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(request) {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
      console.error('Contact API misconfigured: missing RESEND_API_KEY or CONTACT_EMAIL')
      return NextResponse.json(
        { error: 'Contact form is temporarily unavailable.' },
        { status: 503 }
      )
    }

    const { name, email, subject, message, captchaValue, aiCheckAnswer } =
      await request.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (!captchaValue) {
      return NextResponse.json(
        { error: 'Please complete the captcha verification' },
        { status: 400 }
      )
    }

    if (!aiCheckAnswer) {
      return NextResponse.json(
        { error: 'Please answer the verification question' },
        { status: 400 }
      )
    }

    const answerLower = aiCheckAnswer.trim().toLowerCase()
    const isValidAnswer = VALID_ANSWERS.some((a) => answerLower === a)
    if (!isValidAnswer) {
      return NextResponse.json(
        { error: 'Incorrect answer to verification question' },
        { status: 400 }
      )
    }

    // Verify reCAPTCHA server-side
    const captchaResponse = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaValue,
        }).toString(),
      }
    )
    const captchaData = await captchaResponse.json()
    if (!captchaData.success) {
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed' },
        { status: 400 }
      )
    }

    const contactEmail = process.env.CONTACT_EMAIL
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@gregtaylorphotography.com'
    const safeName = sanitizeHtml(name)
    const safeEmail = sanitizeHtml(email)
    const safeSubject = sanitizeHtml(subject || '')
    const safeMessage = sanitizeHtml(message).replace(/\n/g, '<br>')

    const cleanSubject = (subject || '').replace(/[\r\n]/g, ' ').trim()
    const emailSubject = cleanSubject
      ? `Contact Form: ${cleanSubject}`
      : 'Contact Form Submission'

    // Send notification email to photographer
    await getResend().emails.send({
      from: fromEmail,
      to: [contactEmail],
      replyTo: email,
      subject: emailSubject,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        ${safeSubject ? `<p><strong>Subject:</strong> ${safeSubject}</p>` : ''}
        <hr>
        <p>${safeMessage}</p>
      `,
    })

    // Send confirmation email to user (best-effort — don't fail the request)
    try {
      await getResend().emails.send({
        from: fromEmail,
        to: [email],
        subject: 'Thank you for contacting Greg Taylor Photography',
        html: `
          <h2>Thank you for reaching out!</h2>
          <p>Hi ${safeName},</p>
          <p>I've received your message and will get back to you within 24-48 hours.</p>
          <p>Best regards,<br>Greg Taylor</p>
        `,
      })
    } catch (confirmErr) {
      console.error('Failed to send confirmation email:', confirmErr)
    }

    return NextResponse.json({ message: 'Message sent successfully' })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
