import { render, screen, waitFor } from '@testing-library/react'

// Mock the fetch API
beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => {
  jest.restoreAllMocks()
})

import EditableContent from '../EditableContent'

describe('EditableContent', () => {
  test('renders children as fallback when no managed content', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 })

    render(
      <EditableContent pageId="home" sectionId="hero">
        <p>Fallback content</p>
      </EditableContent>
    )

    await waitFor(() => {
      expect(screen.getByText('Fallback content')).toBeInTheDocument()
    })
  })

  test('renders managed content when API returns data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sections: [
          { sectionId: 'hero', content: '<p>Managed content from API</p>' }
        ]
      })
    })

    render(
      <EditableContent pageId="home" sectionId="hero">
        <p>Fallback content</p>
      </EditableContent>
    )

    await waitFor(() => {
      expect(screen.getByText('Managed content from API')).toBeInTheDocument()
    })
  })

  test('shows loading state initially', () => {
    global.fetch.mockReturnValue(new Promise(() => {})) // Never resolves

    render(
      <EditableContent pageId="home" sectionId="hero">
        <p>Fallback</p>
      </EditableContent>
    )

    expect(screen.getByTestId('editable-content-loading')).toBeInTheDocument()
  })

  test('falls back to children on network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    render(
      <EditableContent pageId="home" sectionId="hero">
        <p>Fallback on error</p>
      </EditableContent>
    )

    await waitFor(() => {
      expect(screen.getByText('Fallback on error')).toBeInTheDocument()
    })
  })

  test('renders children when API returns no matching section', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sections: [
          { sectionId: 'other-section', content: '<p>Wrong section</p>' }
        ]
      })
    })

    render(
      <EditableContent pageId="home" sectionId="hero">
        <p>Children shown</p>
      </EditableContent>
    )

    await waitFor(() => {
      expect(screen.getByText('Children shown')).toBeInTheDocument()
    })
  })

  test('renders children when pageId is not provided', () => {
    render(
      <EditableContent sectionId="hero">
        <p>No pageId fallback</p>
      </EditableContent>
    )

    expect(screen.getByText('No pageId fallback')).toBeInTheDocument()
  })
})
