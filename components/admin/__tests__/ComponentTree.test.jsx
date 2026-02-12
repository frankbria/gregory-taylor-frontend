import React from 'react'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockSelectComponent = jest.fn()
const mockGetComponentClasses = jest.fn()
const mockUseLayout = jest.fn()

jest.mock('@/lib/LayoutContext', () => ({
  useLayout: () => mockUseLayout(),
}))

import ComponentTree from '../ComponentTree'

const sampleTree = [
  {
    id: 'header',
    label: 'Header',
    type: 'layout',
    children: [
      { id: 'header-logo', label: 'Logo', type: 'element' },
      { id: 'header-nav', label: 'Navigation', type: 'element' },
    ],
  },
  {
    id: 'hero',
    label: 'Hero Section',
    type: 'section',
    children: [
      { id: 'hero-title', label: 'Title', type: 'element' },
    ],
  },
  {
    id: 'footer',
    label: 'Footer',
    type: 'layout',
    children: [],
  },
]

describe('ComponentTree', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetComponentClasses.mockReturnValue([])
    mockUseLayout.mockReturnValue({
      selectedComponentId: null,
      tree: sampleTree,
      selectComponent: mockSelectComponent,
      getComponentClasses: mockGetComponentClasses,
    })
  })

  it('renders all top-level nodes from tree', () => {
    render(<ComponentTree />)

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Hero Section')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('does not show children initially (collapsed by default)', () => {
    render(<ComponentTree />)

    expect(screen.queryByText('Logo')).not.toBeInTheDocument()
    expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
    expect(screen.queryByText('Title')).not.toBeInTheDocument()
  })

  it('expands node to show children on chevron click', async () => {
    const user = userEvent.setup()
    render(<ComponentTree />)

    const headerRow = screen.getByText('Header').closest('[data-testid="tree-node-header"]')
    const toggleBtn = within(headerRow).getByRole('button', { name: /toggle/i })
    await user.click(toggleBtn)

    await waitFor(() => {
      expect(screen.getByText('Logo')).toBeInTheDocument()
      expect(screen.getByText('Navigation')).toBeInTheDocument()
    })
  })

  it('collapses expanded node on second chevron click', async () => {
    const user = userEvent.setup()
    render(<ComponentTree />)

    const headerRow = screen.getByText('Header').closest('[data-testid="tree-node-header"]')
    const toggleBtn = within(headerRow).getByRole('button', { name: /toggle/i })

    await user.click(toggleBtn)
    await waitFor(() => {
      expect(screen.getByText('Logo')).toBeInTheDocument()
    })

    await user.click(toggleBtn)
    await waitFor(() => {
      expect(screen.queryByText('Logo')).not.toBeInTheDocument()
    })
  })

  it('highlights selected component', () => {
    mockUseLayout.mockReturnValue({
      selectedComponentId: 'hero',
      tree: sampleTree,
      selectComponent: mockSelectComponent,
      getComponentClasses: mockGetComponentClasses,
    })

    render(<ComponentTree />)

    const heroNode = screen.getByTestId('tree-node-hero')
    expect(heroNode).toHaveClass('bg-blue-50')
    expect(heroNode).toHaveClass('border-blue-200')
  })

  it('calls selectComponent when node label is clicked', async () => {
    const user = userEvent.setup()
    render(<ComponentTree />)

    await user.click(screen.getByText('Hero Section'))

    expect(mockSelectComponent).toHaveBeenCalledWith('hero')
  })

  it('calls selectComponent for child node when clicked', async () => {
    const user = userEvent.setup()
    render(<ComponentTree />)

    // Expand header first
    const headerRow = screen.getByText('Header').closest('[data-testid="tree-node-header"]')
    const toggleBtn = within(headerRow).getByRole('button', { name: /toggle/i })
    await user.click(toggleBtn)

    await waitFor(() => {
      expect(screen.getByText('Logo')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Logo'))

    expect(mockSelectComponent).toHaveBeenCalledWith('header-logo')
  })

  it('filters tree based on search input', async () => {
    const user = userEvent.setup()
    render(<ComponentTree />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'Hero')

    await waitFor(() => {
      expect(screen.getByText('Hero Section')).toBeInTheDocument()
      expect(screen.queryByText('Header')).not.toBeInTheDocument()
      expect(screen.queryByText('Footer')).not.toBeInTheDocument()
    })
  })

  it('filters and includes children matching search', async () => {
    const user = userEvent.setup()
    render(<ComponentTree />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'Logo')

    await waitFor(() => {
      // Parent should appear because its child matches
      expect(screen.getByText('Header')).toBeInTheDocument()
      // The matching child should be visible (auto-expanded)
      expect(screen.getByText('Logo')).toBeInTheDocument()
      // Non-matching sections hidden
      expect(screen.queryByText('Hero Section')).not.toBeInTheDocument()
    })
  })

  it('shows class count for components with existing styles', () => {
    mockGetComponentClasses.mockImplementation((id) => {
      if (id === 'header') return ['bg-white', 'shadow-md', 'p-4']
      return []
    })

    render(<ComponentTree />)

    const headerNode = screen.getByTestId('tree-node-header')
    expect(within(headerNode).getByText('3')).toBeInTheDocument()
  })

  it('does not show class count when component has no styles', () => {
    mockGetComponentClasses.mockReturnValue([])

    render(<ComponentTree />)

    const heroNode = screen.getByTestId('tree-node-hero')
    // Should not have any numeric badge
    expect(within(heroNode).queryByText(/^\d+$/)).not.toBeInTheDocument()
  })

  it('handles empty tree gracefully', () => {
    mockUseLayout.mockReturnValue({
      selectedComponentId: null,
      tree: [],
      selectComponent: mockSelectComponent,
      getComponentClasses: mockGetComponentClasses,
    })

    render(<ComponentTree />)

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    // No nodes rendered, no error
    expect(screen.queryByTestId(/tree-node/)).not.toBeInTheDocument()
  })

  it('shows type badges for nodes', () => {
    render(<ComponentTree />)

    const headerNode = screen.getByTestId('tree-node-header')
    expect(within(headerNode).getByText('layout')).toBeInTheDocument()

    const heroNode = screen.getByTestId('tree-node-hero')
    expect(within(heroNode).getByText('section')).toBeInTheDocument()
  })

  it('expands all nodes when expand all is clicked', async () => {
    const user = userEvent.setup()
    render(<ComponentTree />)

    const expandAllBtn = screen.getByRole('button', { name: /expand all/i })
    await user.click(expandAllBtn)

    await waitFor(() => {
      expect(screen.getByText('Logo')).toBeInTheDocument()
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
    })
  })

  it('collapses all nodes when collapse all is clicked', async () => {
    const user = userEvent.setup()
    render(<ComponentTree />)

    // First expand all
    const expandAllBtn = screen.getByRole('button', { name: /expand all/i })
    await user.click(expandAllBtn)

    await waitFor(() => {
      expect(screen.getByText('Logo')).toBeInTheDocument()
    })

    // Then collapse all
    const collapseAllBtn = screen.getByRole('button', { name: /collapse all/i })
    await user.click(collapseAllBtn)

    await waitFor(() => {
      expect(screen.queryByText('Logo')).not.toBeInTheDocument()
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
      expect(screen.queryByText('Title')).not.toBeInTheDocument()
    })
  })

  it('applies custom className prop', () => {
    const { container } = render(<ComponentTree className="mt-4" />)

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('mt-4')
  })
})
