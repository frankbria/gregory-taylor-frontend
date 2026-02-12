// lib/__tests__/cloudinaryLoader.test.js

import cloudinaryLoader from '../cloudinaryLoader'

// Set cloud name for tests
beforeAll(() => {
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud'
})

describe('cloudinaryLoader', () => {
  describe('backward compatibility (no customSettings)', () => {
    test('generates correct URL with width and auto quality', () => {
      const result = cloudinaryLoader({
        src: 'v1234/photos/test.jpg',
        width: 800,
      })
      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_auto,w_800/v1234/photos/test.jpg'
      )
    })

    test('generates correct URL with explicit quality', () => {
      const result = cloudinaryLoader({
        src: 'v1234/photos/test.jpg',
        width: 800,
        quality: 75,
      })
      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_75,w_800/v1234/photos/test.jpg'
      )
    })

    test('returns null for empty src', () => {
      const result = cloudinaryLoader({ src: '', width: 800 })
      expect(result).toBeNull()
    })

    test('strips full Cloudinary URL domain from src', () => {
      const result = cloudinaryLoader({
        src: 'https://res.cloudinary.com/test-cloud/image/upload/v1234/photos/test.jpg',
        width: 600,
      })
      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_auto,w_600/v1234/photos/test.jpg'
      )
    })
  })

  describe('with customSettings', () => {
    test('applies explicit quality from customSettings', () => {
      const result = cloudinaryLoader({
        src: 'v1234/photos/test.jpg',
        width: 800,
        customSettings: { quality: 90 },
      })
      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_90,w_800/v1234/photos/test.jpg'
      )
    })

    test('customSettings quality overrides the quality parameter', () => {
      const result = cloudinaryLoader({
        src: 'v1234/photos/test.jpg',
        width: 800,
        quality: 50,
        customSettings: { quality: 90 },
      })
      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_90,w_800/v1234/photos/test.jpg'
      )
    })

    test('applies sharpen transformation', () => {
      const result = cloudinaryLoader({
        src: 'v1234/photos/test.jpg',
        width: 800,
        customSettings: { sharpen: 150 },
      })
      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_auto,e_sharpen:150,w_800/v1234/photos/test.jpg'
      )
    })

    test('applies blur transformation', () => {
      const result = cloudinaryLoader({
        src: 'v1234/photos/test.jpg',
        width: 800,
        customSettings: { blur: 500 },
      })
      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_auto,e_blur:500,w_800/v1234/photos/test.jpg'
      )
    })

    test('applies format override', () => {
      const result = cloudinaryLoader({
        src: 'v1234/photos/test.jpg',
        width: 800,
        customSettings: { format: 'webp' },
      })
      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_webp,q_auto,w_800/v1234/photos/test.jpg'
      )
    })

    test('applies all customSettings combined', () => {
      const result = cloudinaryLoader({
        src: 'v1234/photos/test.jpg',
        width: 800,
        customSettings: {
          quality: 85,
          sharpen: 100,
          blur: 200,
          format: 'png',
        },
      })
      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_png,q_85,e_sharpen:100,e_blur:200,w_800/v1234/photos/test.jpg'
      )
    })

    test('empty customSettings object behaves like no customSettings', () => {
      const result = cloudinaryLoader({
        src: 'v1234/photos/test.jpg',
        width: 800,
        customSettings: {},
      })
      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_auto,w_800/v1234/photos/test.jpg'
      )
    })

    test('null customSettings behaves like no customSettings', () => {
      const result = cloudinaryLoader({
        src: 'v1234/photos/test.jpg',
        width: 800,
        customSettings: null,
      })
      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_auto,w_800/v1234/photos/test.jpg'
      )
    })

    test('undefined customSettings behaves like no customSettings', () => {
      const result = cloudinaryLoader({
        src: 'v1234/photos/test.jpg',
        width: 800,
        customSettings: undefined,
      })
      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_auto,w_800/v1234/photos/test.jpg'
      )
    })
  })
})
