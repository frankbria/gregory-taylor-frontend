import { render, screen } from '@testing-library/react'
import withInspector from '@/lib/withInspector'
import { InspectorProvider } from '@/lib/InspectorContext'

function TestComponent({ label }) {
  return <div data-testid="inner">{label}</div>
}

function renderWithInspector(Component, props = {}) {
  return render(
    <InspectorProvider>
      <Component {...props} />
    </InspectorProvider>
  )
}

describe('withInspector', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  describe('in development mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('renders the wrapped component', () => {
      const Wrapped = withInspector(TestComponent, {
        componentName: 'TestComponent',
        filePath: 'components/TestComponent.jsx',
      })

      renderWithInspector(Wrapped, { label: 'Hello' })
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('adds data-inspector-id attribute', () => {
      const Wrapped = withInspector(TestComponent, {
        componentName: 'TestComponent',
        filePath: 'components/TestComponent.jsx',
      })

      const { container } = renderWithInspector(Wrapped, { label: 'Test' })
      const wrapper = container.querySelector('[data-inspector-id]')
      expect(wrapper).not.toBeNull()
      expect(wrapper.getAttribute('data-inspector-id')).toMatch(/^testcomponent-/)
    })

    it('adds data-inspector-component attribute', () => {
      const Wrapped = withInspector(TestComponent, {
        componentName: 'TestComponent',
        filePath: 'components/TestComponent.jsx',
      })

      const { container } = renderWithInspector(Wrapped, { label: 'Test' })
      const wrapper = container.querySelector('[data-inspector-component]')
      expect(wrapper).not.toBeNull()
      expect(wrapper.getAttribute('data-inspector-component')).toBe('TestComponent')
    })

    it('adds data-inspector-file attribute', () => {
      const Wrapped = withInspector(TestComponent, {
        componentName: 'TestComponent',
        filePath: 'components/TestComponent.jsx',
      })

      const { container } = renderWithInspector(Wrapped, { label: 'Test' })
      const wrapper = container.querySelector('[data-inspector-file]')
      expect(wrapper.getAttribute('data-inspector-file')).toBe('components/TestComponent.jsx')
    })

    it('passes all props through to the wrapped component', () => {
      const Wrapped = withInspector(TestComponent, {
        componentName: 'TestComponent',
        filePath: 'components/TestComponent.jsx',
      })

      renderWithInspector(Wrapped, { label: 'Passthrough Test' })
      expect(screen.getByText('Passthrough Test')).toBeInTheDocument()
    })

    it('sets displayName on the wrapped component', () => {
      const Wrapped = withInspector(TestComponent, {
        componentName: 'TestComponent',
        filePath: 'components/TestComponent.jsx',
      })

      expect(Wrapped.displayName).toBe('withInspector(TestComponent)')
    })
  })

  describe('in production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('renders component without inspector wrapper', () => {
      const Wrapped = withInspector(TestComponent, {
        componentName: 'TestComponent',
        filePath: 'components/TestComponent.jsx',
      })

      const { container } = renderWithInspector(Wrapped, { label: 'Prod Test' })
      expect(screen.getByText('Prod Test')).toBeInTheDocument()
      expect(container.querySelector('[data-inspector-id]')).toBeNull()
    })
  })
})
