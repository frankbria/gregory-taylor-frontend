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

import ImageSettingsPage from '../page'

const mockImageSettings = {
  defaultQuality: 85,
  thumbnailWidth: 300,
  thumbnailHeight: 200,
  enableLazyLoading: true,
  optimizationLevel: 'medium',
}

const defaultContentState = {
  imageSettings: mockImageSettings,
  loading: false,
  refreshImageSettings: jest.fn(),
  updateImageSettings: jest.fn(),
}

describe('ImageSettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseContent.mockReturnValue(defaultContentState)
  })

  describe('rendering', () => {
    it('renders the page heading', () => {
      render(<ImageSettingsPage />)
      expect(screen.getByText('Image Settings')).toBeInTheDocument()
    })

    it('calls refreshImageSettings on mount', () => {
      render(<ImageSettingsPage />)
      expect(defaultContentState.refreshImageSettings).toHaveBeenCalled()
    })

    it('renders form with current settings', () => {
      render(<ImageSettingsPage />)

      expect(screen.getByLabelText('Default Quality')).toHaveValue(85)
      expect(screen.getByLabelText('Thumbnail Width')).toHaveValue(300)
      expect(screen.getByLabelText('Thumbnail Height')).toHaveValue(200)
      expect(screen.getByLabelText('Enable Lazy Loading')).toBeChecked()
      expect(screen.getByLabelText('Optimization Level')).toHaveValue('medium')
    })

    it('shows loading indicator when loading', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        loading: true,
      })

      render(<ImageSettingsPage />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders form with defaults when no settings loaded yet', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        imageSettings: null,
      })

      render(<ImageSettingsPage />)
      expect(screen.getByLabelText('Default Quality')).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('calls updateImageSettings with form data on save', async () => {
      const mockUpdate = jest.fn().mockResolvedValue()
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        updateImageSettings: mockUpdate,
      })

      const user = userEvent.setup()
      render(<ImageSettingsPage />)

      const qualityInput = screen.getByLabelText('Default Quality')
      await user.clear(qualityInput)
      await user.type(qualityInput, '90')

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
          defaultQuality: 90,
          thumbnailWidth: 300,
          thumbnailHeight: 200,
          enableLazyLoading: true,
          optimizationLevel: 'medium',
        }))
      })
    })

    it('shows success toast after successful save', async () => {
      const mockUpdate = jest.fn().mockResolvedValue()
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        updateImageSettings: mockUpdate,
      })

      const user = userEvent.setup()
      render(<ImageSettingsPage />)

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Image settings saved')
      })
    })

    it('shows error toast when save fails', async () => {
      const mockUpdate = jest.fn().mockRejectedValue(new Error('Save failed'))
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        updateImageSettings: mockUpdate,
      })

      const user = userEvent.setup()
      render(<ImageSettingsPage />)

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save image settings')
      })
    })
  })

  describe('validation', () => {
    it('shows error when quality is below 1', async () => {
      const user = userEvent.setup()
      render(<ImageSettingsPage />)

      const qualityInput = screen.getByLabelText('Default Quality')
      await user.clear(qualityInput)
      await user.type(qualityInput, '0')

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText('Quality must be between 1 and 100')).toBeInTheDocument()
      })
    })

    it('shows error when quality is above 100', async () => {
      const user = userEvent.setup()
      render(<ImageSettingsPage />)

      const qualityInput = screen.getByLabelText('Default Quality')
      await user.clear(qualityInput)
      await user.type(qualityInput, '101')

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText('Quality must be between 1 and 100')).toBeInTheDocument()
      })
    })

    it('shows error when thumbnail width is 0 or negative', async () => {
      const user = userEvent.setup()
      render(<ImageSettingsPage />)

      const widthInput = screen.getByLabelText('Thumbnail Width')
      await user.clear(widthInput)
      await user.type(widthInput, '0')

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText('Width must be greater than 0')).toBeInTheDocument()
      })
    })

    it('shows error when thumbnail height is 0 or negative', async () => {
      const user = userEvent.setup()
      render(<ImageSettingsPage />)

      const heightInput = screen.getByLabelText('Thumbnail Height')
      await user.clear(heightInput)
      await user.type(heightInput, '0')

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText('Height must be greater than 0')).toBeInTheDocument()
      })
    })
  })
})
