'use client'

import { useEffect } from 'react'
import { useInspector } from '@/lib/InspectorContext'

export default function InspectorToggle() {
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev) return null

  return <InspectorToggleInner />
}

function InspectorToggleInner() {
  const { isEnabled, toggle } = useInspector()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        toggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 99999,
      }}
    >
      <button
        onClick={toggle}
        aria-label="Toggle Element Inspector"
        className={`
          px-3 py-2 rounded-lg shadow-lg text-xs font-medium transition-all
          ${isEnabled
            ? 'bg-blue-600 text-white ring-2 ring-blue-400'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }
        `}
      >
        {isEnabled ? 'Inspector ON' : 'Inspector OFF'}
      </button>
      <div className="text-[10px] text-gray-500 text-center mt-1">
        Ctrl+Shift+D
      </div>
    </div>
  )
}
