import React from 'react'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockUseLayout = jest.fn()

jest.mock('@/lib/LayoutContext', () => ({
  useLayout: () => mockUseLayout(),
}))

import ClassTagList from '../ClassTagList'
import { categorizeClass } from '../ClassTagList'

const mockRemoveClass = jest.fn()
const mockGetComponentClasses = jest.fn()

describe('ClassTagList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetComponentClasses.mockReturnValue([])
    mockUseLayout.mockReturnValue({
      selectedComponentId: null,
      getComponentClasses: mockGetComponentClasses,
      removeClass: mockRemoveClass,
    })
  })

  it('renders nothing when no component selected', () => {
    const { container } = render(<ClassTagList />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows "No classes applied" when component has no classes', () => {
    mockUseLayout.mockReturnValue({
      selectedComponentId: 'header',
      getComponentClasses: () => [],
      removeClass: mockRemoveClass,
    })

    render(<ClassTagList />)
    expect(screen.getByText('No classes applied')).toBeInTheDocument()
  })

  it('renders tags for each class', () => {
    mockUseLayout.mockReturnValue({
      selectedComponentId: 'header',
      getComponentClasses: () => ['p-4', 'bg-white', 'shadow-md'],
      removeClass: mockRemoveClass,
    })

    render(<ClassTagList />)

    expect(screen.getByText('p-4')).toBeInTheDocument()
    expect(screen.getByText('bg-white')).toBeInTheDocument()
    expect(screen.getByText('shadow-md')).toBeInTheDocument()
  })

  it('tags have correct color-coding for spacing (blue)', () => {
    mockUseLayout.mockReturnValue({
      selectedComponentId: 'header',
      getComponentClasses: () => ['p-4', 'mx-2', 'gap-4'],
      removeClass: mockRemoveClass,
    })

    render(<ClassTagList />)

    const p4Tag = screen.getByText('p-4').closest('[data-testid="class-tag"]')
    expect(p4Tag).toHaveClass('bg-blue-100', 'text-blue-800')

    const mxTag = screen.getByText('mx-2').closest('[data-testid="class-tag"]')
    expect(mxTag).toHaveClass('bg-blue-100', 'text-blue-800')

    const gapTag = screen.getByText('gap-4').closest('[data-testid="class-tag"]')
    expect(gapTag).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('tags have correct color-coding for sizing (green)', () => {
    mockUseLayout.mockReturnValue({
      selectedComponentId: 'header',
      getComponentClasses: () => ['w-full', 'h-64', 'min-w-0', 'max-h-screen'],
      removeClass: mockRemoveClass,
    })

    render(<ClassTagList />)

    const wTag = screen.getByText('w-full').closest('[data-testid="class-tag"]')
    expect(wTag).toHaveClass('bg-green-100', 'text-green-800')

    const hTag = screen.getByText('h-64').closest('[data-testid="class-tag"]')
    expect(hTag).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('tags have correct color-coding for layout (purple)', () => {
    mockUseLayout.mockReturnValue({
      selectedComponentId: 'header',
      getComponentClasses: () => ['flex', 'items-center', 'justify-between', 'grid', 'hidden'],
      removeClass: mockRemoveClass,
    })

    render(<ClassTagList />)

    const flexTag = screen.getByText('flex').closest('[data-testid="class-tag"]')
    expect(flexTag).toHaveClass('bg-purple-100', 'text-purple-800')

    const itemsTag = screen.getByText('items-center').closest('[data-testid="class-tag"]')
    expect(itemsTag).toHaveClass('bg-purple-100', 'text-purple-800')

    const justifyTag = screen.getByText('justify-between').closest('[data-testid="class-tag"]')
    expect(justifyTag).toHaveClass('bg-purple-100', 'text-purple-800')
  })

  it('tags have correct color-coding for colors (amber)', () => {
    mockUseLayout.mockReturnValue({
      selectedComponentId: 'header',
      getComponentClasses: () => ['bg-red-500', 'text-white', 'border-gray-300'],
      removeClass: mockRemoveClass,
    })

    render(<ClassTagList />)

    const bgTag = screen.getByText('bg-red-500').closest('[data-testid="class-tag"]')
    expect(bgTag).toHaveClass('bg-amber-100', 'text-amber-800')

    const textTag = screen.getByText('text-white').closest('[data-testid="class-tag"]')
    expect(textTag).toHaveClass('bg-amber-100', 'text-amber-800')
  })

  it('tags have correct color-coding for typography (indigo)', () => {
    mockUseLayout.mockReturnValue({
      selectedComponentId: 'header',
      getComponentClasses: () => ['text-lg', 'font-bold', 'leading-tight', 'tracking-wide'],
      removeClass: mockRemoveClass,
    })

    render(<ClassTagList />)

    const textTag = screen.getByText('text-lg').closest('[data-testid="class-tag"]')
    expect(textTag).toHaveClass('bg-indigo-100', 'text-indigo-800')

    const fontTag = screen.getByText('font-bold').closest('[data-testid="class-tag"]')
    expect(fontTag).toHaveClass('bg-indigo-100', 'text-indigo-800')
  })

  it('tags have correct color-coding for effects (rose)', () => {
    mockUseLayout.mockReturnValue({
      selectedComponentId: 'header',
      getComponentClasses: () => ['rounded-lg', 'shadow-md', 'opacity-50'],
      removeClass: mockRemoveClass,
    })

    render(<ClassTagList />)

    const roundedTag = screen.getByText('rounded-lg').closest('[data-testid="class-tag"]')
    expect(roundedTag).toHaveClass('bg-rose-100', 'text-rose-800')

    const shadowTag = screen.getByText('shadow-md').closest('[data-testid="class-tag"]')
    expect(shadowTag).toHaveClass('bg-rose-100', 'text-rose-800')
  })

  it('tags have correct color-coding for other/custom (gray)', () => {
    mockUseLayout.mockReturnValue({
      selectedComponentId: 'header',
      getComponentClasses: () => ['custom-class', 'overflow-hidden'],
      removeClass: mockRemoveClass,
    })

    render(<ClassTagList />)

    const customTag = screen.getByText('custom-class').closest('[data-testid="class-tag"]')
    expect(customTag).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  it('clicking X calls removeClass with correct args', async () => {
    const user = userEvent.setup()
    mockUseLayout.mockReturnValue({
      selectedComponentId: 'header',
      getComponentClasses: () => ['p-4', 'flex'],
      removeClass: mockRemoveClass,
    })

    render(<ClassTagList />)

    const p4Tag = screen.getByText('p-4').closest('[data-testid="class-tag"]')
    const removeBtn = within(p4Tag).getByRole('button', { name: /remove/i })
    await user.click(removeBtn)

    expect(mockRemoveClass).toHaveBeenCalledWith('header', 'p-4')
  })
})

describe('categorizeClass', () => {
  it('categorizes spacing classes', () => {
    expect(categorizeClass('p-4')).toBe('spacing')
    expect(categorizeClass('m-2')).toBe('spacing')
    expect(categorizeClass('mx-auto')).toBe('spacing')
    expect(categorizeClass('py-8')).toBe('spacing')
    expect(categorizeClass('gap-4')).toBe('spacing')
    expect(categorizeClass('gap-x-2')).toBe('spacing')
  })

  it('categorizes sizing classes', () => {
    expect(categorizeClass('w-full')).toBe('sizing')
    expect(categorizeClass('h-64')).toBe('sizing')
    expect(categorizeClass('min-w-0')).toBe('sizing')
    expect(categorizeClass('min-h-screen')).toBe('sizing')
    expect(categorizeClass('max-w-lg')).toBe('sizing')
    expect(categorizeClass('max-h-96')).toBe('sizing')
  })

  it('categorizes layout classes', () => {
    expect(categorizeClass('flex')).toBe('layout')
    expect(categorizeClass('grid')).toBe('layout')
    expect(categorizeClass('block')).toBe('layout')
    expect(categorizeClass('inline')).toBe('layout')
    expect(categorizeClass('items-center')).toBe('layout')
    expect(categorizeClass('justify-between')).toBe('layout')
    expect(categorizeClass('hidden')).toBe('layout')
  })

  it('categorizes color classes', () => {
    expect(categorizeClass('bg-red-500')).toBe('colors')
    expect(categorizeClass('text-white')).toBe('colors')
    expect(categorizeClass('text-black')).toBe('colors')
    expect(categorizeClass('text-gray-800')).toBe('colors')
    expect(categorizeClass('border-blue-300')).toBe('colors')
  })

  it('categorizes typography classes', () => {
    expect(categorizeClass('text-xs')).toBe('typography')
    expect(categorizeClass('text-sm')).toBe('typography')
    expect(categorizeClass('text-base')).toBe('typography')
    expect(categorizeClass('text-lg')).toBe('typography')
    expect(categorizeClass('text-xl')).toBe('typography')
    expect(categorizeClass('text-2xl')).toBe('typography')
    expect(categorizeClass('text-9xl')).toBe('typography')
    expect(categorizeClass('font-bold')).toBe('typography')
    expect(categorizeClass('leading-tight')).toBe('typography')
    expect(categorizeClass('tracking-wide')).toBe('typography')
    expect(categorizeClass('text-left')).toBe('typography')
    expect(categorizeClass('text-center')).toBe('typography')
    expect(categorizeClass('text-right')).toBe('typography')
    expect(categorizeClass('text-justify')).toBe('typography')
  })

  it('categorizes effects classes', () => {
    expect(categorizeClass('rounded')).toBe('effects')
    expect(categorizeClass('rounded-lg')).toBe('effects')
    expect(categorizeClass('shadow-md')).toBe('effects')
    expect(categorizeClass('shadow')).toBe('effects')
    expect(categorizeClass('border')).toBe('effects')
    expect(categorizeClass('border-2')).toBe('effects')
    expect(categorizeClass('opacity-50')).toBe('effects')
  })

  it('categorizes unknown classes as other', () => {
    expect(categorizeClass('custom-thing')).toBe('other')
    expect(categorizeClass('overflow-hidden')).toBe('other')
  })
})
