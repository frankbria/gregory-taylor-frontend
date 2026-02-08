'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

export default function AdminLoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/admin')
    }
  }, [authLoading, isAuthenticated, router])

  const onSubmit = async (data) => {
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (
          error.status === 429 ||
          (error.message && error.message.toLowerCase().includes('rate'))
        ) {
          toast.error('Too many login attempts. Please try again later.')
        } else {
          toast.error('Invalid email or password')
        }
        return
      }

      toast.success('Welcome back!')
      router.push('/admin')
    } catch (err) {
      toast.error('Invalid email or password')
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-serif tracking-wide text-center mb-2">
        GREG TAYLOR PHOTOGRAPHY
      </h1>
      <p className="text-gray-600 text-center mb-8">Admin Login</p>

      <div className="bg-gray-50 rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <input
              id="password"
              type="password"
              className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'} bg-white/80 placeholder-gray-500`}
              placeholder="Password *"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
