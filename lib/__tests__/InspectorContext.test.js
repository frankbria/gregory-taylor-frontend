import { renderHook, act } from '@testing-library/react'
import { InspectorProvider, useInspector } from '@/lib/InspectorContext'

// Helper to render hook within provider
function renderInspectorHook() {
  return renderHook(() => useInspector(), {
    wrapper: ({ children }) => (
      <InspectorProvider>{children}</InspectorProvider>
    ),
  })
}

describe('InspectorContext', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  describe('useInspector outside provider', () => {
    it('throws error when used outside InspectorProvider', () => {
      // Suppress console.error for expected error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      expect(() => {
        renderHook(() => useInspector())
      }).toThrow('useInspector must be used within an InspectorProvider')
      consoleSpy.mockRestore()
    })
  })

  describe('initial state', () => {
    it('starts with inspector disabled', () => {
      const { result } = renderInspectorHook()
      expect(result.current.isEnabled).toBe(false)
    })

    it('starts with empty element registry', () => {
      const { result } = renderInspectorHook()
      expect(result.current.getElement('nonexistent')).toBeUndefined()
    })

    it('has no hovered element initially', () => {
      const { result } = renderInspectorHook()
      expect(result.current.hoveredId).toBeNull()
    })
  })

  describe('toggle inspector', () => {
    it('enables inspector when toggled', () => {
      const { result } = renderInspectorHook()
      act(() => {
        result.current.toggle()
      })
      expect(result.current.isEnabled).toBe(true)
    })

    it('disables inspector when toggled twice', () => {
      const { result } = renderInspectorHook()
      act(() => {
        result.current.toggle()
      })
      act(() => {
        result.current.toggle()
      })
      expect(result.current.isEnabled).toBe(false)
    })
  })

  describe('element registration', () => {
    it('registers an element with metadata', () => {
      const { result } = renderInspectorHook()
      const metadata = {
        componentName: 'Header',
        filePath: 'components/Header.jsx',
        className: 'bg-black text-white',
      }

      act(() => {
        result.current.register('header-1', metadata)
      })

      const element = result.current.getElement('header-1')
      expect(element).toEqual(metadata)
    })

    it('unregisters an element', () => {
      const { result } = renderInspectorHook()
      act(() => {
        result.current.register('header-1', { componentName: 'Header' })
      })
      act(() => {
        result.current.unregister('header-1')
      })

      expect(result.current.getElement('header-1')).toBeUndefined()
    })

    it('registers multiple elements', () => {
      const { result } = renderInspectorHook()
      act(() => {
        result.current.register('header-1', { componentName: 'Header' })
        result.current.register('footer-1', { componentName: 'Footer' })
      })

      expect(result.current.getElement('header-1')).toEqual({ componentName: 'Header' })
      expect(result.current.getElement('footer-1')).toEqual({ componentName: 'Footer' })
    })

    it('overwrites existing registration with same ID', () => {
      const { result } = renderInspectorHook()
      act(() => {
        result.current.register('header-1', { componentName: 'Header', version: 1 })
      })
      act(() => {
        result.current.register('header-1', { componentName: 'Header', version: 2 })
      })

      expect(result.current.getElement('header-1')).toEqual({ componentName: 'Header', version: 2 })
    })
  })

  describe('hover tracking', () => {
    it('sets hovered element ID', () => {
      const { result } = renderInspectorHook()
      act(() => {
        result.current.setHoveredId('header-1')
      })
      expect(result.current.hoveredId).toBe('header-1')
    })

    it('clears hovered element when set to null', () => {
      const { result } = renderInspectorHook()
      act(() => {
        result.current.setHoveredId('header-1')
      })
      act(() => {
        result.current.setHoveredId(null)
      })
      expect(result.current.hoveredId).toBeNull()
    })
  })

  describe('getAllElements', () => {
    it('returns all registered elements', () => {
      const { result } = renderInspectorHook()
      act(() => {
        result.current.register('header-1', { componentName: 'Header' })
        result.current.register('footer-1', { componentName: 'Footer' })
      })

      const elements = result.current.getAllElements()
      expect(Object.keys(elements)).toHaveLength(2)
      expect(elements['header-1']).toEqual({ componentName: 'Header' })
      expect(elements['footer-1']).toEqual({ componentName: 'Footer' })
    })
  })

  describe('generateId', () => {
    it('generates unique IDs based on component name', () => {
      const { result } = renderInspectorHook()
      const id1 = result.current.generateId('Header')
      const id2 = result.current.generateId('Header')
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^header-/)
      expect(id2).toMatch(/^header-/)
    })

    it('generates lowercase IDs', () => {
      const { result } = renderInspectorHook()
      const id = result.current.generateId('CloudinaryImage')
      expect(id).toMatch(/^cloudinaryimage-/)
    })
  })
})
