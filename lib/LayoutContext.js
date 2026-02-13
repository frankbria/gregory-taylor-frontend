'use client'

import { createContext, useContext, useState, useCallback } from 'react'

const LayoutContext = createContext()

/**
 * Static tree of configurable site sections.
 * Each node has an id (used as key in componentStyles), label, type, and optional children.
 */
export const SITE_COMPONENT_TREE = [
  {
    id: 'header',
    label: 'Header',
    type: 'layout',
    children: [
      { id: 'header-logo', label: 'Logo', type: 'element' },
      { id: 'header-nav', label: 'Navigation', type: 'element' },
    ],
  },
  {
    id: 'hero',
    label: 'Hero Section',
    type: 'section',
    children: [
      { id: 'hero-title', label: 'Title', type: 'element' },
      { id: 'hero-subtitle', label: 'Subtitle', type: 'element' },
      { id: 'hero-slider', label: 'Photo Slider', type: 'element' },
    ],
  },
  {
    id: 'gallery-grid',
    label: 'Gallery Grid',
    type: 'section',
    children: [
      { id: 'gallery-card', label: 'Gallery Card', type: 'element' },
      { id: 'gallery-image', label: 'Gallery Image', type: 'element' },
      { id: 'gallery-caption', label: 'Caption', type: 'element' },
    ],
  },
  {
    id: 'photo-detail',
    label: 'Photo Detail',
    type: 'section',
    children: [
      { id: 'photo-detail-image', label: 'Main Image', type: 'element' },
      { id: 'photo-detail-info', label: 'Photo Info', type: 'element' },
      { id: 'photo-detail-actions', label: 'Actions', type: 'element' },
    ],
  },
  {
    id: 'footer',
    label: 'Footer',
    type: 'layout',
    children: [
      { id: 'footer-links', label: 'Links', type: 'element' },
      { id: 'footer-copyright', label: 'Copyright', type: 'element' },
    ],
  },
]

export function LayoutProvider({ initialComponentStyles = {}, children }) {
  const [selectedComponentId, setSelectedComponentId] = useState(null)
  const [componentStyles, setComponentStyles] = useState(initialComponentStyles)
  const [savedStyles, setSavedStyles] = useState(initialComponentStyles)

  const selectComponent = useCallback((componentId) => {
    setSelectedComponentId(componentId)
  }, [])

  const getComponentClasses = useCallback((componentId) => {
    return componentStyles[componentId] || []
  }, [componentStyles])

  const updateComponentClasses = useCallback((componentId, classes) => {
    setComponentStyles(prev => ({
      ...prev,
      [componentId]: classes,
    }))
  }, [])

  const addClass = useCallback((componentId, className) => {
    setComponentStyles(prev => {
      const current = prev[componentId] || []
      if (current.includes(className)) return prev
      return { ...prev, [componentId]: [...current, className] }
    })
  }, [])

  const removeClass = useCallback((componentId, className) => {
    setComponentStyles(prev => {
      const current = prev[componentId] || []
      const filtered = current.filter(c => c !== className)
      if (filtered.length === current.length) return prev
      return { ...prev, [componentId]: filtered }
    })
  }, [])

  const resetComponent = useCallback((componentId) => {
    setComponentStyles(prev => {
      const saved = savedStyles[componentId]
      if (saved === undefined) {
        const next = { ...prev }
        delete next[componentId]
        return next
      }
      return { ...prev, [componentId]: saved }
    })
  }, [savedStyles])

  const resetAll = useCallback(() => {
    setComponentStyles(savedStyles)
  }, [savedStyles])

  const markSaved = useCallback(() => {
    setSavedStyles({ ...componentStyles })
  }, [componentStyles])

  const loadStyles = useCallback((styles) => {
    const normalized = styles || {}
    setComponentStyles(normalized)
    setSavedStyles(normalized)
  }, [])

  const isDirty = useCallback(() => {
    const currentKeys = Object.keys(componentStyles)
    const savedKeys = Object.keys(savedStyles)
    if (currentKeys.length !== savedKeys.length) return true
    return currentKeys.some(key => {
      const current = componentStyles[key] || []
      const saved = savedStyles[key] || []
      if (current.length !== saved.length) return true
      return current.some((cls, i) => cls !== saved[i])
    })
  }, [componentStyles, savedStyles])

  return (
    <LayoutContext.Provider
      value={{
        selectedComponentId,
        componentStyles,
        tree: SITE_COMPONENT_TREE,
        selectComponent,
        getComponentClasses,
        updateComponentClasses,
        addClass,
        removeClass,
        resetComponent,
        resetAll,
        markSaved,
        loadStyles,
        isDirty,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}
