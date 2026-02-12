import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'react-hot-toast'

const mockUseContent = jest.fn()
jest.mock('@/lib/ContentContext', () => ({
  useContent: () => mockUseContent(),
}))

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock the admin components to avoid deep dependency chains
jest.mock('@/components/admin/ComponentTree', () => {
  return function MockComponentTree() {
    return <div data-testid="component-tree">ComponentTree</div>
  }
})

jest.mock('@/components/admin/TailwindClassEditor', () => {
  return function MockTailwindClassEditor() {
    return <div data-testid="tailwind-class-editor">TailwindClassEditor</div>
  }
})

jest.mock('@/components/admin/ClassTagList', () => {
  return function MockClassTagList() {
    return <div data-testid="class-tag-list">ClassTagList</div>
  }
})

jest.mock('@/components/admin/LayoutEditorToolbar', () => {
  return function MockLayoutEditorToolbar({ onSave, saving }) {
    return (
      <div data-testid="layout-editor-toolbar">
        <button onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Component Styles'}
        </button>
      </div>
    )
  }
})

jest.mock('@/lib/LayoutContext', () => ({
  LayoutProvider: ({ children }) => <div data-testid="layout-provider">{children}</div>,
  useLayout: () => ({
    componentStyles: { header: ['bg-black'] },
    markSaved: jest.fn(),
    loadStyles: jest.fn(),
  }),
}))

import LayoutSettingsPage from '../page'

const mockLayoutSettings = {
  showHeader: true,
  showFooter: true,
  navItems: [
    { label: 'Home', href: '/' },
    { label: 'Gallery', href: '/gallery' },
  ],
  colorScheme: 'light',
  gridColumns: 3,
  componentStyles: { header: ['bg-black'] },
}

const defaultContentState = {
  layoutSettings: mockLayoutSettings,
  loading: false,
  refreshLayoutSettings: jest.fn(),
  updateLayoutSettings: jest.fn(),
}

