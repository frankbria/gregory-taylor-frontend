import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'react-hot-toast'

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock CloudinaryPreview to inspect props passed to it
const mockPreviewProps = jest.fn()
jest.mock('../CloudinaryPreview', () => {
  const MockPreview = (props) => {
    mockPreviewProps(props)
    return (
      <div data-testid="cloudinary-preview">
        <span data-testid="preview-settings">
          {JSON.stringify(props.previewSettings)}
        </span>
        <span data-testid="current-settings">
          {JSON.stringify(props.currentSettings)}
        </span>
      </div>
    )
  }
  MockPreview.displayName = 'MockCloudinaryPreview'
  return MockPreview
})

import ImageSettingsForm from '../ImageSettingsForm'

beforeAll(() => {
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud'
})

const defaultPhoto = {
  _id: 'photo123',
  src: 'https://res.cloudinary.com/test-cloud/image/upload/v1234/photos/test.jpg',
  title: 'Test Photo',
}

const defaultCurrentSettings = {
  quality: 80,
  sharpen: 0,
  blur: 0,
  format: 'auto',
}

const defaultProps = {
  photo: defaultPhoto,
  currentSettings: defaultCurrentSettings,
  onSave: jest.fn().mockResolvedValue(),
  onClose: jest.fn(),
}

