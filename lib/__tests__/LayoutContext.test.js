import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LayoutProvider, useLayout, SITE_COMPONENT_TREE } from '../LayoutContext'

function TestConsumer() {
  const {
    selectedComponentId,
    componentStyles,
    tree,
    selectComponent,
    getComponentClasses,
    updateComponentClasses,
    addClass,
    removeClass,
    resetComponent,
    resetAll,
    markSaved,
    isDirty,
  } = useLayout()

  return (
    <div>
      <span data-testid="selected">{selectedComponentId || 'none'}</span>
      <span data-testid="styles">{JSON.stringify(componentStyles)}</span>
      <span data-testid="dirty">{isDirty() ? 'dirty' : 'clean'}</span>
      <span data-testid="tree-count">{tree.length}</span>
      <span data-testid="header-classes">{JSON.stringify(getComponentClasses('header'))}</span>
      <button onClick={() => selectComponent('header')}>Select Header</button>
      <button onClick={() => selectComponent('footer')}>Select Footer</button>
      <button onClick={() => addClass('header', 'bg-black')}>Add Class</button>
      <button onClick={() => addClass('header', 'text-white')}>Add Text White</button>
      <button onClick={() => removeClass('header', 'bg-black')}>Remove Class</button>
      <button onClick={() => updateComponentClasses('hero', ['text-center', 'min-h-96'])}>Set Hero Classes</button>
      <button onClick={() => resetComponent('header')}>Reset Header</button>
      <button onClick={() => resetAll()}>Reset All</button>
      <button onClick={() => markSaved()}>Mark Saved</button>
    </div>
  )
}

