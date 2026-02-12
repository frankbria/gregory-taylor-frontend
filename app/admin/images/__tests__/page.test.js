import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'react-hot-toast'

const mockUseContent = jest.fn()
jest.mock('@/lib/ContentContext', () => ({
  useContent: () => mockUseContent(),
}))

const mockGetPhotos = jest.fn()
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: () => ({
    getPhotos: mockGetPhotos,
  }),
}))

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock ImageSettingsForm to avoid testing its internals here
const mockOnSave = jest.fn()
const mockOnClose = jest.fn()
jest.mock('@/components/admin/ImageSettingsForm', () => {
  const MockForm = ({ photo, currentSettings, onSave, onClose }) => (
    <div data-testid="image-settings-form">
      <span data-testid="form-photo-id">{photo?._id}</span>
      <button onClick={() => onSave(photo?._id, { quality: 90, sharpen: 0, blur: 0, format: 'auto' })}>
        Mock Save
      </button>
      <button onClick={onClose}>Mock Close</button>
    </div>
  )
  MockForm.displayName = 'MockImageSettingsForm'
  return MockForm
})

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
  getPhotoSettings: jest.fn().mockResolvedValue({ quality: 80, sharpen: 0, blur: 0, format: 'auto' }),
  updatePhotoSettings: jest.fn().mockResolvedValue(),
}

const mockPhotos = [
  {
    _id: 'photo1',
    src: 'https://res.cloudinary.com/test-cloud/image/upload/v1/photos/photo1.jpg',
    title: 'Sunset Beach',
  },
  {
    _id: 'photo2',
    src: 'https://res.cloudinary.com/test-cloud/image/upload/v1/photos/photo2.jpg',
    title: 'Mountain View',
  },
  {
    _id: 'photo3',
    src: 'https://res.cloudinary.com/test-cloud/image/upload/v1/photos/photo3.jpg',
    title: 'City Lights',
  },
]

describe('ImageSettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseContent.mockReturnValue(defaultContentState)
    mockGetPhotos.mockResolvedValue(mockPhotos)
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

      await user.click(screen.getByRole('button', { name: /^save$/i }))

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

      await user.click(screen.getByRole('button', { name: /^save$/i }))

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

      await user.click(screen.getByRole('button', { name: /^save$/i }))

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

      await user.click(screen.getByRole('button', { name: /^save$/i }))

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

      await user.click(screen.getByRole('button', { name: /^save$/i }))

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

      await user.click(screen.getByRole('button', { name: /^save$/i }))

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

      await user.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => {
        expect(screen.getByText('Height must be greater than 0')).toBeInTheDocument()
      })
    })
  })

  describe('photo gallery', () => {
    it('fetches photos on mount', async () => {
      render(<ImageSettingsPage />)

      await waitFor(() => {
        expect(mockGetPhotos).toHaveBeenCalled()
      })
    })

    it('renders photo grid with photos', async () => {
      render(<ImageSettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sunset Beach')).toBeInTheDocument()
        expect(screen.getByText('Mountain View')).toBeInTheDocument()
        expect(screen.getByText('City Lights')).toBeInTheDocument()
      })
    })

    it('renders an Edit Settings button for each photo', async () => {
      render(<ImageSettingsPage />)

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /edit settings/i })
        expect(editButtons).toHaveLength(3)
      })
    })

    it('shows photo gallery heading', async () => {
      render(<ImageSettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Photo Gallery')).toBeInTheDocument()
      })
    })

    it('shows loading skeleton while fetching photos', () => {
      mockGetPhotos.mockReturnValue(new Promise(() => {})) // never resolves
      render(<ImageSettingsPage />)

      expect(screen.getByTestId('photo-gallery-loading')).toBeInTheDocument()
    })

    it('shows empty state when no photos are returned', async () => {
      mockGetPhotos.mockResolvedValue([])
      render(<ImageSettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('No photos found')).toBeInTheDocument()
      })
    })

    it('shows empty state when getPhotos fails', async () => {
      mockGetPhotos.mockRejectedValue(new Error('Network error'))
      render(<ImageSettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('No photos found')).toBeInTheDocument()
      })
    })
  })

  describe('photo settings modal', () => {
    it('opens modal with ImageSettingsForm when Edit Settings is clicked', async () => {
      const user = userEvent.setup()
      render(<ImageSettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sunset Beach')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit settings/i })
      await user.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByTestId('image-settings-form')).toBeInTheDocument()
      })
    })

    it('passes correct photo id to ImageSettingsForm', async () => {
      const user = userEvent.setup()
      render(<ImageSettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sunset Beach')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit settings/i })
      await user.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByTestId('form-photo-id')).toHaveTextContent('photo1')
      })
    })

    it('fetches photo settings when modal opens', async () => {
      const mockGetPhotoSettings = jest.fn().mockResolvedValue({ quality: 85, sharpen: 0, blur: 0, format: 'auto' })
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        getPhotoSettings: mockGetPhotoSettings,
      })

      const user = userEvent.setup()
      render(<ImageSettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sunset Beach')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit settings/i })
      await user.click(editButtons[0])

      await waitFor(() => {
        expect(mockGetPhotoSettings).toHaveBeenCalledWith('photo1')
      })
    })

    it('closes modal when close callback is triggered', async () => {
      const user = userEvent.setup()
      render(<ImageSettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sunset Beach')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit settings/i })
      await user.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByTestId('image-settings-form')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /mock close/i }))

      await waitFor(() => {
        expect(screen.queryByTestId('image-settings-form')).not.toBeInTheDocument()
      })
    })

    it('calls updatePhotoSettings via onSave', async () => {
      const mockUpdatePhotoSettings = jest.fn().mockResolvedValue()
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        updatePhotoSettings: mockUpdatePhotoSettings,
      })

      const user = userEvent.setup()
      render(<ImageSettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sunset Beach')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit settings/i })
      await user.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByTestId('image-settings-form')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /mock save/i }))

      await waitFor(() => {
        expect(mockUpdatePhotoSettings).toHaveBeenCalledWith(
          'photo1',
          { quality: 90, sharpen: 0, blur: 0, format: 'auto' }
        )
      })
    })
  })
})
