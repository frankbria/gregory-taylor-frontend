import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockAddClass = jest.fn()
const mockRemoveClass = jest.fn()
const mockGetComponentClasses = jest.fn(() => [])
const mockUpdateComponentClasses = jest.fn()

let mockSelectedComponentId = null

jest.mock('@/lib/LayoutContext', () => ({
  useLayout: () => ({
    selectedComponentId: mockSelectedComponentId,
    getComponentClasses: mockGetComponentClasses,
    addClass: mockAddClass,
    removeClass: mockRemoveClass,
    updateComponentClasses: mockUpdateComponentClasses,
  }),
}))

import TailwindClassEditor from '../TailwindClassEditor'

describe('TailwindClassEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSelectedComponentId = null
    mockGetComponentClasses.mockReturnValue([])
  })

  describe('placeholder state', () => {
    it('shows placeholder when no component is selected', () => {
      render(<TailwindClassEditor />)
      expect(
        screen.getByText(/select a component from the tree to edit its styles/i)
      ).toBeInTheDocument()
    })

    it('does not show tabs when no component is selected', () => {
      render(<TailwindClassEditor />)
      expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    })
  })

  describe('tab navigation', () => {
    beforeEach(() => {
      mockSelectedComponentId = 'header'
    })

    it('renders all 6 tabs', () => {
      render(<TailwindClassEditor />)
      expect(screen.getByRole('tab', { name: /spacing/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /sizing/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /layout/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /colors/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /typography/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /effects/i })).toBeInTheDocument()
    })

    it('shows Spacing tab content by default', () => {
      render(<TailwindClassEditor />)
      expect(screen.getByLabelText(/^margin$/i)).toBeInTheDocument()
    })

    it('switches to Sizing tab on click', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /sizing/i }))
      expect(screen.getByLabelText(/^width$/i)).toBeInTheDocument()
    })

    it('switches to Layout tab on click', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /layout/i }))
      expect(screen.getByText(/display/i)).toBeInTheDocument()
    })

    it('switches to Colors tab on click', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /colors/i }))
      expect(screen.getByLabelText(/background/i)).toBeInTheDocument()
    })

    it('switches to Typography tab on click', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /typography/i }))
      expect(screen.getByLabelText(/font size/i)).toBeInTheDocument()
    })

    it('switches to Effects tab on click', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /effects/i }))
      expect(screen.getByLabelText(/border width/i)).toBeInTheDocument()
    })
  })

  describe('Spacing tab', () => {
    beforeEach(() => {
      mockSelectedComponentId = 'header'
    })

    it('changing margin select calls addClass with correct class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.selectOptions(screen.getByLabelText(/^margin$/i), 'm-4')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'm-4')
    })

    it('changing margin removes old margin class first', async () => {
      mockGetComponentClasses.mockReturnValue(['m-2', 'p-4'])
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.selectOptions(screen.getByLabelText(/^margin$/i), 'm-6')
      expect(mockRemoveClass).toHaveBeenCalledWith('header', 'm-2')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'm-6')
    })

    it('selecting blank option removes margin class', async () => {
      mockGetComponentClasses.mockReturnValue(['m-4'])
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.selectOptions(screen.getByLabelText(/^margin$/i), '')
      expect(mockRemoveClass).toHaveBeenCalledWith('header', 'm-4')
      expect(mockAddClass).not.toHaveBeenCalled()
    })

    it('renders padding controls', () => {
      render(<TailwindClassEditor />)
      expect(screen.getByLabelText(/^padding$/i)).toBeInTheDocument()
    })

    it('changing padding calls addClass', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.selectOptions(screen.getByLabelText(/^padding$/i), 'p-4')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'p-4')
    })

    it('renders gap control', () => {
      render(<TailwindClassEditor />)
      expect(screen.getByLabelText(/^gap$/i)).toBeInTheDocument()
    })
  })

  describe('Colors tab', () => {
    beforeEach(() => {
      mockSelectedComponentId = 'header'
    })

    it('selecting background color adds bg- class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /colors/i }))
      await user.selectOptions(screen.getByLabelText(/background/i), 'bg-white')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'bg-white')
    })

    it('selecting text color adds text- class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /colors/i }))
      await user.selectOptions(screen.getByLabelText(/text color/i), 'text-white')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'text-white')
    })

    it('changing background color removes old bg- class first', async () => {
      mockGetComponentClasses.mockReturnValue(['bg-white', 'text-black'])
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /colors/i }))
      await user.selectOptions(screen.getByLabelText(/background/i), 'bg-black')
      expect(mockRemoveClass).toHaveBeenCalledWith('header', 'bg-white')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'bg-black')
    })
  })

  describe('Typography tab', () => {
    beforeEach(() => {
      mockSelectedComponentId = 'header'
    })

    it('selecting font size adds text- class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /typography/i }))
      await user.selectOptions(screen.getByLabelText(/font size/i), 'text-lg')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'text-lg')
    })

    it('selecting font weight adds font- class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /typography/i }))
      await user.selectOptions(screen.getByLabelText(/font weight/i), 'font-bold')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'font-bold')
    })

    it('selecting text align adds alignment class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /typography/i }))
      await user.click(screen.getByRole('radio', { name: /text-center/i }))
      expect(mockAddClass).toHaveBeenCalledWith('header', 'text-center')
    })
  })

  describe('Layout tab', () => {
    beforeEach(() => {
      mockSelectedComponentId = 'header'
    })

    it('selecting display mode adds correct class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /layout/i }))
      await user.click(screen.getByRole('radio', { name: /^flex$/i }))
      expect(mockAddClass).toHaveBeenCalledWith('header', 'flex')
    })

    it('changing display mode removes old display class', async () => {
      mockGetComponentClasses.mockReturnValue(['block', 'p-4'])
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /layout/i }))
      await user.click(screen.getByRole('radio', { name: /^flex$/i }))
      expect(mockRemoveClass).toHaveBeenCalledWith('header', 'block')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'flex')
    })
  })

  describe('Sizing tab', () => {
    beforeEach(() => {
      mockSelectedComponentId = 'header'
    })

    it('selecting width adds w- class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /sizing/i }))
      await user.selectOptions(screen.getByLabelText(/^width$/i), 'w-full')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'w-full')
    })

    it('selecting height adds h- class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /sizing/i }))
      await user.selectOptions(screen.getByLabelText(/^height$/i), 'h-screen')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'h-screen')
    })
  })

  describe('Effects tab', () => {
    beforeEach(() => {
      mockSelectedComponentId = 'header'
    })

    it('selecting border width adds border class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /effects/i }))
      await user.selectOptions(screen.getByLabelText(/border width/i), 'border-2')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'border-2')
    })

    it('selecting border radius adds rounded class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /effects/i }))
      await user.selectOptions(screen.getByLabelText(/border radius/i), 'rounded-lg')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'rounded-lg')
    })

    it('selecting shadow adds shadow class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /effects/i }))
      await user.selectOptions(screen.getByLabelText(/^shadow$/i), 'shadow-md')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'shadow-md')
    })
  })

  describe('Layout tab - grid columns', () => {
    beforeEach(() => {
      mockSelectedComponentId = 'header'
    })

    it('entering valid grid columns adds grid-cols class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /layout/i }))
      const input = screen.getByLabelText(/grid columns/i)
      await user.type(input, '3')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'grid-cols-3')
    })

    it('clearing grid columns removes stale grid-cols class', async () => {
      mockGetComponentClasses.mockReturnValue(['grid-cols-3'])
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /layout/i }))
      const input = screen.getByLabelText(/grid columns/i)
      await user.clear(input)
      expect(mockRemoveClass).toHaveBeenCalledWith('header', 'grid-cols-3')
    })

    it('selecting flex direction adds flex direction class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /layout/i }))
      await user.click(screen.getByRole('radio', { name: /flex-col/i }))
      expect(mockAddClass).toHaveBeenCalledWith('header', 'flex-col')
    })

    it('selecting justify option adds justify class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /layout/i }))
      await user.click(screen.getByRole('radio', { name: /justify-center/i }))
      expect(mockAddClass).toHaveBeenCalledWith('header', 'justify-center')
    })

    it('selecting align option adds items class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /layout/i }))
      await user.click(screen.getByRole('radio', { name: /items-center/i }))
      expect(mockAddClass).toHaveBeenCalledWith('header', 'items-center')
    })
  })

  describe('Spacing tab - additional controls', () => {
    beforeEach(() => {
      mockSelectedComponentId = 'header'
    })

    it('selecting margin-x adds mx- class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.selectOptions(screen.getByLabelText(/margin x/i), 'mx-4')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'mx-4')
    })

    it('selecting margin-y adds my- class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.selectOptions(screen.getByLabelText(/margin y/i), 'my-2')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'my-2')
    })

    it('selecting padding-x adds px- class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.selectOptions(screen.getByLabelText(/padding x/i), 'px-6')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'px-6')
    })

    it('selecting gap adds gap- class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.selectOptions(screen.getByLabelText(/^gap$/i), 'gap-4')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'gap-4')
    })
  })

  describe('custom class input', () => {
    beforeEach(() => {
      mockSelectedComponentId = 'header'
    })

    it('adding class via Enter key calls addClass', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      const input = screen.getByPlaceholderText(/add custom class/i)
      await user.type(input, 'my-custom-class{Enter}')
      expect(mockAddClass).toHaveBeenCalledWith('header', 'my-custom-class')
    })

    it('clears input after adding class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      const input = screen.getByPlaceholderText(/add custom class/i)
      await user.type(input, 'my-custom-class{Enter}')
      expect(input).toHaveValue('')
    })

    it('does not add empty class', async () => {
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      const input = screen.getByPlaceholderText(/add custom class/i)
      await user.type(input, '{Enter}')
      expect(mockAddClass).not.toHaveBeenCalled()
    })
  })

  describe('parsing existing classes', () => {
    beforeEach(() => {
      mockSelectedComponentId = 'header'
    })

    it('sets margin control value from existing classes', () => {
      mockGetComponentClasses.mockReturnValue(['m-4', 'text-center', 'bg-white'])
      render(<TailwindClassEditor />)

      expect(screen.getByLabelText(/^margin$/i)).toHaveValue('m-4')
    })

    it('sets padding control value from existing classes', () => {
      mockGetComponentClasses.mockReturnValue(['p-6', 'text-center'])
      render(<TailwindClassEditor />)

      expect(screen.getByLabelText(/^padding$/i)).toHaveValue('p-6')
    })

    it('sets background color from existing classes', async () => {
      mockGetComponentClasses.mockReturnValue(['bg-white', 'm-4'])
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /colors/i }))
      expect(screen.getByLabelText(/background/i)).toHaveValue('bg-white')
    })

    it('sets font size from existing classes', async () => {
      mockGetComponentClasses.mockReturnValue(['text-lg', 'font-bold'])
      const user = userEvent.setup()
      render(<TailwindClassEditor />)

      await user.click(screen.getByRole('tab', { name: /typography/i }))
      expect(screen.getByLabelText(/font size/i)).toHaveValue('text-lg')
    })
  })
})
