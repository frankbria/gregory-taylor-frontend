'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useContent } from '@/lib/ContentContext'
import TipTapEditor from '@/components/TipTapEditor'

export default function ContentEditorPage() {
  const { pages, currentPage, loading, refreshPages, selectPage, updatePage } = useContent()
  const [bodyContent, setBodyContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    refreshPages()
  }, [refreshPages])

  useEffect(() => {
    if (currentPage) {
      reset({
        title: currentPage.title || '',
        description: currentPage.description || '',
        metadata: currentPage.metadata ? JSON.stringify(currentPage.metadata, null, 2) : '{}',
      })
      setBodyContent(currentPage.body || '')
    }
  }, [currentPage, reset])

  const handleBodyChange = useCallback((html) => {
    setBodyContent(html)
  }, [])

  const onSubmit = async (data) => {
    try {
      let metadata = {}
      try {
        metadata = JSON.parse(data.metadata)
      } catch {
        toast.error('Metadata must be valid JSON')
        return
      }

      await updatePage(currentPage._id, {
        title: data.title,
        description: data.description,
        body: bodyContent,
        metadata,
      })
      toast.success('Page updated successfully')
    } catch {
      toast.error('Failed to update page')
    }
  }

  const handleCancel = () => {
    if (currentPage) {
      reset({
        title: currentPage.title || '',
        description: currentPage.description || '',
        metadata: currentPage.metadata ? JSON.stringify(currentPage.metadata, null, 2) : '{}',
      })
      setBodyContent(currentPage.body || '')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Content Editor</h1>

      {loading && (
        <div className="flex items-center justify-center py-8" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          <span className="sr-only">Loading...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Page list sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3">Pages</h2>
            {pages.length === 0 && !loading && (
              <p className="text-gray-500 text-sm">No pages found</p>
            )}
            <ul className="space-y-1">
              {pages.map((page) => (
                <li key={page._id}>
                  <button
                    type="button"
                    onClick={() => selectPage(page._id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition duration-200 ${
                      currentPage?._id === page._id
                        ? 'bg-gray-800 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {page.title || 'Untitled'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Editor form */}
        <div className="md:col-span-3">
          {currentPage ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    } bg-white`}
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    } bg-white`}
                    {...register('description', { required: 'Description is required' })}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                {/* Body - TipTap Editor with Preview Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Body
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition duration-200"
                    >
                      {showPreview ? 'Hide Preview' : 'Preview'}
                    </button>
                  </div>

                  <div className={showPreview ? 'grid grid-cols-2 gap-4' : ''}>
                    <div>
                      <TipTapEditor
                        content={bodyContent}
                        onChange={handleBodyChange}
                      />
                    </div>
                    {showPreview && (
                      <div
                        data-testid="preview-pane"
                        className="border border-gray-300 rounded-md p-4 prose max-w-none overflow-auto min-h-[200px]"
                        dangerouslySetInnerHTML={{ __html: bodyContent }}
                      />
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <label htmlFor="metadata" className="block text-sm font-medium text-gray-700 mb-1">
                    Metadata (JSON)
                  </label>
                  <textarea
                    id="metadata"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white font-mono text-sm"
                    {...register('metadata')}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              Select a page from the list to edit its content.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