describe('LayoutContext', () => {
  describe('SITE_COMPONENT_TREE', () => {
    it('defines the static site component tree', () => {
      expect(SITE_COMPONENT_TREE).toBeInstanceOf(Array)
      expect(SITE_COMPONENT_TREE.length).toBeGreaterThan(0)

      const header = SITE_COMPONENT_TREE.find(n => n.id === 'header')
      expect(header).toBeDefined()
      expect(header.label).toBe('Header')
      expect(header.children.length).toBeGreaterThan(0)
    })
  })

  describe('useLayout hook', () => {
    it('throws when used outside LayoutProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      expect(() => render(<TestConsumer />)).toThrow('useLayout must be used within a LayoutProvider')
      consoleSpy.mockRestore()
    })
  })

  describe('LayoutProvider', () => {
    it('provides the component tree', () => {
      render(
        <LayoutProvider>
          <TestConsumer />
        </LayoutProvider>
      )
      expect(Number(screen.getByTestId('tree-count').textContent)).toBe(SITE_COMPONENT_TREE.length)
    })

    it('starts with no component selected', () => {
      render(
        <LayoutProvider>
          <TestConsumer />
        </LayoutProvider>
      )
      expect(screen.getByTestId('selected').textContent).toBe('none')
    })

    it('starts clean (not dirty)', () => {
      render(
        <LayoutProvider>
          <TestConsumer />
        </LayoutProvider>
      )
      expect(screen.getByTestId('dirty').textContent).toBe('clean')
    })

    it('accepts initialComponentStyles', () => {
      const initial = { header: ['bg-black', 'py-4'] }
      render(
        <LayoutProvider initialComponentStyles={initial}>
          <TestConsumer />
        </LayoutProvider>
      )
      expect(screen.getByTestId('header-classes').textContent).toBe(JSON.stringify(['bg-black', 'py-4']))
    })
  })

  describe('selectComponent', () => {
    it('updates selected component', async () => {
      const user = userEvent.setup()
      render(
        <LayoutProvider>
          <TestConsumer />
        </LayoutProvider>
      )

      await user.click(screen.getByText('Select Header'))
      expect(screen.getByTestId('selected').textContent).toBe('header')

      await user.click(screen.getByText('Select Footer'))
      expect(screen.getByTestId('selected').textContent).toBe('footer')
    })
  })

  describe('addClass', () => {
    it('adds a class to a component', async () => {
      const user = userEvent.setup()
      render(
        <LayoutProvider>
          <TestConsumer />
        </LayoutProvider>
      )

      await user.click(screen.getByText('Add Class'))
      expect(screen.getByTestId('header-classes').textContent).toBe(JSON.stringify(['bg-black']))
    })

    it('does not add duplicate classes', async () => {
      const user = userEvent.setup()
      render(
        <LayoutProvider>
          <TestConsumer />
        </LayoutProvider>
      )

      await user.click(screen.getByText('Add Class'))
      await user.click(screen.getByText('Add Class'))
      expect(screen.getByTestId('header-classes').textContent).toBe(JSON.stringify(['bg-black']))
    })

    it('marks state as dirty', async () => {
      const user = userEvent.setup()
      render(
        <LayoutProvider>
          <TestConsumer />
        </LayoutProvider>
      )

      expect(screen.getByTestId('dirty').textContent).toBe('clean')
      await user.click(screen.getByText('Add Class'))
      expect(screen.getByTestId('dirty').textContent).toBe('dirty')
    })
  })

  describe('removeClass', () => {
    it('removes a class from a component', async () => {
      const user = userEvent.setup()
      render(
        <LayoutProvider initialComponentStyles={{ header: ['bg-black', 'text-white'] }}>
          <TestConsumer />
        </LayoutProvider>
      )

      await user.click(screen.getByText('Remove Class'))
      expect(screen.getByTestId('header-classes').textContent).toBe(JSON.stringify(['text-white']))
    })

    it('does nothing when removing non-existent class', async () => {
      const user = userEvent.setup()
      render(
        <LayoutProvider>
          <TestConsumer />
        </LayoutProvider>
      )

      await user.click(screen.getByText('Remove Class'))
      expect(screen.getByTestId('header-classes').textContent).toBe(JSON.stringify([]))
    })
  })

  describe('updateComponentClasses', () => {
    it('replaces all classes for a component', async () => {
      const user = userEvent.setup()
      render(
        <LayoutProvider>
          <TestConsumer />
        </LayoutProvider>
      )

      await user.click(screen.getByText('Set Hero Classes'))
      const styles = JSON.parse(screen.getByTestId('styles').textContent)
      expect(styles.hero).toEqual(['text-center', 'min-h-96'])
    })
  })

  describe('resetComponent', () => {
    it('reverts a component to saved state', async () => {
      const user = userEvent.setup()
      render(
        <LayoutProvider initialComponentStyles={{ header: ['bg-black'] }}>
          <TestConsumer />
        </LayoutProvider>
      )

      await user.click(screen.getByText('Add Text White'))
      expect(screen.getByTestId('header-classes').textContent).toBe(JSON.stringify(['bg-black', 'text-white']))

      await user.click(screen.getByText('Reset Header'))
      expect(screen.getByTestId('header-classes').textContent).toBe(JSON.stringify(['bg-black']))
    })

    it('removes key and clears dirty state when no saved entry exists', async () => {
      const user = userEvent.setup()
      render(
        <LayoutProvider>
          <TestConsumer />
        </LayoutProvider>
      )

      // Add a class to header (no saved entry for header)
      await user.click(screen.getByText('Add Class'))
      expect(screen.getByTestId('dirty').textContent).toBe('dirty')

      // Reset header — should remove the key entirely, not leave []
      await user.click(screen.getByText('Reset Header'))
      expect(screen.getByTestId('dirty').textContent).toBe('clean')
      expect(screen.getByTestId('header-classes').textContent).toBe(JSON.stringify([]))
    })
  })

  describe('resetAll', () => {
    it('reverts all components to saved state', async () => {
      const user = userEvent.setup()
      render(
        <LayoutProvider initialComponentStyles={{ header: ['bg-black'] }}>
          <TestConsumer />
        </LayoutProvider>
      )

      await user.click(screen.getByText('Add Text White'))
      await user.click(screen.getByText('Set Hero Classes'))
      await user.click(screen.getByText('Reset All'))

      const styles = JSON.parse(screen.getByTestId('styles').textContent)
      expect(styles.header).toEqual(['bg-black'])
      expect(styles.hero).toBeUndefined()
    })
  })

  describe('markSaved', () => {
    it('updates saved reference so isDirty returns false', async () => {
      const user = userEvent.setup()
      render(
        <LayoutProvider>
          <TestConsumer />
        </LayoutProvider>
      )

      await user.click(screen.getByText('Add Class'))
      expect(screen.getByTestId('dirty').textContent).toBe('dirty')

      await user.click(screen.getByText('Mark Saved'))
      expect(screen.getByTestId('dirty').textContent).toBe('clean')
    })
  })
})
