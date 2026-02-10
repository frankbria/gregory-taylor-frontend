'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useContent } from '@/lib/ContentContext'
import TipTapEditor from '@/components/TipTapEditor'

export default function PageEditorPage() {
  const { pageId } = useParams()
  const { currentPage, loading, selectPage, updatePage } = useContent()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoadError('')
    selectPage(pageId).catch(() => {
      if (!cancelled) setLoadError('Unable to load page content.')
    })
    return () => { cancelled = true }
  }, [pageId, selectPage])

  useEffect(() => {
    if (currentPage) {
      setTitle(currentPage.title || '')
      setDescription(currentPage.description || '')
      setBody(currentPage.body || '')
    }
  }, [currentPage])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updatePage(pageId, {
        title,
        description,
        body,
      })
      toast.success('Page updated successfully')
    } catch {
      toast.error('Failed to update page')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (!currentPage) {
    return <p className="text-gray-500">{loadError || 'Loading page...'}</p>
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/content" className="hover:text-gray-700">
          Content
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{currentPage.title}</span>
      </nav>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
          />
        </div>

        {/* Body - TipTap Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Body
          </label>
          <TipTapEditor content={body} onChange={setBody} />
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <Link
            href="/admin/content"
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition duration-300"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  )
}
