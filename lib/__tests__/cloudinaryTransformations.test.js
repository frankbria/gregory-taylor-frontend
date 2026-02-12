// lib/__tests__/cloudinaryTransformations.test.js

import {
  buildTransformationString,
  getTransformationDefaults,
  QUALITY_RANGE,
  SHARPEN_RANGE,
  BLUR_RANGE,
  FORMAT_OPTIONS,
} from '../cloudinaryTransformations'

describe('cloudinaryTransformations constants', () => {
  test('QUALITY_RANGE has min 1 and max 100', () => {
    expect(QUALITY_RANGE).toEqual({ min: 1, max: 100 })
  })

  test('SHARPEN_RANGE has min 0 and max 400', () => {
    expect(SHARPEN_RANGE).toEqual({ min: 0, max: 400 })
  })

  test('BLUR_RANGE has min 0 and max 2000', () => {
    expect(BLUR_RANGE).toEqual({ min: 0, max: 2000 })
  })

  test('FORMAT_OPTIONS includes expected formats', () => {
    expect(FORMAT_OPTIONS).toEqual(['auto', 'webp', 'jpg', 'png', 'avif'])
  })
})

describe('getTransformationDefaults', () => {
  test('returns default settings object', () => {
    const defaults = getTransformationDefaults()
    expect(defaults).toEqual({
      quality: 'auto',
      sharpen: 0,
      blur: 0,
      format: 'auto',
    })
  })

  test('returns a new object each time (not shared reference)', () => {
    const a = getTransformationDefaults()
    const b = getTransformationDefaults()
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
  })
})

describe('buildTransformationString', () => {
  test('returns default transformation string with no settings', () => {
    const result = buildTransformationString({})
    expect(result).toBe('f_auto,q_auto')
  })

  test('returns default transformation string with null input', () => {
    const result = buildTransformationString(null)
    expect(result).toBe('f_auto,q_auto')
  })

  test('returns default transformation string with undefined input', () => {
    const result = buildTransformationString(undefined)
    expect(result).toBe('f_auto,q_auto')
  })

  test('includes explicit quality setting', () => {
    const result = buildTransformationString({ quality: 80 })
    expect(result).toBe('f_auto,q_80')
  })

  test('uses q_auto when quality is "auto"', () => {
    const result = buildTransformationString({ quality: 'auto' })
    expect(result).toBe('f_auto,q_auto')
  })

  test('includes sharpen transformation when amount > 0', () => {
    const result = buildTransformationString({ sharpen: 150 })
    expect(result).toBe('f_auto,q_auto,e_sharpen:150')
  })

  test('excludes sharpen transformation when amount is 0', () => {
    const result = buildTransformationString({ sharpen: 0 })
    expect(result).toBe('f_auto,q_auto')
  })

  test('includes blur transformation when amount > 0', () => {
    const result = buildTransformationString({ blur: 500 })
    expect(result).toBe('f_auto,q_auto,e_blur:500')
  })

  test('excludes blur transformation when amount is 0', () => {
    const result = buildTransformationString({ blur: 0 })
    expect(result).toBe('f_auto,q_auto')
  })

  test('overrides format when specified', () => {
    const result = buildTransformationString({ format: 'webp' })
    expect(result).toBe('f_webp,q_auto')
  })

  test('combines multiple transformations', () => {
    const result = buildTransformationString({
      quality: 75,
      sharpen: 100,
      blur: 200,
      format: 'png',
    })
    expect(result).toBe('f_png,q_75,e_sharpen:100,e_blur:200')
  })

  test('ignores null values in settings', () => {
    const result = buildTransformationString({
      quality: null,
      sharpen: null,
      blur: null,
      format: null,
    })
    expect(result).toBe('f_auto,q_auto')
  })

  test('ignores undefined values in settings', () => {
    const result = buildTransformationString({
      quality: undefined,
      sharpen: undefined,
      blur: undefined,
      format: undefined,
    })
    expect(result).toBe('f_auto,q_auto')
  })
})
