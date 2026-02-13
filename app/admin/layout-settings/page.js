'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { HiChevronRight, HiChevronDown } from 'react-icons/hi2'
import { useContent } from '@/lib/ContentContext'
import { LayoutProvider, useLayout } from '@/lib/LayoutContext'
import ComponentTree from '@/components/admin/ComponentTree'
import TailwindClassEditor from '@/components/admin/TailwindClassEditor'
import ClassTagList from '@/components/admin/ClassTagList'
import LayoutEditorToolbar from '@/components/admin/LayoutEditorToolbar'

const generateNavItemId = () => Math.random().toString(36).slice(2, 11)

const DEFAULT_SETTINGS = {
  showHeader: true,
  showFooter: true,
  navItems: [
    { id: 'default-home', label: 'Home', href: '/' },
    { id: 'default-gallery', label: 'Gallery', href: '/gallery' },
  ],
  colorScheme: 'light',
  gridColumns: 3,
}

function ComponentStylingSection() {
  const { layoutSettings, updateLayoutSettings } = useContent()
  const { componentStyles, markSaved, loadStyles } = useLayout()
  const [saving, setSaving] = useState(false)
  const lastLoadedRef = useRef(null)

  useEffect(() => {
    const serverStyles = layoutSettings?.componentStyles
    if (!serverStyles) return
    const serialized = JSON.stringify(serverStyles)
    if (serialized !== lastLoadedRef.current) {
      lastLoadedRef.current = serialized
      loadStyles(serverStyles)
    }
  }, [layoutSettings, loadStyles])

  const handleSaveComponentStyles = useCallback(async () => {
    if (!layoutSettings) return
    setSaving(true)
    try {
      await updateLayoutSettings({
        ...layoutSettings,
        componentStyles,
      })
      markSaved()
      toast.success('Component styles saved')
    } catch {
      toast.error('Failed to save component styles')
    } finally {
      setSaving(false)
    }
  }, [componentStyles, layoutSettings, updateLayoutSettings, markSaved])

  return (
    <div>
      <LayoutEditorToolbar onSave={handleSaveComponentStyles} saving={saving} />

      <div className="mb-4">
        <ClassTagList />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ComponentTree />
        </div>
        <div className="lg:col-span-2">
          <TailwindClassEditor />
        </div>
      </div>
    </div>
  )
}

export default function LayoutSettingsPage() {
  const { layoutSettings, loading, refreshLayoutSettings, updateLayoutSettings } = useContent()
  const [navItems, setNavItems] = useState([])
  const [globalOpen, setGlobalOpen] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm()

  useEffect(() => {
    refreshLayoutSettings()
  }, [refreshLayoutSettings])

  useEffect(() => {
    if (layoutSettings) {
      reset({
        showHeader: layoutSettings.showHeader ?? true,
        showFooter: layoutSettings.showFooter ?? true,
        colorScheme: layoutSettings.colorScheme || 'light',
        gridColumns: layoutSettings.gridColumns || 3,
      })
      setNavItems((layoutSettings.navItems || []).map(item => ({
        ...item,
        id: item.id || generateNavItemId(),
      })))
    }
  }, [layoutSettings, reset])

  const onSubmit = async (data) => {
    try {
      const { componentStyles: _cs, ...restSettings } = layoutSettings || {}
      await updateLayoutSettings({
        ...restSettings,
        showHeader: data.showHeader,
        showFooter: data.showFooter,
        colorScheme: data.colorScheme,
        gridColumns: Number(data.gridColumns) || 3,
        navItems,
      })
      toast.success('Layout settings updated successfully')
    } catch {
      toast.error('Failed to update layout settings')
    }
  }

  const addNavItem = () => {
    setNavItems((prev) => [...prev, { id: generateNavItemId(), label: '', href: '' }])
  }

  const removeNavItem = (index) => {
    setNavItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateNavItem = (index, field, value) => {
    setNavItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const handleReset = () => {
    reset({
      showHeader: DEFAULT_SETTINGS.showHeader,
      showFooter: DEFAULT_SETTINGS.showFooter,
      colorScheme: DEFAULT_SETTINGS.colorScheme,
      gridColumns: DEFAULT_SETTINGS.gridColumns,
    })
    setNavItems(DEFAULT_SETTINGS.navItems.map(item => ({ ...item, id: generateNavItemId() })))
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Layout Settings</h1>

      {loading && (
        <div className="flex items-center justify-center py-8" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          <span className="sr-only">Loading...</span>
        </div>
      )}

      {/* Global Settings - Collapsible */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <button
          type="button"
          onClick={() => setGlobalOpen(prev => !prev)}
          className="flex items-center gap-2 w-full text-left"
        >
          {globalOpen ? (
            <HiChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <HiChevronRight className="w-5 h-5 text-gray-500" />
          )}
          <h2 className="text-lg font-semibold">Global Settings</h2>
        </button>

        {globalOpen && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Visibility Toggles */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Visibility</h3>
              <div className="flex items-center gap-3">
                <input
                  id="showHeader"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  {...register('showHeader')}
                />
                <label htmlFor="showHeader" className="text-sm text-gray-700">
                  Show Header
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="showFooter"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  {...register('showFooter')}
                />
                <label htmlFor="showFooter" className="text-sm text-gray-700">
                  Show Footer
                </label>
              </div>
            </div>

            {/* Grid Columns */}
            <div>
              <label htmlFor="gridColumns" className="block text-sm font-medium text-gray-700 mb-1">
                Grid Columns
              </label>
              <input
                id="gridColumns"
                type="number"
                min="1"
                max="12"
                className="w-24 px-3 py-2 border border-gray-300 rounded-md bg-white"
                {...register('gridColumns', { valueAsNumber: true })}
              />
            </div>

            {/* Color Scheme */}
            <div>
              <label htmlFor="colorScheme" className="block text-sm font-medium text-gray-700 mb-1">
                Color Scheme
              </label>
              <select
                id="colorScheme"
                className="w-48 px-3 py-2 border border-gray-300 rounded-md bg-white"
                {...register('colorScheme')}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            {/* Navigation Items */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Navigation Items</h3>
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Label"
                      value={item.label}
                      onChange={(e) => updateNavItem(index, 'label', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={item.href}
                      onChange={(e) => updateNavItem(index, 'href', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeNavItem(index)}
                      className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addNavItem}
                className="mt-2 text-sm text-gray-600 hover:text-gray-800 border border-dashed border-gray-300 rounded-md px-3 py-1"
              >
                Add Nav Item
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition duration-300"
              >
                Reset to Defaults
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Component Styling Section */}
      <LayoutProvider initialComponentStyles={layoutSettings?.componentStyles || {}}>
        <ComponentStylingSection />
      </LayoutProvider>
    </div>
  )
}