describe('LayoutSettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseContent.mockReturnValue(defaultContentState)
  })

  describe('rendering', () => {
    it('renders the page heading', () => {
      render(<LayoutSettingsPage />)
      expect(screen.getByText('Layout Settings')).toBeInTheDocument()
    })

    it('calls refreshLayoutSettings on mount', () => {
      render(<LayoutSettingsPage />)
      expect(defaultContentState.refreshLayoutSettings).toHaveBeenCalled()
    })

    it('shows loading indicator when loading', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        loading: true,
      })

      render(<LayoutSettingsPage />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders form fields with current settings', () => {
      render(<LayoutSettingsPage />)

      expect(screen.getByLabelText('Show Header')).toBeChecked()
      expect(screen.getByLabelText('Show Footer')).toBeChecked()
      expect(screen.getByLabelText('Grid Columns')).toHaveValue(3)
    })

    it('renders nav items list', () => {
      render(<LayoutSettingsPage />)

      expect(screen.getByDisplayValue('Home')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Gallery')).toBeInTheDocument()
    })

    it('renders the component styling section', () => {
      render(<LayoutSettingsPage />)

      expect(screen.getByTestId('layout-provider')).toBeInTheDocument()
      expect(screen.getByTestId('component-tree')).toBeInTheDocument()
      expect(screen.getByTestId('tailwind-class-editor')).toBeInTheDocument()
      expect(screen.getByTestId('class-tag-list')).toBeInTheDocument()
      expect(screen.getByTestId('layout-editor-toolbar')).toBeInTheDocument()
    })
  })

  describe('global settings collapsible', () => {
    it('shows global settings expanded by default', () => {
      render(<LayoutSettingsPage />)
      expect(screen.getByText('Global Settings')).toBeInTheDocument()
      expect(screen.getByLabelText('Show Header')).toBeInTheDocument()
    })

    it('collapses global settings on toggle click', async () => {
      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      await user.click(screen.getByText('Global Settings'))

      expect(screen.queryByLabelText('Show Header')).not.toBeInTheDocument()
    })

    it('expands global settings when collapsed and toggled', async () => {
      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      await user.click(screen.getByText('Global Settings'))
      expect(screen.queryByLabelText('Show Header')).not.toBeInTheDocument()

      await user.click(screen.getByText('Global Settings'))
      expect(screen.getByLabelText('Show Header')).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('calls updateLayoutSettings on save', async () => {
      const mockUpdate = jest.fn().mockResolvedValue()
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        updateLayoutSettings: mockUpdate,
      })

      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      await user.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
          showHeader: true,
          showFooter: true,
        }))
      })
    })

    it('preserves existing settings when saving global settings', async () => {
      const mockUpdate = jest.fn().mockResolvedValue()
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        updateLayoutSettings: mockUpdate,
      })

      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      await user.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
          componentStyles: { header: ['bg-black'] },
        }))
      })
    })

    it('shows success toast after successful save', async () => {
      const mockUpdate = jest.fn().mockResolvedValue()
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        updateLayoutSettings: mockUpdate,
      })

      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      await user.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Layout settings updated successfully')
      })
    })

    it('shows error toast when save fails', async () => {
      const mockUpdate = jest.fn().mockRejectedValue(new Error('Save failed'))
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        updateLayoutSettings: mockUpdate,
      })

      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      await user.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update layout settings')
      })
    })
  })

  describe('component styling save', () => {
    it('calls updateLayoutSettings when saving component styles', async () => {
      const mockUpdate = jest.fn().mockResolvedValue()
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        updateLayoutSettings: mockUpdate,
      })

      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      await user.click(screen.getByText('Save Component Styles'))

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
          componentStyles: { header: ['bg-black'] },
        }))
      })
    })

    it('shows success toast when component styles saved', async () => {
      const mockUpdate = jest.fn().mockResolvedValue()
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        updateLayoutSettings: mockUpdate,
      })

      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      await user.click(screen.getByText('Save Component Styles'))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Component styles saved')
      })
    })

    it('shows error toast when component style save fails', async () => {
      const mockUpdate = jest.fn().mockRejectedValue(new Error('fail'))
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        updateLayoutSettings: mockUpdate,
      })

      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      await user.click(screen.getByText('Save Component Styles'))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save component styles')
      })
    })
  })

  describe('nav items management', () => {
    it('adds a new nav item when add button is clicked', async () => {
      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      const addButton = screen.getByRole('button', { name: /add nav item/i })
      await user.click(addButton)

      const labelInputs = screen.getAllByPlaceholderText('Label')
      expect(labelInputs).toHaveLength(3)
    })

    it('removes a nav item when remove button is clicked', async () => {
      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      const removeButtons = screen.getAllByRole('button', { name: /remove/i })
      await user.click(removeButtons[0])

      await waitFor(() => {
        expect(screen.queryByDisplayValue('Home')).not.toBeInTheDocument()
        expect(screen.getByDisplayValue('Gallery')).toBeInTheDocument()
      })
    })
  })

  describe('reset to defaults', () => {
    it('resets form to default values when reset is clicked', async () => {
      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      const gridInput = screen.getByLabelText('Grid Columns')
      await user.clear(gridInput)
      await user.type(gridInput, '5')
      expect(gridInput).toHaveValue(5)

      await user.click(screen.getByRole('button', { name: /reset to defaults/i }))

      await waitFor(() => {
        expect(screen.getByLabelText('Grid Columns')).toHaveValue(3)
      })
    })
  })

  describe('nav item editing', () => {
    it('updates nav item label when edited', async () => {
      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      const labelInputs = screen.getAllByPlaceholderText('Label')
      await user.clear(labelInputs[0])
      await user.type(labelInputs[0], 'New Home')

      expect(labelInputs[0]).toHaveValue('New Home')
    })

    it('updates nav item href when edited', async () => {
      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      const urlInputs = screen.getAllByPlaceholderText('URL')
      await user.clear(urlInputs[0])
      await user.type(urlInputs[0], '/new-home')

      expect(urlInputs[0]).toHaveValue('/new-home')
    })
  })

  describe('checkbox toggling', () => {
    it('can toggle show header off', async () => {
      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      const checkbox = screen.getByLabelText('Show Header')
      expect(checkbox).toBeChecked()
      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('can change color scheme', async () => {
      const user = userEvent.setup()
      render(<LayoutSettingsPage />)

      const select = screen.getByLabelText('Color Scheme')
      await user.selectOptions(select, 'dark')
      expect(select).toHaveValue('dark')
    })
  })

  describe('no settings loaded', () => {
    it('renders empty form when no settings exist', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        layoutSettings: null,
      })

      render(<LayoutSettingsPage />)
      expect(screen.getByText('Layout Settings')).toBeInTheDocument()
    })
  })
})
