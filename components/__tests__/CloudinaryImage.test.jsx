import React from 'react'
import { render, screen } from '@testing-library/react'
import CloudinaryImage from '../CloudinaryImage'

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, className, style, ...rest }) {
    return (
      <img
        src={src}
        alt={alt}
        data-fill={fill ? 'true' : 'false'}
        className={className}
        style={style}
        data-testid="next-image"
        {...rest}
      />
    )
  }
})

// Mock cloudinaryLoader
jest.mock('@/lib/cloudinaryLoader', () => {
  return function mockLoader({ src }) {
    return src
  }
})

describe('CloudinaryImage Component', () => {
  const defaultProps = {
    src: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    alt: 'Test image'
  }

  describe('Basic rendering', () => {
    it('should render null when src is not provided', () => {
      const { container } = render(<CloudinaryImage alt="Test" />)
      expect(container.firstChild).toBeNull()
    })

    it('should render an image when src is provided', () => {
      render(<CloudinaryImage {...defaultProps} />)
      const image = screen.getByTestId('next-image')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('alt', 'Test image')
    })

    it('should apply custom className to the Image component', () => {
      render(<CloudinaryImage {...defaultProps} className="custom-class" />)
      const image = screen.getByTestId('next-image')
      expect(image.className).toContain('custom-class')
    })
  })

  // Helper function for comparing floating point percentages
  const expectPaddingTopToBeCloseTo = (wrapper, expectedPercentage) => {
    const actual = parseFloat(wrapper.style.paddingTop)
    expect(actual).toBeCloseTo(expectedPercentage, 2)
  }

  describe('Aspect ratio calculation', () => {
    it('should default to 3:2 aspect ratio when no dimension props provided', () => {
      const { container } = render(<CloudinaryImage {...defaultProps} />)
      const wrapper = container.firstChild
      // 3:2 ratio = 100 / 1.5 = 66.67%
      expectPaddingTopToBeCloseTo(wrapper, 66.67)
    })

    it('should use 5:1 aspect ratio when fullLength is true', () => {
      const { container } = render(<CloudinaryImage {...defaultProps} fullLength={true} />)
      const wrapper = container.firstChild
      // 5:1 ratio = 100 / 5 = 20%
      expectPaddingTopToBeCloseTo(wrapper, 20)
    })

    it('should use aspectRatio prop when provided', () => {
      const { container } = render(<CloudinaryImage {...defaultProps} aspectRatio={16/9} />)
      const wrapper = container.firstChild
      // 16:9 ratio = 100 / 1.777... = 56.25%
      expectPaddingTopToBeCloseTo(wrapper, 56.25)
    })

    it('should calculate aspect ratio from width and height when both provided', () => {
      const { container } = render(<CloudinaryImage {...defaultProps} width={1920} height={1080} />)
      const wrapper = container.firstChild
      // 1920/1080 = 1.777... = 100 / 1.777... = 56.25%
      expectPaddingTopToBeCloseTo(wrapper, 56.25)
    })

    it('should prioritize aspectRatio prop over width/height calculation', () => {
      const { container } = render(
        <CloudinaryImage
          {...defaultProps}
          aspectRatio={4/3}
          width={1920}
          height={1080}
        />
      )
      const wrapper = container.firstChild
      // 4:3 ratio = 100 / 1.333... = 75%
      expectPaddingTopToBeCloseTo(wrapper, 75)
    })

    it('should fall back to default when only width is provided', () => {
      const { container } = render(<CloudinaryImage {...defaultProps} width={1920} />)
      const wrapper = container.firstChild
      // Default 3:2 ratio
      expectPaddingTopToBeCloseTo(wrapper, 66.67)
    })

    it('should fall back to default when only height is provided', () => {
      const { container } = render(<CloudinaryImage {...defaultProps} height={1080} />)
      const wrapper = container.firstChild
      // Default 3:2 ratio
      expectPaddingTopToBeCloseTo(wrapper, 66.67)
    })

    it('should handle square images (1:1 aspect ratio)', () => {
      const { container } = render(<CloudinaryImage {...defaultProps} aspectRatio={1} />)
      const wrapper = container.firstChild
      // 1:1 ratio = 100 / 1 = 100%
      expectPaddingTopToBeCloseTo(wrapper, 100)
    })
  })

  describe('Object fit handling', () => {
    it('should use object-cover by default', () => {
      render(<CloudinaryImage {...defaultProps} />)
      const image = screen.getByTestId('next-image')
      expect(image.className).toContain('object-cover')
    })

    it('should use object-contain for very wide images (aspectRatio > 2.5)', () => {
      render(<CloudinaryImage {...defaultProps} aspectRatio={3} />)
      const image = screen.getByTestId('next-image')
      expect(image.className).toContain('object-contain')
    })

    it('should use object-contain for fullLength images (5:1 ratio)', () => {
      render(<CloudinaryImage {...defaultProps} fullLength={true} />)
      const image = screen.getByTestId('next-image')
      expect(image.className).toContain('object-contain')
    })

    it('should allow objectFit prop to override automatic determination', () => {
      render(<CloudinaryImage {...defaultProps} aspectRatio={3} objectFit="cover" />)
      const image = screen.getByTestId('next-image')
      expect(image.className).toContain('object-cover')
      expect(image.className).not.toContain('object-contain')
    })

    it('should use object-cover for normal aspect ratios', () => {
      render(<CloudinaryImage {...defaultProps} aspectRatio={16/9} />)
      const image = screen.getByTestId('next-image')
      expect(image.className).toContain('object-cover')
    })

    it('should use object-cover at exactly 2.5 aspect ratio', () => {
      render(<CloudinaryImage {...defaultProps} aspectRatio={2.5} />)
      const image = screen.getByTestId('next-image')
      expect(image.className).toContain('object-cover')
    })
  })

  describe('Blur placeholder', () => {
    it('should generate blur placeholder for Cloudinary images', () => {
      render(<CloudinaryImage {...defaultProps} />)
      const image = screen.getByTestId('next-image')
      expect(image).toHaveAttribute('placeholder', 'blur')
    })

    it('should include width parameter in blur URL', () => {
      render(<CloudinaryImage {...defaultProps} />)
      const image = screen.getByTestId('next-image')
      const blurDataURL = image.getAttribute('blurdataurl')
      expect(blurDataURL).toContain('e_blur:1000')
      expect(blurDataURL).toContain('w_50')
    })

    it('should not generate blur placeholder for non-Cloudinary images', () => {
      render(<CloudinaryImage src="https://example.com/image.jpg" alt="Test" />)
      const image = screen.getByTestId('next-image')
      expect(image).not.toHaveAttribute('placeholder')
    })
  })

  describe('Backward compatibility', () => {
    it('should maintain fullLength prop functionality', () => {
      const { container } = render(<CloudinaryImage {...defaultProps} fullLength={true} />)
      const wrapper = container.firstChild
      const image = screen.getByTestId('next-image')

      // 5:1 ratio padding
      expectPaddingTopToBeCloseTo(wrapper, 20)
      // object-contain for panoramic
      expect(image.className).toContain('object-contain')
    })

    it('should work with legacy code that only passes src, alt, and className', () => {
      const { container } = render(
        <CloudinaryImage
          src={defaultProps.src}
          alt={defaultProps.alt}
          className="legacy-class"
        />
      )
      const wrapper = container.firstChild
      const image = screen.getByTestId('next-image')

      expect(wrapper).toBeInTheDocument()
      expectPaddingTopToBeCloseTo(wrapper, 66.67)
      expect(image.className).toContain('legacy-class')
    })

    it('should work when fullLength is false', () => {
      const { container } = render(<CloudinaryImage {...defaultProps} fullLength={false} />)
      const wrapper = container.firstChild
      expectPaddingTopToBeCloseTo(wrapper, 66.67)
    })
  })

  describe('Priority order for aspect ratio determination', () => {
    it('should use aspectRatio > width/height > fullLength > default (priority 1: aspectRatio)', () => {
      const { container } = render(
        <CloudinaryImage
          {...defaultProps}
          aspectRatio={4/3}
          width={1920}
          height={1080}
          fullLength={true}
        />
      )
      const wrapper = container.firstChild
      // 4:3 = 75%
      expectPaddingTopToBeCloseTo(wrapper, 75)
    })

    it('should use width/height when aspectRatio not provided (priority 2)', () => {
      const { container } = render(
        <CloudinaryImage
          {...defaultProps}
          width={1920}
          height={1080}
          fullLength={true}
        />
      )
      const wrapper = container.firstChild
      // 16:9 = 56.25%
      expectPaddingTopToBeCloseTo(wrapper, 56.25)
    })

    it('should use fullLength when aspectRatio and dimensions not provided (priority 3)', () => {
      const { container } = render(
        <CloudinaryImage
          {...defaultProps}
          fullLength={true}
        />
      )
      const wrapper = container.firstChild
      // 5:1 = 20%
      expectPaddingTopToBeCloseTo(wrapper, 20)
    })
  })

  describe('Edge cases', () => {
    it('should handle very tall images (aspectRatio < 1)', () => {
      const { container } = render(<CloudinaryImage {...defaultProps} aspectRatio={0.5} />)
      const wrapper = container.firstChild
      // 0.5 ratio = 100 / 0.5 = 200%
      expectPaddingTopToBeCloseTo(wrapper, 200)
    })

    it('should handle ultra-wide panoramas (10:1)', () => {
      const { container } = render(<CloudinaryImage {...defaultProps} aspectRatio={10} />)
      const wrapper = container.firstChild
      const image = screen.getByTestId('next-image')

      // 10:1 = 10%
      expectPaddingTopToBeCloseTo(wrapper, 10)
      // Should use contain for ultra-wide
      expect(image.className).toContain('object-contain')
    })

    it('should pass through additional props via rest spread', () => {
      render(<CloudinaryImage {...defaultProps} data-custom="value" priority={true} />)
      const image = screen.getByTestId('next-image')
      expect(image).toHaveAttribute('data-custom', 'value')
    })
  })
})
