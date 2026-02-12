'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import ReCAPTCHA from 'react-google-recaptcha'
import EditableContent from '@/components/EditableContent'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaValue, setCaptchaValue] = useState(null)
  const [aiCheckAnswer, setAiCheckAnswer] = useState('')
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm()

  // Generate a random photography question for AI protection
  const photographyQuestions = [
    { question: "What is the main subject in my photograph collections?", answer: "wildlife" },
    { question: "What type of animal do I educate people about in the Southwest?", answer: "rattlesnakes" },
    { question: "What was my first camera? (Hint: Canon model)", answer: "powershot s120" },
  ]
  
  const randomIndex = Math.floor(Math.random() * photographyQuestions.length)
  const currentQuestion = photographyQuestions[randomIndex]

  const onSubmit = async (data) => {
    // Check if captcha is completed
    if (!captchaValue) {
      toast.error('Please complete the captcha verification')
      return
    }

    // Check the photography question answer
    if (!aiCheckAnswer || !aiCheckAnswer.toLowerCase().includes(currentQuestion.answer)) {
      toast.error('Please correctly answer the photography question')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Here you would implement the actual API call to send the email
      // For example:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...data,
      //     captchaValue,
      //     aiCheckAnswer
      //   })
      // })
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Message sent successfully!')
      reset()
      setCaptchaValue(null)
      setAiCheckAnswer('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value)
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Contact</h1>
      
      <div className="bg-gray-50 rounded-lg shadow-md p-6 mb-8">
        <EditableContent pageId="contact" sectionId="intro">
          <p className="text-gray-700 mb-6">
            Have questions about my photography, interested in purchasing prints, or want to discuss wildlife conservation?
            Fill out the form below and I&apos;ll get back to you as soon as possible.
          </p>
        </EditableContent>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name field */}
          <div>
            <input
              id="name"
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'} bg-white/80 placeholder-gray-500`}
              placeholder="Name *"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Email field */}
          <div>
            <input
              id="email"
              type="email"
              className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'} bg-white/80 placeholder-gray-500`}
              placeholder="Email *"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          {/* Subject field */}
          <div>
            <input
              id="subject"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/80 placeholder-gray-500"
              placeholder="Subject"
              {...register('subject')}
            />
          </div>

          {/* Message field */}
          <div>
            <textarea
              id="message"
              rows="5"
              className={`w-full px-3 py-2 border rounded-md ${errors.message ? 'border-red-500' : 'border-gray-300'} bg-white/80 placeholder-gray-500`}
              placeholder="Message *"
              {...register('message', { required: 'Message is required' })}
            ></textarea>
            {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>}
          </div>

          {/* Anti-AI Question (Photography specific) */}
          <div className="bg-gray-100 p-4 rounded-md">
            <label htmlFor="aiCheck" className="block text-sm font-medium text-gray-700 mb-1">
              Photography Verification <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-2">{currentQuestion.question}</p>
            <input
              id="aiCheck"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/80 placeholder-gray-500"
              placeholder="Your answer"
              value={aiCheckAnswer}
              onChange={(e) => setAiCheckAnswer(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-gray-500">This helps prevent automated messages.</p>
          </div>

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'} // Test key - replace with your actual key
              onChange={handleCaptchaChange}
            />
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>

      <div className="text-center mt-8">
        <h2 className="text-xl font-semibold mb-2">Alternative Contact</h2>
        <p className="text-gray-600">
          You can also reach me directly at:{" "}
          <a 
            href="mailto:contact@gregtaylorphotography.com" 
            className="text-gray-800 hover:underline"
          >
            contact@gregtaylorphotography.com
          </a>
        </p>
      </div>
    </main>
  )
}