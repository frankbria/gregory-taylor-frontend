'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useLayout } from '@/lib/LayoutContext'

export default function LayoutEditorToolbar({ onSave, saving }) {
  const { componentStyles, resetAll, loadStyles, isDirty } = useLayout()
  const fileInputRef = useRef(null)
  const dirty = isDirty()

  const handleBeforeUnload = useCallback((e) => {
    e.preventDefault()
    e.returnValue = ''
  }, [])

  useEffect(() => {
    if (dirty) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [dirty, handleBeforeUnload])

  const handlePreview = () => {
    window.open('/', '_blank')
  }

  const handleExport = () => {
    const json = JSON.stringify(componentStyles, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'component-styles.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const styles = JSON.parse(event.target.result)
        loadStyles(styles)
      } catch {
        // Invalid JSON - silently ignore
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        Component Styling
        {dirty && (
          <span
            data-testid="dirty-indicator"
            className="inline-block w-2 h-2 rounded-full bg-orange-400"
          />
        )}
      </h2>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>

        <button
          type="button"
          onClick={resetAll}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md"
        >
          Revert
        </button>

        <button
          type="button"
          onClick={handlePreview}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1.5 px-3 rounded-md text-sm"
        >
          Preview
        </button>

        <button
          type="button"
          onClick={handleExport}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1.5 px-3 rounded-md text-sm"
        >
          Export
        </button>

        <label className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1.5 px-3 rounded-md text-sm cursor-pointer">
          Import
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            data-testid="import-file-input"
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}
