import React from 'react'
import { render, screen } from '@testing-library/react'
import CategoryGridSkeleton from '../CategoryGridSkeleton'

describe('CategoryGridSkeleton', () => {
  it('should render the default number of skeleton items (6)', () => {
    render(<CategoryGridSkeleton />)
    const items = screen.getAllByTestId('category-skeleton-item')
    expect(items).toHaveLength(6)
  })

  it('should render the specified number of skeleton items', () => {
    render(<CategoryGridSkeleton count={3} />)
    const items = screen.getAllByTestId('category-skeleton-item')
    expect(items).toHaveLength(3)
  })

  it('should apply animate-pulse class to each item', () => {
    render(<CategoryGridSkeleton count={2} />)
    const items = screen.getAllByTestId('category-skeleton-item')
    items.forEach((item) => {
      expect(item.className).toContain('animate-pulse')
    })
  })

  it('should use the correct grid layout matching CategoryGrid', () => {
    const { container } = render(<CategoryGridSkeleton count={1} />)
    const grid = container.firstChild
    expect(grid.className).toContain('grid')
    expect(grid.className).toContain('grid-cols-1')
    expect(grid.className).toContain('sm:grid-cols-2')
    expect(grid.className).toContain('md:grid-cols-3')
    expect(grid.className).toContain('gap-8')
  })

  it('should render items with fixed height matching CategoryGrid cards', () => {
    render(<CategoryGridSkeleton count={1} />)
    const item = screen.getByTestId('category-skeleton-item')
    const inner = item.querySelector('[class*="h-[280px]"]')
    expect(inner).not.toBeNull()
  })
})
