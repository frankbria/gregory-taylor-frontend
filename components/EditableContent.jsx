'use client'

import { useState, useEffect } from 'react'
import DOMPurify from 'dompurify'

// Uses raw fetch instead of useAPI() intentionally — public pages should
// fall back silently without triggering ErrorContext toast notifications.
export default function EditableContent({ pageId, sectionId, children }) {
  const [managedContent, setManagedContent] = useState(null)
  const [loading, setLoading] = useState(!!pageId)
  const [resolved, setResolved] = useState(!pageId)

  useEffect(() => {
    if (!pageId) {
      setResolved(true)
      setLoading(false)
      return
    }

    setManagedContent(null)
    setLoading(true)
    setResolved(false)

    let cancelled = false

    const fetchContent = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE
        if (!base) {
          if (!cancelled) { setResolved(true); setLoading(false) }
          return
        }

        const res = await fetch(`${base}/api/pages/${pageId}`)
        if (!res.ok) {
          if (!cancelled) { setResolved(true); setLoading(false) }
          return
        }

        const data = await res.json()
        if (!cancelled) {
          const section = data?.sections?.find(s => s.sectionId === sectionId)
          if (section?.content) {
            setManagedContent(section.content)
          }
          setResolved(true)
          setLoading(false)
        }
      } catch (err) {
        console.error('EditableContent fetch error:', err)
        if (!cancelled) {
          setResolved(true)
          setLoading(false)
        }
      }
    }

    fetchContent()

    return () => { cancelled = true }
  }, [pageId, sectionId])

  if (loading && !resolved) {
    return (
      <div data-testid="editable-content-loading" className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (managedContent) {
    return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(managedContent) }} />
  }

  return <>{children}</>
}
