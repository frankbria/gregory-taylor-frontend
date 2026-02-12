import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockUseLayout = jest.fn()

jest.mock('@/lib/LayoutContext', () => ({
  useLayout: () => mockUseLayout(),
}))

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const { toast } = require('react-hot-toast')

import LayoutEditorToolbar from '../LayoutEditorToolbar'

const mockResetAll = jest.fn()
const mockLoadStyles = jest.fn()
const mockIsDirty = jest.fn()

describe('LayoutEditorToolbar', () => {
  let originalOpen
  let originalCreateObjectURL
  let originalRevokeObjectURL

  beforeEach(() => {
    jest.clearAllMocks()
    mockIsDirty.mockReturnValue(false)
    mockUseLayout.mockReturnValue({
      componentStyles: { header: ['p-4', 'bg-white'] },
      resetAll: mockResetAll,
      loadStyles: mockLoadStyles,
      isDirty: mockIsDirty,
    })

    originalOpen = window.open
    window.open = jest.fn()

    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    window.open = originalOpen
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  it('renders Save, Revert, Preview, Export, Import buttons', () => {
    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /revert/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
    // Import is a label wrapping a file input
    expect(screen.getByText(/import/i)).toBeInTheDocument()
  })

  it('Save button calls onSave prop', async () => {
    const user = userEvent.setup()
    const mockOnSave = jest.fn()
    render(<LayoutEditorToolbar onSave={mockOnSave} saving={false} />)

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(mockOnSave).toHaveBeenCalledTimes(1)
  })

  it('Save button shows "Saving..." when saving prop is true', () => {
    render(<LayoutEditorToolbar onSave={jest.fn()} saving={true} />)

    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('Revert button calls resetAll', async () => {
    const user = userEvent.setup()
    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    await user.click(screen.getByRole('button', { name: /revert/i }))

    expect(mockResetAll).toHaveBeenCalledTimes(1)
  })

  it('Preview button opens "/" in new tab', async () => {
    const user = userEvent.setup()
    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    await user.click(screen.getByRole('button', { name: /preview/i }))

    expect(window.open).toHaveBeenCalledWith('/', '_blank')
  })

  it('Dirty indicator shown when isDirty returns true', () => {
    mockIsDirty.mockReturnValue(true)
    mockUseLayout.mockReturnValue({
      componentStyles: { header: ['p-4', 'bg-white'] },
      resetAll: mockResetAll,
      loadStyles: mockLoadStyles,
      isDirty: mockIsDirty,
    })

    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    expect(screen.getByTestId('dirty-indicator')).toBeInTheDocument()
  })

  it('Dirty indicator hidden when clean', () => {
    mockIsDirty.mockReturnValue(false)

    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    expect(screen.queryByTestId('dirty-indicator')).not.toBeInTheDocument()
  })

  it('Export downloads JSON file', async () => {
    const user = userEvent.setup()

    // Mock document.createElement to capture the anchor
    const clickFn = jest.fn()
    const originalCreateElement = document.createElement.bind(document)
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        el.click = clickFn
      }
      return el
    })

    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    await user.click(screen.getByRole('button', { name: /export/i }))

    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(clickFn).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalled()

    document.createElement.mockRestore()
  })

  it('Import reads uploaded file and calls loadStyles with success toast', async () => {
    const user = userEvent.setup()
    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    const fileInput = screen.getByTestId('import-file-input')
    const fileContent = JSON.stringify({ header: ['flex', 'p-2'] })
    const file = new File([fileContent], 'styles.json', { type: 'application/json' })

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(mockLoadStyles).toHaveBeenCalledWith({ header: ['flex', 'p-2'] })
      expect(toast.success).toHaveBeenCalledWith('Styles imported successfully')
    })
  })

  it('Import rejects file exceeding size limit', async () => {
    const user = userEvent.setup()
    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    const fileInput = screen.getByTestId('import-file-input')
    const largeContent = 'x'.repeat(1024 * 1024 + 1)
    const file = new File([largeContent], 'big.json', { type: 'application/json' })

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Import file too large (max 1 MB)')
      expect(mockLoadStyles).not.toHaveBeenCalled()
    })
  })

  it('Import rejects non-object JSON (array)', async () => {
    const user = userEvent.setup()
    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    const fileInput = screen.getByTestId('import-file-input')
    const file = new File(['[1,2,3]'], 'array.json', { type: 'application/json' })

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid style file format')
      expect(mockLoadStyles).not.toHaveBeenCalled()
    })
  })

  it('Import rejects object with non-string-array values', async () => {
    const user = userEvent.setup()
    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    const fileInput = screen.getByTestId('import-file-input')
    const file = new File([JSON.stringify({ header: 'not-an-array' })], 'bad.json', { type: 'application/json' })

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid style file format')
      expect(mockLoadStyles).not.toHaveBeenCalled()
    })
  })

  it('Import rejects invalid JSON with error toast', async () => {
    const user = userEvent.setup()
    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    const fileInput = screen.getByTestId('import-file-input')
    const file = new File(['not-json{{{'], 'broken.json', { type: 'application/json' })

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to parse import file')
      expect(mockLoadStyles).not.toHaveBeenCalled()
    })
  })

  it('registers beforeunload listener when dirty', () => {
    const addSpy = jest.spyOn(window, 'addEventListener')
    mockIsDirty.mockReturnValue(true)
    mockUseLayout.mockReturnValue({
      componentStyles: { header: ['p-4'] },
      resetAll: mockResetAll,
      loadStyles: mockLoadStyles,
      isDirty: mockIsDirty,
    })

    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
    addSpy.mockRestore()
  })

  it('removes beforeunload listener when clean', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener')
    mockIsDirty.mockReturnValue(false)

    render(<LayoutEditorToolbar onSave={jest.fn()} saving={false} />)

    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
    removeSpy.mockRestore()
  })
})
