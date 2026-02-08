'use client'

import { createContext, useContext, useState, useRef, useCallback } from 'react'

const InspectorContext = createContext()

let idCounter = 0

export function InspectorProvider({ children }) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)
  const registryRef = useRef({})

  const toggle = useCallback(() => {
    setIsEnabled(prev => !prev)
  }, [])

  const register = useCallback((id, metadata) => {
    registryRef.current = { ...registryRef.current, [id]: metadata }
  }, [])

  const unregister = useCallback((id) => {
    const { [id]: _, ...rest } = registryRef.current
    registryRef.current = rest
  }, [])

  const getElement = useCallback((id) => {
    return registryRef.current[id]
  }, [])

  const getAllElements = useCallback(() => {
    return { ...registryRef.current }
  }, [])

  const generateId = useCallback((componentName) => {
    idCounter += 1
    return `${componentName.toLowerCase()}-${idCounter}`
  }, [])

  return (
    <InspectorContext.Provider
      value={{
        isEnabled,
        hoveredId,
        setHoveredId,
        toggle,
        register,
        unregister,
        getElement,
        getAllElements,
        generateId,
      }}
    >
      {children}
    </InspectorContext.Provider>
  )
}

export function useInspector() {
  const context = useContext(InspectorContext)
  if (context === undefined) {
    throw new Error('useInspector must be used within an InspectorProvider')
  }
  return context
}
