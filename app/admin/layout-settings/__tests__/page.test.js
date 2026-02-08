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

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
          showHeader: true,
          showFooter: true,
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

      await user.click(screen.getByRole('button', { name: /save/i }))

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

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update layout settings')
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
