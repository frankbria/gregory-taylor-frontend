'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import CloudinaryPreview from './CloudinaryPreview'
import {
  getTransformationDefaults,
  QUALITY_RANGE,
  SHARPEN_RANGE,
  BLUR_RANGE,
  FORMAT_OPTIONS,
} from '@/lib/cloudinaryTransformations'

export default function ImageSettingsForm({ photo, currentSettings, onSave, onClose }) {
  const defaults = getTransformationDefaults()

  const initialValues = {
    quality: currentSettings?.quality ?? defaults.quality,
    sharpen: currentSettings?.sharpen ?? defaults.sharpen,
    blur: currentSettings?.blur ?? defaults.blur,
    format: currentSettings?.format ?? defaults.format,
  }

  // If quality is 'auto', use a sensible numeric default for the slider
  const resolvedInitialQuality =
    initialValues.quality === 'auto' ? 80 : initialValues.quality

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      quality: resolvedInitialQuality,
      sharpen: initialValues.sharpen,
      blur: initialValues.blur,
      format: initialValues.format,
    },
  })

  const watchedValues = watch()

  const previewSettings = {
    quality: Number(watchedValues.quality),
    sharpen: Number(watchedValues.sharpen),
    blur: Number(watchedValues.blur),
    format: watchedValues.format,
  }

  const onSubmit = async (data) => {
    try {
      await onSave(photo._id, {
        quality: Number(data.quality),
        sharpen: Number(data.sharpen),
        blur: Number(data.blur),
        format: data.format,
      })
      toast.success('Image settings saved')
    } catch {
      toast.error('Failed to save image settings')
    }
  }

  const handleReset = () => {
    reset({
      quality: defaults.quality === 'auto' ? 80 : defaults.quality,
      sharpen: defaults.sharpen,
      blur: defaults.blur,
      format: defaults.format,
    })
  }

  return (
    <div className="space-y-6">
      <CloudinaryPreview
        src={photo.src}
        currentSettings={currentSettings}
        previewSettings={previewSettings}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Quality */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="quality" className="block text-sm font-medium text-gray-700">
              Quality
            </label>
            <span className="text-sm text-gray-500">{watchedValues.quality}</span>
          </div>
          <input
            id="quality"
            type="range"
            min={QUALITY_RANGE.min}
            max={QUALITY_RANGE.max}
            className="w-full accent-gray-800"
            {...register('quality', { valueAsNumber: true })}
          />
        </div>

        {/* Sharpen */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="sharpen" className="block text-sm font-medium text-gray-700">
              Sharpen
            </label>
            <span className="text-sm text-gray-500">{watchedValues.sharpen}</span>
          </div>
          <input
            id="sharpen"
            type="range"
            min={SHARPEN_RANGE.min}
            max={SHARPEN_RANGE.max}
            className="w-full accent-gray-800"
            {...register('sharpen', { valueAsNumber: true })}
          />
        </div>

        {/* Blur */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="blur" className="block text-sm font-medium text-gray-700">
              Blur
            </label>
            <span className="text-sm text-gray-500">{watchedValues.blur}</span>
          </div>
          <input
            id="blur"
            type="range"
            min={BLUR_RANGE.min}
            max={BLUR_RANGE.max}
            className="w-full accent-gray-800"
            {...register('blur', { valueAsNumber: true })}
          />
        </div>

        {/* Format */}
        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
            Format
          </label>
          <select
            id="format"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            {...register('format')}
          >
            {FORMAT_OPTIONS.map((fmt) => (
              <option key={fmt} value={fmt}>
                {fmt}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md transition duration-300"
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 py-2 px-4 rounded-md transition duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
