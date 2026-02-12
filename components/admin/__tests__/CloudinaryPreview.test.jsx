import React from 'react'
import { render, screen } from '@testing-library/react'

import CloudinaryPreview from '../CloudinaryPreview'

beforeAll(() => {
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud'
})

const defaultSrc = 'https://res.cloudinary.com/test-cloud/image/upload/v1234/photos/test.jpg'

describe('CloudinaryPreview', () => {
  describe('rendering two images with labels', () => {
    test('renders a "Current" label and a "Preview" label', () => {
      render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'auto' }}
          previewSettings={{ quality: 90, sharpen: 0, blur: 0, format: 'auto' }}
        />
      )

      expect(screen.getByText('Current')).toBeInTheDocument()
      expect(screen.getByText('Preview')).toBeInTheDocument()
    })

    test('renders two images', () => {
      render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'auto' }}
          previewSettings={{ quality: 90, sharpen: 0, blur: 0, format: 'auto' }}
        />
      )

      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(2)
    })

    test('current image uses currentSettings transformations', () => {
      render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={{ quality: 80, sharpen: 100, blur: 0, format: 'webp' }}
          previewSettings={{ quality: 90, sharpen: 0, blur: 0, format: 'auto' }}
        />
      )

      const images = screen.getAllByRole('img')
      // Current image should have f_webp,q_80,e_sharpen:100
      expect(images[0].src).toContain('f_webp,q_80,e_sharpen:100')
    })

    test('preview image uses previewSettings transformations', () => {
      render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'auto' }}
          previewSettings={{ quality: 50, sharpen: 0, blur: 300, format: 'png' }}
        />
      )

      const images = screen.getAllByRole('img')
      // Preview image should have f_png,q_50,e_blur:300
      expect(images[1].src).toContain('f_png,q_50,e_blur:300')
    })
  })

  describe('transformation details display', () => {
    test('displays quality info for current settings', () => {
      render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={{ quality: 85, sharpen: 0, blur: 0, format: 'auto' }}
          previewSettings={{ quality: 90, sharpen: 0, blur: 0, format: 'auto' }}
        />
      )

      expect(screen.getByText(/Quality: 85/)).toBeInTheDocument()
    })

    test('displays sharpen info when sharpen > 0', () => {
      render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={{ quality: 80, sharpen: 150, blur: 0, format: 'auto' }}
          previewSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'auto' }}
        />
      )

      expect(screen.getByText(/Sharpen: 150/)).toBeInTheDocument()
    })

    test('displays blur info when blur > 0', () => {
      render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={{ quality: 80, sharpen: 0, blur: 500, format: 'auto' }}
          previewSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'auto' }}
        />
      )

      expect(screen.getByText(/Blur: 500/)).toBeInTheDocument()
    })

    test('displays format info', () => {
      render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'webp' }}
          previewSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'auto' }}
        />
      )

      expect(screen.getByText(/Format: webp/)).toBeInTheDocument()
    })

    test('displays combined transformation details', () => {
      render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={{ quality: 75, sharpen: 100, blur: 200, format: 'png' }}
          previewSettings={{ quality: 90, sharpen: 0, blur: 0, format: 'auto' }}
        />
      )

      expect(screen.getByText(/Quality: 75/)).toBeInTheDocument()
      expect(screen.getByText(/Sharpen: 100/)).toBeInTheDocument()
      expect(screen.getByText(/Blur: 200/)).toBeInTheDocument()
      expect(screen.getByText(/Format: png/)).toBeInTheDocument()
    })
  })

  describe('updates when previewSettings change', () => {
    test('preview image URL updates with new settings', () => {
      const { rerender } = render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'auto' }}
          previewSettings={{ quality: 50, sharpen: 0, blur: 0, format: 'auto' }}
        />
      )

      let images = screen.getAllByRole('img')
      expect(images[1].src).toContain('q_50')

      rerender(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'auto' }}
          previewSettings={{ quality: 95, sharpen: 200, blur: 0, format: 'webp' }}
        />
      )

      images = screen.getAllByRole('img')
      expect(images[1].src).toContain('f_webp,q_95,e_sharpen:200')
    })
  })

  describe('handles null/undefined settings gracefully', () => {
    test('renders with null currentSettings', () => {
      render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={null}
          previewSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'auto' }}
        />
      )

      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(2)
      // Null settings should fall back to defaults (f_auto,q_auto)
      expect(images[0].src).toContain('f_auto,q_auto')
    })

    test('renders with undefined previewSettings', () => {
      render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'auto' }}
          previewSettings={undefined}
        />
      )

      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(2)
      // Undefined settings should fall back to defaults
      expect(images[1].src).toContain('f_auto,q_auto')
    })

    test('renders with both settings null', () => {
      render(
        <CloudinaryPreview
          src={defaultSrc}
          currentSettings={null}
          previewSettings={null}
        />
      )

      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(2)
    })

    test('renders nothing when src is not provided', () => {
      const { container } = render(
        <CloudinaryPreview
          src=""
          currentSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'auto' }}
          previewSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'auto' }}
        />
      )

      expect(container.innerHTML).toBe('')
    })
  })
})
