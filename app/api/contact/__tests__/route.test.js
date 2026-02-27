import { NextResponse } from 'next/server'

const mockSend = jest.fn()
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args) => mockSend(...args) }
  }))
}))

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      ...data
    }))
  }
}))

import { POST } from '../route'

describe('Contact API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSend.mockReset()
    global.fetch = jest.fn()
  })

  const validBody = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Print Pricing',
    message: 'I love your wildlife photos!\nDo you sell large prints?',
    captchaValue: 'valid-captcha-token',
    aiCheckAnswer: 'wildlife'
  }

  function mockRequest(body) {
    return { json: async () => body }
  }

  function mockCaptchaSuccess() {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ success: true })
    })
  }

  function mockEmailSuccess() {
    mockSend.mockResolvedValueOnce({ id: 'notif-1' })
    mockSend.mockResolvedValueOnce({ id: 'confirm-1' })
  }

  // --- Input Validation ---

  describe('input validation', () => {
    it.each([
      ['name', { name: '' }, 'Name, email, and message are required'],
      ['email', { email: '' }, 'Name, email, and message are required'],
      ['message', { message: '' }, 'Name, email, and message are required'],
      ['email format', { email: 'not-an-email' }, 'Invalid email address'],
      ['captcha', { captchaValue: '' }, 'Please complete the captcha verification'],
      ['verification answer', { aiCheckAnswer: '' }, 'Please answer the verification question'],
    ])('rejects missing/invalid %s', async (_label, override, expectedError) => {
      const body = { ...validBody, ...override }
      await POST(mockRequest(body))

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expectedError },
        { status: 400 }
      )
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('rejects incorrect photography answer', async () => {
      mockCaptchaSuccess()
      await POST(mockRequest({ ...validBody, aiCheckAnswer: 'landscapes' }))

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Incorrect answer to verification question' },
        { status: 400 }
      )
      expect(mockSend).not.toHaveBeenCalled()
    })

    it.each(['Wildlife', 'Rattlesnakes', 'PowerShot S120'])(
      'accepts "%s" as valid answer (case-insensitive)',
      async (answer) => {
        mockCaptchaSuccess()
        mockEmailSuccess()
        await POST(mockRequest({ ...validBody, aiCheckAnswer: answer }))

        expect(NextResponse.json).toHaveBeenCalledWith(
          { message: 'Message sent successfully' }
        )
      }
    )
  })

  // --- reCAPTCHA Verification ---

  describe('reCAPTCHA verification', () => {
    it('sends token to Google verification endpoint', async () => {
      mockCaptchaSuccess()
      mockEmailSuccess()
      await POST(mockRequest(validBody))

      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=test-recaptcha-secret&response=valid-captcha-token`,
        }
      )
    })

    it('rejects when Google says token is invalid', async () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ success: false })
      })
      await POST(mockRequest(validBody))

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'reCAPTCHA verification failed' },
        { status: 400 }
      )
      expect(mockSend).not.toHaveBeenCalled()
    })
  })

  // --- Email Payloads (the contract with Resend) ---

  describe('notification email to photographer', () => {
    it('sends to CONTACT_EMAIL with correct from, replyTo, subject, and body', async () => {
      mockCaptchaSuccess()
      mockEmailSuccess()
      await POST(mockRequest(validBody))

      expect(mockSend).toHaveBeenCalledTimes(2)
      const email = mockSend.mock.calls[0][0]

      expect(email.from).toBe('noreply@gregtaylorphotography.com')
      expect(email.to).toEqual(['test@example.com'])
      expect(email.replyTo).toBe('john@example.com')
      expect(email.subject).toBe('Contact Form: Print Pricing')
      expect(email.html).toContain('John Doe')
      expect(email.html).toContain('john@example.com')
      expect(email.html).toContain('Print Pricing')
      expect(email.html).toContain('I love your wildlife photos!')
    })

    it('uses default subject when none provided', async () => {
      mockCaptchaSuccess()
      mockEmailSuccess()
      await POST(mockRequest({ ...validBody, subject: '' }))

      const email = mockSend.mock.calls[0][0]
      expect(email.subject).toBe('Contact Form Submission')
    })

    it('converts newlines in message to <br> tags', async () => {
      mockCaptchaSuccess()
      mockEmailSuccess()
      await POST(mockRequest(validBody))

      const email = mockSend.mock.calls[0][0]
      expect(email.html).toContain('wildlife photos!<br>Do you sell')
    })

    it('sanitizes HTML to prevent XSS in email', async () => {
      mockCaptchaSuccess()
      mockEmailSuccess()
      await POST(mockRequest({
        ...validBody,
        name: '<script>alert("xss")</script>',
        message: 'Hello <img onerror=alert(1)> World',
      }))

      const email = mockSend.mock.calls[0][0]
      expect(email.html).not.toContain('<script>')
      expect(email.html).not.toContain('<img')
      expect(email.html).toContain('&lt;script&gt;')
    })
  })

  describe('confirmation email to user', () => {
    it('sends to user email with thank-you content', async () => {
      mockCaptchaSuccess()
      mockEmailSuccess()
      await POST(mockRequest(validBody))

      const email = mockSend.mock.calls[1][0]

      expect(email.from).toBe('noreply@gregtaylorphotography.com')
      expect(email.to).toEqual(['john@example.com'])
      expect(email.subject).toContain('Thank you')
      expect(email.html).toContain('John Doe')
      expect(email.html).toContain('24-48 hours')
      expect(email.html).toContain('Greg Taylor')
    })
  })

  // --- Error Handling ---

  describe('error handling', () => {
    it('returns 500 when Resend API fails', async () => {
      mockCaptchaSuccess()
      mockSend.mockRejectedValueOnce(new Error('Resend API error'))
      await POST(mockRequest(validBody))

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      )
    })

    it('returns 500 when reCAPTCHA network request fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))
      await POST(mockRequest(validBody))

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      )
    })
  })
})
