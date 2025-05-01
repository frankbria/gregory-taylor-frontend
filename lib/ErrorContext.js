'use client'

import { createContext, useContext, useState } from 'react'
import { toast } from 'react-hot-toast'

const ErrorContext = createContext()

export function ErrorProvider({ children }) {
  const [apiErrors, setApiErrors] = useState([])

  // Handle API errors and show toast
  const handleApiError = (error, source) => {
    const errorMessage = error?.message || 'An unknown error occurred'
    const errorId = Date.now().toString()
    const errorInfo = { 
      id: errorId, 
      message: errorMessage, 
      source, 
      timestamp: new Date() 
    }

    // Add to error list
    setApiErrors(prev => [...prev, errorInfo])
    
    // Show toast notification
    toast.error(`API Error: ${source ? `${source} - ` : ''}${errorMessage}`, {
      id: errorId,
      duration: 5000
    })
    
    return errorInfo
  }

  // Clear a specific error
  const clearError = (errorId) => {
    setApiErrors(prev => prev.filter(error => error.id !== errorId))
  }

  // Clear all errors
  const clearAllErrors = () => {
    setApiErrors([])
  }

  return (
    <ErrorContext.Provider
      value={{
        apiErrors,
        handleApiError,
        clearError,
        clearAllErrors
      }}
    >
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}