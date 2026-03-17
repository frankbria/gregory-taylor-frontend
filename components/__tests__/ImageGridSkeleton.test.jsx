import React from 'react'
import { render, screen } from '@testing-library/react'
import ImageGridSkeleton from '../ImageGridSkeleton'

describe('ImageGridSkeleton', () => {
  it('should render the default number of skeleton items (9)', () => {
    render(<ImageGridSkeleton />)
    const items = screen.getAllByTestId('skeleton-item')
    expect(items).toHaveLength(9)
  })

  it('should render the specified number of skeleton items', () => {
    render(<ImageGridSkeleton count={12} />)
    const items = screen.getAllByTestId('skeleton-item')
    expect(items).toHaveLength(12)
  })

  it('should apply animate-pulse class to each item', () => {
    render(<ImageGridSkeleton count={3} />)
    const items = screen.getAllByTestId('skeleton-item')
    items.forEach((item) => {
      expect(item.className).toContain('animate-pulse')
    })
  })

  it('should use the correct grid layout matching the photo grid', () => {
    const { container } = render(<ImageGridSkeleton count={3} />)
    const grid = container.firstChild
    expect(grid.className).toContain('grid')
    expect(grid.className).toContain('grid-cols-1')
    expect(grid.className).toContain('sm:grid-cols-2')
    expect(grid.className).toContain('md:grid-cols-3')
    expect(grid.className).toContain('gap-6')
  })

  it('should render image placeholder with 3:2 aspect ratio', () => {
    render(<ImageGridSkeleton count={1} />)
    const placeholder = screen.getByTestId('skeleton-image-placeholder')
    expect(placeholder.className).toContain('aspect-[3/2]')
  })

  it('should render a title placeholder below the image', () => {
    render(<ImageGridSkeleton count={1} />)
    const titlePlaceholder = screen.getByTestId('skeleton-title-placeholder')
    expect(titlePlaceholder).toBeInTheDocument()
  })
})
