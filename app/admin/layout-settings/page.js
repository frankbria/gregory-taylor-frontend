'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useContent } from '@/lib/ContentContext'

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

export default function LayoutSettingsPage() {
  const { layoutSettings, loading, refreshLayoutSettings, updateLayoutSettings } = useContent()
  const [navItems, setNavItems] = useState([])

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
      await updateLayoutSettings({
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Visibility Toggles */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Visibility</h2>
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
            <h2 className="text-lg font-semibold mb-3">Navigation Items</h2>
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
      </div>
    </div>
  )
}
