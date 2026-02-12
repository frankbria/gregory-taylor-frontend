import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock TipTap modules BEFORE imports
const mockEditor = {
  getHTML: jest.fn().mockReturnValue('<p>test content</p>'),
  chain: jest.fn().mockReturnValue({
    focus: jest.fn().mockReturnValue({
      toggleBold: jest.fn().mockReturnValue({ run: jest.fn() }),
      toggleItalic: jest.fn().mockReturnValue({ run: jest.fn() }),
      toggleHeading: jest.fn().mockReturnValue({ run: jest.fn() }),
      toggleBulletList: jest.fn().mockReturnValue({ run: jest.fn() }),
      toggleOrderedList: jest.fn().mockReturnValue({ run: jest.fn() }),
      toggleLink: jest.fn().mockReturnValue({ run: jest.fn() }),
      setLink: jest.fn().mockReturnValue({ run: jest.fn() }),
      unsetLink: jest.fn().mockReturnValue({ run: jest.fn() }),
    }),
  }),
  isActive: jest.fn().mockReturnValue(false),
  isEditable: true,
  on: jest.fn(),
  off: jest.fn(),
  commands: {
    setContent: jest.fn(),
  },
  setEditable: jest.fn(),
}

jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => mockEditor),
  EditorContent: jest.fn(({ editor }) => (
    <div data-testid="editor-content">{editor ? 'Editor loaded' : 'No editor'}</div>
  )),
}))

jest.mock('@tiptap/starter-kit', () => ({
  __esModule: true,
  default: { configure: jest.fn() },
}))

jest.mock('@tiptap/extension-link', () => ({
  __esModule: true,
  default: { configure: jest.fn() },
}))

import TipTapEditor from '../TipTapEditor'
import { useEditor } from '@tiptap/react'

describe('TipTapEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockEditor.isActive.mockReturnValue(false)
    useEditor.mockReturnValue(mockEditor)
  })

  it('renders editor with EditorContent', () => {
    render(<TipTapEditor />)
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    expect(screen.getByText('Editor loaded')).toBeInTheDocument()
  })

  it('renders toolbar with formatting buttons', () => {
    render(<TipTapEditor />)
    expect(screen.getByLabelText('Bold')).toBeInTheDocument()
    expect(screen.getByLabelText('Italic')).toBeInTheDocument()
    expect(screen.getByLabelText('Heading 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Heading 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Heading 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Bullet List')).toBeInTheDocument()
    expect(screen.getByLabelText('Ordered List')).toBeInTheDocument()
    expect(screen.getByLabelText('Link')).toBeInTheDocument()
  })

  it('calls toggleBold when Bold button clicked', () => {
    render(<TipTapEditor />)
    fireEvent.click(screen.getByLabelText('Bold'))
    expect(mockEditor.chain).toHaveBeenCalled()
  })

  it('calls toggleItalic when Italic button clicked', () => {
    render(<TipTapEditor />)
    fireEvent.click(screen.getByLabelText('Italic'))
    expect(mockEditor.chain).toHaveBeenCalled()
  })

  it('calls toggleHeading with level 1 when H1 clicked', () => {
    render(<TipTapEditor />)
    fireEvent.click(screen.getByLabelText('Heading 1'))
    expect(mockEditor.chain).toHaveBeenCalled()
  })

  it('calls toggleHeading with level 2 when H2 clicked', () => {
    render(<TipTapEditor />)
    fireEvent.click(screen.getByLabelText('Heading 2'))
    expect(mockEditor.chain).toHaveBeenCalled()
  })

  it('calls toggleHeading with level 3 when H3 clicked', () => {
    render(<TipTapEditor />)
    fireEvent.click(screen.getByLabelText('Heading 3'))
    expect(mockEditor.chain).toHaveBeenCalled()
  })

  it('calls toggleBulletList when bullet list button clicked', () => {
    render(<TipTapEditor />)
    fireEvent.click(screen.getByLabelText('Bullet List'))
    expect(mockEditor.chain).toHaveBeenCalled()
  })

  it('calls toggleOrderedList when ordered list button clicked', () => {
    render(<TipTapEditor />)
    fireEvent.click(screen.getByLabelText('Ordered List'))
    expect(mockEditor.chain).toHaveBeenCalled()
  })

  it('shows active state on buttons when formatting is active', () => {
    mockEditor.isActive.mockImplementation((type, attrs) => {
      if (type === 'bold') return true
      if (type === 'heading' && attrs?.level === 2) return true
      return false
    })

    render(<TipTapEditor />)

    const boldButton = screen.getByLabelText('Bold')
    const italicButton = screen.getByLabelText('Italic')
    const h2Button = screen.getByLabelText('Heading 2')

    expect(boldButton.className).toContain('bg-gray-800')
    expect(boldButton.className).toContain('text-white')
    expect(italicButton.className).not.toContain('bg-gray-800')
    expect(h2Button.className).toContain('bg-gray-800')
  })

  it('passes content to useEditor config', () => {
    render(<TipTapEditor content="<p>Hello world</p>" />)
    expect(useEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '<p>Hello world</p>',
      })
    )
  })

  it('does not render toolbar when editable is false', () => {
    render(<TipTapEditor editable={false} />)
    expect(screen.queryByLabelText('Bold')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Italic')).not.toBeInTheDocument()
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('returns null when editor is not ready', () => {
    useEditor.mockReturnValue(null)
    const { container } = render(<TipTapEditor />)
    expect(container.firstChild).toBeNull()
  })

  it('syncs content prop changes into editor via setContent', () => {
    mockEditor.getHTML.mockReturnValue('<p>old content</p>')

    const { rerender } = render(<TipTapEditor content="<p>old content</p>" />)

    // Simulate content prop change (e.g. async page load)
    rerender(<TipTapEditor content="<p>new content</p>" />)

    expect(mockEditor.commands.setContent).toHaveBeenCalledWith('<p>new content</p>', { emitUpdate: false })
  })

  it('does not call setContent when content matches editor HTML', () => {
    mockEditor.getHTML.mockReturnValue('<p>same content</p>')

    const { rerender } = render(<TipTapEditor content="<p>same content</p>" />)
    rerender(<TipTapEditor content="<p>same content</p>" />)

    expect(mockEditor.commands.setContent).not.toHaveBeenCalled()
  })

  it('syncs editable prop changes via setEditable', () => {
    mockEditor.isEditable = true

    const { rerender } = render(<TipTapEditor editable={true} />)

    mockEditor.isEditable = true
    rerender(<TipTapEditor editable={false} />)

    expect(mockEditor.setEditable).toHaveBeenCalledWith(false)
  })
})
