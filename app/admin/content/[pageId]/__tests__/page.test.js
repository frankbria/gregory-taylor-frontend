import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'react-hot-toast'

// Mock next/navigation
const mockPageId = 'page1'
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ pageId: mockPageId })),
}))

// Mock next/link
jest.mock('next/link', () => {
  function MockLink({ children, href, className }) {
    return <a href={href} className={className}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock ContentContext
const mockUseContent = jest.fn()
jest.mock('@/lib/ContentContext', () => ({
  useContent: () => mockUseContent(),
}))

// Mock TipTapEditor
jest.mock('@/components/TipTapEditor', () => {
  return function MockTipTapEditor({ content, onChange, editable }) {
    return (
      <div data-testid="tiptap-editor" data-editable={editable}>
        <textarea
          data-testid="tiptap-textarea"
          value={content}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
      </div>
    )
  }
})

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

import PageEditorPage from '../page'

const mockPage = {
  _id: 'page1',
  title: 'Home',
  description: 'Home page description',
  body: '<p>Welcome to our site</p>',
  metadata: { featured: true },
}

const defaultContentState = {
  currentPage: null,
  loading: false,
  selectPage: jest.fn(),
  updatePage: jest.fn(),
}

describe('PageEditorPage ([pageId])', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseContent.mockReturnValue(defaultContentState)
  })

  describe('loading and fetching', () => {
    it('calls selectPage with pageId on mount', () => {
      render(<PageEditorPage />)
      expect(defaultContentState.selectPage).toHaveBeenCalledWith('page1')
    })

    it('shows loading state while fetching page data', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        loading: true,
      })

      render(<PageEditorPage />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('shows placeholder when page is not yet loaded', () => {
      render(<PageEditorPage />)
      expect(screen.getByText(/loading page/i)).toBeInTheDocument()
    })
  })

  describe('rendering with page data', () => {
    it('renders breadcrumb with page title', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPage,
      })

      render(<PageEditorPage />)
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
    })

    it('renders back link to /admin/content', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPage,
      })

      render(<PageEditorPage />)
      const backLink = screen.getByRole('link', { name: /content/i })
      expect(backLink).toHaveAttribute('href', '/admin/content')
    })

    it('renders title input with page title', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPage,
      })

      render(<PageEditorPage />)
      expect(screen.getByLabelText('Title')).toHaveValue('Home')
    })

    it('renders description input with page description', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPage,
      })

      render(<PageEditorPage />)
      expect(screen.getByLabelText('Description')).toHaveValue('Home page description')
    })

    it('renders TipTapEditor with page body content', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPage,
      })

      render(<PageEditorPage />)
      expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument()
      expect(screen.getByTestId('tiptap-textarea')).toHaveValue('<p>Welcome to our site</p>')
    })
  })

  describe('save functionality', () => {
    it('calls updatePage with form data on save', async () => {
      const mockUpdatePage = jest.fn().mockResolvedValue()
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPage,
        updatePage: mockUpdatePage,
      })

      const user = userEvent.setup()
      render(<PageEditorPage />)

      const titleInput = screen.getByLabelText('Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Home')

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockUpdatePage).toHaveBeenCalledWith('page1', expect.objectContaining({
          title: 'Updated Home',
        }))
      })
    })

    it('shows success toast after successful save', async () => {
      const mockUpdatePage = jest.fn().mockResolvedValue()
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPage,
        updatePage: mockUpdatePage,
      })

      const user = userEvent.setup()
      render(<PageEditorPage />)

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Page updated successfully')
      })
    })

    it('shows error toast when save fails', async () => {
      const mockUpdatePage = jest.fn().mockRejectedValue(new Error('Save failed'))
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPage,
        updatePage: mockUpdatePage,
      })

      const user = userEvent.setup()
      render(<PageEditorPage />)

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update page')
      })
    })
  })
})
