'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useContent } from '@/lib/ContentContext'
import useAPI from '@/lib/api'
import ImageSettingsForm from '@/components/admin/ImageSettingsForm'

export default function ImageSettingsPage() {
  const {
    imageSettings,
    loading,
    refreshImageSettings,
    updateImageSettings,
    getPhotoSettings,
    updatePhotoSettings,
  } = useContent()
  const api = useAPI()

  // Photo gallery state
  const [photos, setPhotos] = useState(null)
  const [photosLoading, setPhotosLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [selectedPhotoSettings, setSelectedPhotoSettings] = useState(null)

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

  // Fetch photos
  useEffect(() => {
    let cancelled = false
    async function fetchPhotos() {
      try {
        const data = await api.getPhotos()
        if (!cancelled) {
          setPhotos(data)
          setPhotosLoading(false)
        }
      } catch {
        if (!cancelled) {
          setPhotos([])
          setPhotosLoading(false)
        }
      }
    }
    fetchPhotos()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleEditSettings = useCallback(async (photo) => {
    setSelectedPhoto(photo)
    setSelectedPhotoSettings(null)
    try {
      const settings = await getPhotoSettings(photo._id)
      setSelectedPhotoSettings(settings)
    } catch {
      setSelectedPhotoSettings(null)
    }
  }, [getPhotoSettings])

  const handleSavePhotoSettings = useCallback(async (photoId, settings) => {
    await updatePhotoSettings(photoId, settings)
  }, [updatePhotoSettings])

  const handleCloseModal = useCallback(() => {
    setSelectedPhoto(null)
    setSelectedPhotoSettings(null)
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Image Settings</h1>

      {loading && (
        <div className="flex items-center justify-center py-8" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          <span className="sr-only">Loading...</span>
        </div>
      )}

      {/* Global Defaults - Collapsible */}
      <details className="mb-8">
        <summary className="cursor-pointer text-xl font-semibold mb-4 select-none">
          Global Defaults
        </summary>
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
      </details>

      {/* Photo Gallery */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Photo Gallery</h2>

        {photosLoading && (
          <div data-testid="photo-gallery-loading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg animate-pulse h-48" />
            ))}
          </div>
        )}

        {!photosLoading && (!photos || photos.length === 0) && (
          <p className="text-gray-500">No photos found</p>
        )}

        {!photosLoading && photos && photos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <img
                  src={photo.src}
                  alt={photo.title || 'Photo'}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{photo.title}</p>
                  <button
                    onClick={() => handleEditSettings(photo)}
                    className="mt-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-3 py-1 transition duration-300"
                  >
                    Edit Settings
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">
              Edit Settings: {selectedPhoto.title}
            </h3>
            <ImageSettingsForm
              photo={selectedPhoto}
              currentSettings={selectedPhotoSettings}
              onSave={handleSavePhotoSettings}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  )
}
