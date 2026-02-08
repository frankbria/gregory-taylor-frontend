import { render, screen, fireEvent } from '@testing-library/react'
import InspectorToggle from '@/components/dev/InspectorToggle'
import { InspectorProvider, useInspector } from '@/lib/InspectorContext'

function renderWithInspector(ui) {
  return render(
    <InspectorProvider>
      {ui}
    </InspectorProvider>
  )
}

// Helper component to read inspector state
function InspectorState() {
  const { isEnabled } = useInspector()
  return <div data-testid="inspector-state">{isEnabled ? 'enabled' : 'disabled'}</div>
}

describe('InspectorToggle', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  describe('in production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('renders nothing in production', () => {
      const { container } = renderWithInspector(<InspectorToggle />)
      expect(container.innerHTML).toBe('')
    })
  })

  describe('in development mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('renders toggle button', () => {
      renderWithInspector(<InspectorToggle />)
      const button = screen.getByRole('button', { name: /toggle.*inspector/i })
      expect(button).toBeInTheDocument()
    })

    it('shows keyboard shortcut hint', () => {
      renderWithInspector(<InspectorToggle />)
      expect(screen.getByText(/ctrl.*shift.*i/i)).toBeInTheDocument()
    })

    it('toggles inspector on click', () => {
      renderWithInspector(
        <>
          <InspectorToggle />
          <InspectorState />
        </>
      )

      expect(screen.getByTestId('inspector-state')).toHaveTextContent('disabled')

      fireEvent.click(screen.getByRole('button', { name: /toggle.*inspector/i }))
      expect(screen.getByTestId('inspector-state')).toHaveTextContent('enabled')
    })

    it('toggles inspector on Ctrl+Shift+I keyboard shortcut', () => {
      renderWithInspector(
        <>
          <InspectorToggle />
          <InspectorState />
        </>
      )

      expect(screen.getByTestId('inspector-state')).toHaveTextContent('disabled')

      fireEvent.keyDown(window, {
        key: 'I',
        ctrlKey: true,
        shiftKey: true,
      })
      expect(screen.getByTestId('inspector-state')).toHaveTextContent('enabled')
    })

    it('shows enabled state visually', () => {
      renderWithInspector(
        <>
          <InspectorToggle />
          <InspectorState />
        </>
      )

      const button = screen.getByRole('button', { name: /toggle.*inspector/i })
      fireEvent.click(button)

      // After enabling, button should show active state
      expect(screen.getByTestId('inspector-state')).toHaveTextContent('enabled')
    })
  })
})
