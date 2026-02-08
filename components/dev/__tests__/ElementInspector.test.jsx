import { render, screen, fireEvent, act } from '@testing-library/react'
import ElementInspector from '@/components/dev/ElementInspector'
import InspectorToggle from '@/components/dev/InspectorToggle'
import { InspectorProvider } from '@/lib/InspectorContext'

// Mock createPortal to render inline for testing
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node,
}))

// Mock clipboard API
const mockWriteText = jest.fn().mockResolvedValue(undefined)
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
})

function renderWithInspector(ui) {
  return render(
    <InspectorProvider>
      {ui}
    </InspectorProvider>
  )
}

describe('ElementInspector', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    mockWriteText.mockClear()
  })

  describe('in production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('renders nothing in production', () => {
      const { container } = renderWithInspector(<ElementInspector />)
      expect(container.innerHTML).toBe('')
    })
  })

  describe('in development mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('renders nothing when inspector is disabled', () => {
      const { container } = renderWithInspector(<ElementInspector />)
      expect(container.querySelector('[data-testid="inspector-tooltip"]')).toBeNull()
    })

    it('renders inspectable elements with data attributes', () => {
      const { container } = renderWithInspector(
        <>
          <div
            data-inspector-id="header-1"
            data-inspector-component="Header"
            data-inspector-file="components/Header.jsx"
          >
            <span>Test Header</span>
          </div>
          <ElementInspector />
        </>
      )

      const inspectable = container.querySelector('[data-inspector-id="header-1"]')
      expect(inspectable).not.toBeNull()
      expect(inspectable.getAttribute('data-inspector-component')).toBe('Header')
      expect(inspectable.getAttribute('data-inspector-file')).toBe('components/Header.jsx')
    })

    it('shows tooltip when inspector is enabled and element is hovered', () => {
      const { container } = renderWithInspector(
        <>
          <div
            data-inspector-id="header-1"
            data-inspector-component="Header"
            data-inspector-file="components/Header.jsx"
          >
            <span className="bg-black text-white">Test Header</span>
          </div>
          <InspectorToggle />
          <ElementInspector />
        </>
      )

      // Enable inspector
      const toggleButton = screen.getByRole('button', { name: /toggle.*inspector/i })
      fireEvent.click(toggleButton)

      // Hover over the inspectable element
      const inspectable = container.querySelector('[data-inspector-id="header-1"]')
      fireEvent.mouseOver(inspectable)

      // Tooltip should appear with component metadata
      const tooltip = container.querySelector('[data-testid="inspector-tooltip"]')
      expect(tooltip).not.toBeNull()
      expect(tooltip.textContent).toContain('Header')
      expect(tooltip.textContent).toContain('components/Header.jsx')
      expect(tooltip.textContent).toContain('header-1')
      expect(tooltip.textContent).toContain('Copy AI Prompt')
    })

    it('hides tooltip when mouse leaves inspectable element', () => {
      const { container } = renderWithInspector(
        <>
          <div
            data-inspector-id="header-1"
            data-inspector-component="Header"
            data-inspector-file="components/Header.jsx"
          >
            <span>Test Header</span>
          </div>
          <div data-testid="outside">Outside</div>
          <InspectorToggle />
          <ElementInspector />
        </>
      )

      // Enable inspector and hover
      fireEvent.click(screen.getByRole('button', { name: /toggle.*inspector/i }))
      const inspectable = container.querySelector('[data-inspector-id="header-1"]')
      fireEvent.mouseOver(inspectable)

      // Tooltip should be visible
      expect(container.querySelector('[data-testid="inspector-tooltip"]')).not.toBeNull()

      // Mouse out to a non-inspectable element
      fireEvent.mouseOut(inspectable, { relatedTarget: screen.getByTestId('outside') })

      // Tooltip should disappear
      expect(container.querySelector('[data-testid="inspector-tooltip"]')).toBeNull()
    })

    it('copies AI prompt to clipboard when button is clicked', async () => {
      const { container } = renderWithInspector(
        <>
          <div
            data-inspector-id="footer-1"
            data-inspector-component="Footer"
            data-inspector-file="components/Footer.jsx"
          >
            <span>Test Footer</span>
          </div>
          <InspectorToggle />
          <ElementInspector />
        </>
      )

      // Enable and hover
      fireEvent.click(screen.getByRole('button', { name: /toggle.*inspector/i }))
      fireEvent.mouseOver(container.querySelector('[data-inspector-id="footer-1"]'))

      // Click copy button
      const copyButton = screen.getByText('Copy AI Prompt')
      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect(mockWriteText).toHaveBeenCalledTimes(1)
      const copiedText = mockWriteText.mock.calls[0][0]
      expect(copiedText).toContain('footer-1')
      expect(copiedText).toContain('Footer')
      expect(copiedText).toContain('components/Footer.jsx')
    })
  })
})