describe('ImageSettingsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    defaultProps.onSave = jest.fn().mockResolvedValue()
    defaultProps.onClose = jest.fn()
  })

  describe('rendering form fields', () => {
    test('renders Quality slider with label', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      expect(screen.getByLabelText(/quality/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/quality/i)).toHaveAttribute('type', 'range')
    })

    test('renders Sharpen slider with label', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      expect(screen.getByLabelText(/sharpen/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/sharpen/i)).toHaveAttribute('type', 'range')
    })

    test('renders Blur slider with label', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      expect(screen.getByLabelText(/blur/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/blur/i)).toHaveAttribute('type', 'range')
    })

    test('renders Format select dropdown with label', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      const select = screen.getByLabelText(/format/i)
      expect(select).toBeInTheDocument()
      expect(select.tagName).toBe('SELECT')
    })

    test('renders format options: auto, webp, jpg, png, avif', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      const select = screen.getByLabelText(/format/i)
      const options = Array.from(select.options).map((o) => o.value)
      expect(options).toEqual(['auto', 'webp', 'jpg', 'png', 'avif'])
    })

    test('renders Save button', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })

    test('renders Cancel button', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    test('renders Reset to Defaults button', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      expect(screen.getByRole('button', { name: /reset to defaults/i })).toBeInTheDocument()
    })
  })

  describe('displays currentSettings as defaults', () => {
    test('quality slider shows current quality value', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      expect(screen.getByLabelText(/quality/i)).toHaveValue('80')
    })

    test('sharpen slider shows current sharpen value', () => {
      render(
        <ImageSettingsForm
          {...defaultProps}
          currentSettings={{ ...defaultCurrentSettings, sharpen: 150 }}
        />
      )
      expect(screen.getByLabelText(/sharpen/i)).toHaveValue('150')
    })

    test('blur slider shows current blur value', () => {
      render(
        <ImageSettingsForm
          {...defaultProps}
          currentSettings={{ ...defaultCurrentSettings, blur: 500 }}
        />
      )
      expect(screen.getByLabelText(/blur/i)).toHaveValue('500')
    })

    test('format dropdown shows current format', () => {
      render(
        <ImageSettingsForm
          {...defaultProps}
          currentSettings={{ ...defaultCurrentSettings, format: 'webp' }}
        />
      )
      expect(screen.getByLabelText(/format/i)).toHaveValue('webp')
    })

    test('displays current numeric values next to sliders', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      // Quality value of 80 should be displayed as text
      expect(screen.getByText('80')).toBeInTheDocument()
    })
  })

  describe('slider changes update preview', () => {
    test('changing quality slider updates preview settings', () => {
      render(<ImageSettingsForm {...defaultProps} />)

      const qualitySlider = screen.getByLabelText(/quality/i)
      fireEvent.change(qualitySlider, { target: { value: '95' } })

      const previewText = screen.getByTestId('preview-settings').textContent
      const previewSettings = JSON.parse(previewText)
      expect(previewSettings.quality).toBe(95)
    })

    test('changing sharpen slider updates preview settings', () => {
      render(<ImageSettingsForm {...defaultProps} />)

      const sharpenSlider = screen.getByLabelText(/sharpen/i)
      fireEvent.change(sharpenSlider, { target: { value: '200' } })

      const previewText = screen.getByTestId('preview-settings').textContent
      const previewSettings = JSON.parse(previewText)
      expect(previewSettings.sharpen).toBe(200)
    })

    test('changing blur slider updates preview settings', () => {
      render(<ImageSettingsForm {...defaultProps} />)

      const blurSlider = screen.getByLabelText(/blur/i)
      fireEvent.change(blurSlider, { target: { value: '1000' } })

      const previewText = screen.getByTestId('preview-settings').textContent
      const previewSettings = JSON.parse(previewText)
      expect(previewSettings.blur).toBe(1000)
    })

    test('changing format dropdown updates preview settings', async () => {
      const user = userEvent.setup()
      render(<ImageSettingsForm {...defaultProps} />)

      await user.selectOptions(screen.getByLabelText(/format/i), 'png')

      const previewText = screen.getByTestId('preview-settings').textContent
      const previewSettings = JSON.parse(previewText)
      expect(previewSettings.format).toBe('png')
    })

    test('passes currentSettings to CloudinaryPreview', () => {
      render(<ImageSettingsForm {...defaultProps} />)

      const currentText = screen.getByTestId('current-settings').textContent
      const currentSettings = JSON.parse(currentText)
      expect(currentSettings).toEqual(defaultCurrentSettings)
    })

    test('passes photo src to CloudinaryPreview', () => {
      render(<ImageSettingsForm {...defaultProps} />)

      expect(mockPreviewProps).toHaveBeenCalledWith(
        expect.objectContaining({ src: defaultPhoto.src })
      )
    })
  })

  describe('save functionality', () => {
    test('save calls onSave with photoId and form settings', async () => {
      const user = userEvent.setup()
      render(<ImageSettingsForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith('photo123', {
          quality: 80,
          sharpen: 0,
          blur: 0,
          format: 'auto',
        })
      })
    })

    test('save with modified values calls onSave with updated settings', async () => {
      const user = userEvent.setup()
      render(<ImageSettingsForm {...defaultProps} />)

      const qualitySlider = screen.getByLabelText(/quality/i)
      fireEvent.change(qualitySlider, { target: { value: '95' } })

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith('photo123', {
          quality: 95,
          sharpen: 0,
          blur: 0,
          format: 'auto',
        })
      })
    })

    test('shows success toast after successful save', async () => {
      const user = userEvent.setup()
      render(<ImageSettingsForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Image settings saved')
      })
    })

    test('shows error toast when save fails', async () => {
      const failingOnSave = jest.fn().mockRejectedValue(new Error('Network error'))
      const user = userEvent.setup()
      render(<ImageSettingsForm {...defaultProps} onSave={failingOnSave} />)

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save image settings')
      })
    })

    test('save button shows "Saving..." while submitting', async () => {
      // Make onSave hang to see the submitting state
      let resolvePromise
      const slowOnSave = jest.fn(
        () => new Promise((resolve) => { resolvePromise = resolve })
      )
      const user = userEvent.setup()
      render(<ImageSettingsForm {...defaultProps} onSave={slowOnSave} />)

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
      })

      resolvePromise()
    })
  })

  describe('reset to defaults', () => {
    test('reset button restores quality to auto (default)', async () => {
      const user = userEvent.setup()
      render(
        <ImageSettingsForm
          {...defaultProps}
          currentSettings={{ quality: 50, sharpen: 200, blur: 500, format: 'png' }}
        />
      )

      // Verify starting values
      expect(screen.getByLabelText(/quality/i)).toHaveValue('50')

      await user.click(screen.getByRole('button', { name: /reset to defaults/i }))

      // After reset, the preview settings should reflect the global defaults
      const previewText = screen.getByTestId('preview-settings').textContent
      const previewSettings = JSON.parse(previewText)
      expect(previewSettings.sharpen).toBe(0)
      expect(previewSettings.blur).toBe(0)
      expect(previewSettings.format).toBe('auto')
    })

    test('reset button restores sharpen to 0', async () => {
      const user = userEvent.setup()
      render(
        <ImageSettingsForm
          {...defaultProps}
          currentSettings={{ quality: 80, sharpen: 300, blur: 0, format: 'auto' }}
        />
      )

      expect(screen.getByLabelText(/sharpen/i)).toHaveValue('300')

      await user.click(screen.getByRole('button', { name: /reset to defaults/i }))

      expect(screen.getByLabelText(/sharpen/i)).toHaveValue('0')
    })

    test('reset button restores blur to 0', async () => {
      const user = userEvent.setup()
      render(
        <ImageSettingsForm
          {...defaultProps}
          currentSettings={{ quality: 80, sharpen: 0, blur: 1500, format: 'auto' }}
        />
      )

      expect(screen.getByLabelText(/blur/i)).toHaveValue('1500')

      await user.click(screen.getByRole('button', { name: /reset to defaults/i }))

      expect(screen.getByLabelText(/blur/i)).toHaveValue('0')
    })

    test('reset button restores format to auto', async () => {
      const user = userEvent.setup()
      render(
        <ImageSettingsForm
          {...defaultProps}
          currentSettings={{ quality: 80, sharpen: 0, blur: 0, format: 'png' }}
        />
      )

      expect(screen.getByLabelText(/format/i)).toHaveValue('png')

      await user.click(screen.getByRole('button', { name: /reset to defaults/i }))

      expect(screen.getByLabelText(/format/i)).toHaveValue('auto')
    })
  })

  describe('cancel functionality', () => {
    test('cancel button calls onClose', async () => {
      const user = userEvent.setup()
      render(<ImageSettingsForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('handles null/undefined currentSettings', () => {
    test('renders with null currentSettings using defaults', () => {
      render(<ImageSettingsForm {...defaultProps} currentSettings={null} />)

      expect(screen.getByLabelText(/quality/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/sharpen/i)).toHaveValue('0')
      expect(screen.getByLabelText(/blur/i)).toHaveValue('0')
      expect(screen.getByLabelText(/format/i)).toHaveValue('auto')
    })

    test('renders with undefined currentSettings using defaults', () => {
      render(<ImageSettingsForm {...defaultProps} currentSettings={undefined} />)

      expect(screen.getByLabelText(/quality/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/sharpen/i)).toHaveValue('0')
      expect(screen.getByLabelText(/blur/i)).toHaveValue('0')
      expect(screen.getByLabelText(/format/i)).toHaveValue('auto')
    })
  })

  describe('range input constraints', () => {
    test('quality slider has min=1 and max=100', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      const slider = screen.getByLabelText(/quality/i)
      expect(slider).toHaveAttribute('min', '1')
      expect(slider).toHaveAttribute('max', '100')
    })

    test('sharpen slider has min=0 and max=400', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      const slider = screen.getByLabelText(/sharpen/i)
      expect(slider).toHaveAttribute('min', '0')
      expect(slider).toHaveAttribute('max', '400')
    })

    test('blur slider has min=0 and max=2000', () => {
      render(<ImageSettingsForm {...defaultProps} />)
      const slider = screen.getByLabelText(/blur/i)
      expect(slider).toHaveAttribute('min', '0')
      expect(slider).toHaveAttribute('max', '2000')
    })
  })
})
