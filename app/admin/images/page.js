'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useContent } from '@/lib/ContentContext'

export default function ImageSettingsPage() {
  const { imageSettings, loading, refreshImageSettings, updateImageSettings } = useContent()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      defaultQuality: 85,
      thumbnailWidth: 300,
      thumbnailHeight: 200,
      enableLazyLoading: true,
      optimizationLevel: 'medium',
    },
  })

  useEffect(() => {
    refreshImageSettings()
  }, [refreshImageSettings])

  useEffect(() => {
    if (imageSettings) {
      reset({
        defaultQuality: imageSettings.defaultQuality ?? 85,
        thumbnailWidth: imageSettings.thumbnailWidth ?? 300,
        thumbnailHeight: imageSettings.thumbnailHeight ?? 200,
        enableLazyLoading: imageSettings.enableLazyLoading ?? true,
        optimizationLevel: imageSettings.optimizationLevel ?? 'medium',
      })
    }
  }, [imageSettings, reset])

  const onSubmit = async (data) => {
    try {
      await updateImageSettings({
        defaultQuality: Number(data.defaultQuality),
        thumbnailWidth: Number(data.thumbnailWidth),
        thumbnailHeight: Number(data.thumbnailHeight),
        enableLazyLoading: data.enableLazyLoading,
        optimizationLevel: data.optimizationLevel,
      })
      toast.success('Image settings saved')
    } catch {
      toast.error('Failed to save image settings')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Image Settings</h1>

      {loading && (
        <div className="flex items-center justify-center py-8" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          <span className="sr-only">Loading...</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Default Quality */}
          <div>
            <label htmlFor="defaultQuality" className="block text-sm font-medium text-gray-700 mb-1">
              Default Quality
            </label>
            <input
              id="defaultQuality"
              type="number"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.defaultQuality ? 'border-red-500' : 'border-gray-300'
              } bg-white`}
              {...register('defaultQuality', {
                required: 'Quality is required',
                valueAsNumber: true,
                validate: (value) =>
                  (value >= 1 && value <= 100) || 'Quality must be between 1 and 100',
              })}
            />
            {errors.defaultQuality && (
              <p className="mt-1 text-sm text-red-500">{errors.defaultQuality.message}</p>
            )}
          </div>

          {/* Thumbnail Width */}
          <div>
            <label htmlFor="thumbnailWidth" className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail Width
            </label>
            <input
              id="thumbnailWidth"
              type="number"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.thumbnailWidth ? 'border-red-500' : 'border-gray-300'
              } bg-white`}
              {...register('thumbnailWidth', {
                required: 'Width is required',
                valueAsNumber: true,
                validate: (value) => value > 0 || 'Width must be greater than 0',
              })}
            />
            {errors.thumbnailWidth && (
              <p className="mt-1 text-sm text-red-500">{errors.thumbnailWidth.message}</p>
            )}
          </div>

          {/* Thumbnail Height */}
          <div>
            <label htmlFor="thumbnailHeight" className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail Height
            </label>
            <input
              id="thumbnailHeight"
              type="number"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.thumbnailHeight ? 'border-red-500' : 'border-gray-300'
              } bg-white`}
              {...register('thumbnailHeight', {
                required: 'Height is required',
                valueAsNumber: true,
                validate: (value) => value > 0 || 'Height must be greater than 0',
              })}
            />
            {errors.thumbnailHeight && (
              <p className="mt-1 text-sm text-red-500">{errors.thumbnailHeight.message}</p>
            )}
          </div>

          {/* Enable Lazy Loading */}
          <div className="flex items-center gap-3">
            <input
              id="enableLazyLoading"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              {...register('enableLazyLoading')}
            />
            <label htmlFor="enableLazyLoading" className="text-sm font-medium text-gray-700">
              Enable Lazy Loading
            </label>
          </div>

          {/* Optimization Level */}
          <div>
            <label htmlFor="optimizationLevel" className="block text-sm font-medium text-gray-700 mb-1">
              Optimization Level
            </label>
            <select
              id="optimizationLevel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              {...register('optimizationLevel')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Save button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
