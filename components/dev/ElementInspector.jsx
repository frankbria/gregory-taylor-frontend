'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useInspector } from '@/lib/InspectorContext'
import { generateInspectorPrompt, generateCloudinaryPrompt, copyPromptToClipboard } from '@/lib/aiPromptGenerator'

export default function ElementInspector() {
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev) return null

  return <ElementInspectorInner />
}

function ElementInspectorInner() {
  const { isEnabled, getElement, setHoveredId, hoveredId } = useInspector()
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [hoveredMeta, setHoveredMeta] = useState(null)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseOver = useCallback((e) => {
    if (!isEnabled) return

    const inspectable = e.target.closest('[data-inspector-id]')
    if (!inspectable) {
      setHoveredId(null)
      setHoveredMeta(null)
      return
    }

    const id = inspectable.getAttribute('data-inspector-id')
    const rect = inspectable.getBoundingClientRect()

    setHoveredId(id)
    setTooltipPos({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 10,
    })

    const registeredMeta = getElement(id)
    setHoveredMeta({
      id,
      componentName: inspectable.getAttribute('data-inspector-component'),
      filePath: inspectable.getAttribute('data-inspector-file'),
      className: inspectable.children[0]?.getAttribute('class') || '',
      ...registeredMeta,
    })
  }, [isEnabled, getElement, setHoveredId])

  const handleMouseOut = useCallback((e) => {
    const relatedTarget = e.relatedTarget
    if (relatedTarget && relatedTarget.closest?.('[data-inspector-id]')) {
      return
    }
    setHoveredId(null)
    setHoveredMeta(null)
  }, [setHoveredId])

  useEffect(() => {
    if (!isEnabled) {
      setHoveredId(null)
      setHoveredMeta(null)
      return
    }

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [isEnabled, handleMouseOver, handleMouseOut, setHoveredId])

  const handleCopyPrompt = async () => {
    if (!hoveredMeta) return

    const prompt = hoveredMeta.cloudinary
      ? generateCloudinaryPrompt(hoveredMeta.id, hoveredMeta)
      : generateInspectorPrompt(hoveredMeta.id, hoveredMeta)

    const success = await copyPromptToClipboard(prompt)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!mounted || !isEnabled || !hoveredMeta) return null

  const tooltipStyle = {
    position: 'absolute',
    top: tooltipPos.y - 8,
    left: tooltipPos.x,
    transform: 'translateY(-100%)',
    zIndex: 99999,
    pointerEvents: 'auto',
  }

  return createPortal(
    <>
      {/* Tooltip */}
      <div
        data-testid="inspector-tooltip"
        style={tooltipStyle}
        className="bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 max-w-sm"
      >
        <div className="font-bold text-blue-300 mb-1">
          {hoveredMeta.componentName}
        </div>
        <div className="text-gray-400 mb-1">
          {hoveredMeta.filePath}
        </div>
        <div className="text-gray-300 mb-1 font-mono text-[10px] break-all">
          ID: {hoveredMeta.id}
        </div>
        {hoveredMeta.className && (
          <div className="text-yellow-300 mb-1 font-mono text-[10px] break-all">
            Classes: {typeof hoveredMeta.className === 'string' ? hoveredMeta.className : ''}
          </div>
        )}
        {hoveredMeta.cloudinary && (
          <div className="text-green-300 mb-1 text-[10px]">
            Cloudinary: q={hoveredMeta.cloudinary.quality || 'auto'}, f={hoveredMeta.cloudinary.format || 'auto'}
          </div>
        )}
        <button
          onClick={handleCopyPrompt}
          className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[10px] font-medium transition"
        >
          {copied ? 'Copied!' : 'Copy AI Prompt'}
        </button>
      </div>
    </>,
    document.body
  )
}
