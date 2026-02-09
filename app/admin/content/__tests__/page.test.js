import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
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

import ContentEditorPage from '../page'

const mockPages = [
  { _id: 'page1', title: 'Home', description: 'Home page', body: 'Welcome to our site', metadata: {} },
  { _id: 'page2', title: 'About', description: 'About page', body: 'About us content', metadata: { featured: true } },
]

const defaultContentState = {
  pages: mockPages,
  currentPage: null,
  loading: false,
  refreshPages: jest.fn(),
  selectPage: jest.fn(),
  updatePage: jest.fn(),
}

describe('ContentEditorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseContent.mockReturnValue(defaultContentState)
  })

  describe('rendering', () => {
    it('renders the page heading', () => {
      render(<ContentEditorPage />)
      expect(screen.getByText('Content Editor')).toBeInTheDocument()
    })

    it('renders the page list with all pages', () => {
      render(<ContentEditorPage />)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
    })

    it('calls refreshPages on mount', () => {
      render(<ContentEditorPage />)
      expect(defaultContentState.refreshPages).toHaveBeenCalled()
    })

    it('shows loading indicator when loading', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        loading: true,
      })

      render(<ContentEditorPage />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('shows empty state when no pages exist', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        pages: [],
      })

      render(<ContentEditorPage />)
      expect(screen.getByText(/no pages found/i)).toBeInTheDocument()
    })
  })

  describe('page selection', () => {
    it('calls selectPage when a page is clicked', async () => {
      const user = userEvent.setup()
      render(<ContentEditorPage />)

      await user.click(screen.getByText('Home'))

      expect(defaultContentState.selectPage).toHaveBeenCalledWith('page1')
    })

    it('displays the edit form when a page is selected', () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPages[0],
      })

      render(<ContentEditorPage />)

      expect(screen.getByLabelText('Title')).toHaveValue('Home')
      expect(screen.getByLabelText('Description')).toHaveValue('Home page')
      expect(screen.getByLabelText('Body')).toHaveValue('Welcome to our site')
    })

    it('shows no form when no page is selected', () => {
      render(<ContentEditorPage />)
      expect(screen.queryByLabelText('Title')).not.toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('calls updatePage with form data on save', async () => {
      const mockUpdatePage = jest.fn().mockResolvedValue()
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPages[0],
        updatePage: mockUpdatePage,
      })

      const user = userEvent.setup()
      render(<ContentEditorPage />)

      const titleInput = screen.getByLabelText('Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Home')

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockUpdatePage).toHaveBeenCalledWith('page1', expect.objectContaining({
          title: 'Updated Home',
          description: 'Home page',
          body: 'Welcome to our site',
        }))
      })
    })

    it('shows success toast after successful save', async () => {
      const mockUpdatePage = jest.fn().mockResolvedValue()
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPages[0],
        updatePage: mockUpdatePage,
      })

      const user = userEvent.setup()
      render(<ContentEditorPage />)

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Page updated successfully')
      })
    })

    it('shows error toast when save fails', async () => {
      const mockUpdatePage = jest.fn().mockRejectedValue(new Error('Save failed'))
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPages[0],
        updatePage: mockUpdatePage,
      })

      const user = userEvent.setup()
      render(<ContentEditorPage />)

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update page')
      })
    })
  })

  describe('form validation', () => {
    it('shows error when title is empty', async () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPages[0],
      })

      const user = userEvent.setup()
      render(<ContentEditorPage />)

      const titleInput = screen.getByLabelText('Title')
      await user.clear(titleInput)

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
    })

    it('shows error when description is empty', async () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPages[0],
      })

      const user = userEvent.setup()
      render(<ContentEditorPage />)

      const descInput = screen.getByLabelText('Description')
      await user.clear(descInput)

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText('Description is required')).toBeInTheDocument()
      })
    })
  })

  describe('cancel button', () => {
    it('resets form to original values when cancel is clicked', async () => {
      mockUseContent.mockReturnValue({
        ...defaultContentState,
        currentPage: mockPages[0],
      })

      const user = userEvent.setup()
      render(<ContentEditorPage />)

      const titleInput = screen.getByLabelText('Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Changed Title')

      expect(titleInput).toHaveValue('Changed Title')

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      await waitFor(() => {
        expect(screen.getByLabelText('Title')).toHaveValue('Home')
      })
    })
  })
})
