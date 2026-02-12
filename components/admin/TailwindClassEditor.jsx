'use client'

import { useState, useMemo, useCallback } from 'react'
import { useLayout } from '@/lib/LayoutContext'

const SPACING_VALUES = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20']
const SPACING_VALUES_WITH_AUTO = [...SPACING_VALUES, 'auto']

const SIZING_WIDTH = ['auto', 'full', 'screen', '1/2', '1/3', '2/3', '1/4', '3/4', '12', '24', '32', '48', '64', '96']
const SIZING_HEIGHT = ['auto', 'full', 'screen', '12', '24', '32', '48', '64', '96']
const SIZING_MIN_HEIGHT = ['auto', 'full', 'screen', '0']

const DISPLAY_OPTIONS = ['block', 'inline-block', 'flex', 'grid', 'hidden']
const FLEX_DIRECTION = ['flex-row', 'flex-col']
const JUSTIFY_OPTIONS = ['justify-start', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly']
const ALIGN_OPTIONS = ['items-start', 'items-center', 'items-end', 'items-stretch']

const COLOR_OPTIONS = [
  'white', 'black',
  'gray-50', 'gray-100', 'gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800', 'gray-900',
  'blue-500', 'red-500', 'green-500', 'yellow-500',
  'transparent',
]

const FONT_SIZE_OPTIONS = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl']
const FONT_WEIGHT_OPTIONS = ['font-thin', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold']
const TEXT_ALIGN_OPTIONS = ['text-left', 'text-center', 'text-right', 'text-justify']

const BORDER_WIDTH_OPTIONS = ['border-0', 'border', 'border-2', 'border-4', 'border-8']
const BORDER_RADIUS_OPTIONS = ['rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full']
const SHADOW_OPTIONS = ['shadow-none', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl']

const TABS = [
  { id: 'spacing', label: 'Spacing' },
  { id: 'sizing', label: 'Sizing' },
  { id: 'layout', label: 'Layout' },
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'effects', label: 'Effects' },
]

/**
 * Class group definitions: each group has a prefix and a pattern to match existing classes.
 * This allows us to detect and remove the old class before adding a new one.
 */
const CLASS_GROUPS = {
  // Spacing
  m: { pattern: /^m-(\d+|auto)$/ },
  mx: { pattern: /^mx-(\d+|auto)$/ },
  my: { pattern: /^my-(\d+|auto)$/ },
  mt: { pattern: /^mt-(\d+|auto)$/ },
  mr: { pattern: /^mr-(\d+|auto)$/ },
  mb: { pattern: /^mb-(\d+|auto)$/ },
  ml: { pattern: /^ml-(\d+|auto)$/ },
  p: { pattern: /^p-(\d+)$/ },
  px: { pattern: /^px-(\d+)$/ },
  py: { pattern: /^py-(\d+)$/ },
  pt: { pattern: /^pt-(\d+)$/ },
  pr: { pattern: /^pr-(\d+)$/ },
  pb: { pattern: /^pb-(\d+)$/ },
  pl: { pattern: /^pl-(\d+)$/ },
  gap: { pattern: /^gap-(\d+)$/ },
  // Sizing
  w: { pattern: /^w-(auto|full|screen|1\/2|1\/3|2\/3|1\/4|3\/4|\d+)$/ },
  h: { pattern: /^h-(auto|full|screen|\d+)$/ },
  'min-h': { pattern: /^min-h-(auto|full|screen|0)$/ },
  // Layout
  display: { pattern: /^(block|inline-block|flex|grid|hidden)$/ },
  'flex-direction': { pattern: /^(flex-row|flex-col)$/ },
  justify: { pattern: /^justify-(start|center|between|around|evenly)$/ },
  items: { pattern: /^items-(start|center|end|stretch)$/ },
  'grid-cols': { pattern: /^grid-cols-(\d+)$/ },
  // Colors
  bg: { pattern: /^bg-(white|black|gray-\d+|blue-\d+|red-\d+|green-\d+|yellow-\d+|transparent)$/ },
  'text-color': { pattern: /^text-(white|black|gray-\d+|blue-\d+|red-\d+|green-\d+|yellow-\d+|transparent)$/ },
  'border-color': { pattern: /^border-(white|black|gray-\d+|blue-\d+|red-\d+|green-\d+|yellow-\d+|transparent)$/ },
  // Typography
  'font-size': { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)$/ },
  'font-weight': { pattern: /^font-(thin|light|normal|medium|semibold|bold|extrabold)$/ },
  'text-align': { pattern: /^text-(left|center|right|justify)$/ },
  // Effects
  'border-width': { pattern: /^border(-[0248])?$/, matchFull: true },
  'border-radius': { pattern: /^rounded(-none|-sm|-md|-lg|-xl|-2xl|-full)?$/, matchFull: true },
  shadow: { pattern: /^shadow(-none|-sm|-md|-lg|-xl|-2xl)?$/, matchFull: true },
}

function findClassInGroup(classes, groupKey) {
  const group = CLASS_GROUPS[groupKey]
  if (!group) return ''
  return classes.find(cls => group.pattern.test(cls)) || ''
}

function SelectControl({ label, id, value, options, onChange }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
      >
        <option value="">--</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

function RadioGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset className="mb-3">
      <legend className="block text-sm font-medium text-gray-700 mb-1">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <label key={opt} className="inline-flex items-center gap-1 text-sm">
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={onChange}
              aria-label={opt}
            />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default function TailwindClassEditor({ className }) {
  const { selectedComponentId, getComponentClasses, addClass, removeClass } = useLayout()
  const [activeTab, setActiveTab] = useState('spacing')
  const [customInput, setCustomInput] = useState('')

  const classes = useMemo(
    () => (selectedComponentId ? getComponentClasses(selectedComponentId) : []),
    [selectedComponentId, getComponentClasses]
  )

  const handleSelectChange = useCallback((groupKey, newValue) => {
    if (!selectedComponentId) return
    // Remove old class in this group
    const oldClass = findClassInGroup(classes, groupKey)
    if (oldClass) {
      removeClass(selectedComponentId, oldClass)
    }
    // Add new class if not blank
    if (newValue) {
      addClass(selectedComponentId, newValue)
    }
  }, [selectedComponentId, classes, addClass, removeClass])

  const handleRadioChange = useCallback((groupKey, newValue) => {
    if (!selectedComponentId) return
    const oldClass = findClassInGroup(classes, groupKey)
    if (oldClass) {
      removeClass(selectedComponentId, oldClass)
    }
    if (newValue) {
      addClass(selectedComponentId, newValue)
    }
  }, [selectedComponentId, classes, addClass, removeClass])

  const handleCustomKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = customInput.trim()
      if (val && selectedComponentId) {
        addClass(selectedComponentId, val)
        setCustomInput('')
      }
    }
  }, [customInput, selectedComponentId, addClass])

  if (!selectedComponentId) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className || ''}`}>
        <p className="text-gray-500 text-sm text-center py-8">
          Select a component from the tree to edit its styles
        </p>
      </div>
    )
  }

  // Build prefix-based select options for spacing
  const marginOptions = SPACING_VALUES_WITH_AUTO.map(v => `m-${v}`)
  const mxOptions = SPACING_VALUES_WITH_AUTO.map(v => `mx-${v}`)
  const myOptions = SPACING_VALUES_WITH_AUTO.map(v => `my-${v}`)
  const mtOptions = SPACING_VALUES_WITH_AUTO.map(v => `mt-${v}`)
  const mrOptions = SPACING_VALUES_WITH_AUTO.map(v => `mr-${v}`)
  const mbOptions = SPACING_VALUES_WITH_AUTO.map(v => `mb-${v}`)
  const mlOptions = SPACING_VALUES_WITH_AUTO.map(v => `ml-${v}`)
  const paddingOptions = SPACING_VALUES.map(v => `p-${v}`)
  const pxOptions = SPACING_VALUES.map(v => `px-${v}`)
  const pyOptions = SPACING_VALUES.map(v => `py-${v}`)
  const ptOptions = SPACING_VALUES.map(v => `pt-${v}`)
  const prOptions = SPACING_VALUES.map(v => `pr-${v}`)
  const pbOptions = SPACING_VALUES.map(v => `pb-${v}`)
  const plOptions = SPACING_VALUES.map(v => `pl-${v}`)
  const gapOptions = SPACING_VALUES.map(v => `gap-${v}`)

  const widthOptions = SIZING_WIDTH.map(v => `w-${v}`)
  const heightOptions = SIZING_HEIGHT.map(v => `h-${v}`)
  const minHeightOptions = SIZING_MIN_HEIGHT.map(v => `min-h-${v}`)

  const bgOptions = COLOR_OPTIONS.map(v => `bg-${v}`)
  const textColorOptions = COLOR_OPTIONS.map(v => `text-${v}`)
  const borderColorOptions = COLOR_OPTIONS.map(v => `border-${v}`)

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className || ''}`}>
      {/* Tab navigation */}
      <div className="flex border-b" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-4">
        {activeTab === 'spacing' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Margin</h3>
            <SelectControl label="Margin" id="spacing-m" value={findClassInGroup(classes, 'm')} options={marginOptions} onChange={(e) => handleSelectChange('m', e.target.value)} />
            <SelectControl label="Margin X" id="spacing-mx" value={findClassInGroup(classes, 'mx')} options={mxOptions} onChange={(e) => handleSelectChange('mx', e.target.value)} />
            <SelectControl label="Margin Y" id="spacing-my" value={findClassInGroup(classes, 'my')} options={myOptions} onChange={(e) => handleSelectChange('my', e.target.value)} />
            <SelectControl label="Margin Top" id="spacing-mt" value={findClassInGroup(classes, 'mt')} options={mtOptions} onChange={(e) => handleSelectChange('mt', e.target.value)} />
            <SelectControl label="Margin Right" id="spacing-mr" value={findClassInGroup(classes, 'mr')} options={mrOptions} onChange={(e) => handleSelectChange('mr', e.target.value)} />
            <SelectControl label="Margin Bottom" id="spacing-mb" value={findClassInGroup(classes, 'mb')} options={mbOptions} onChange={(e) => handleSelectChange('mb', e.target.value)} />
            <SelectControl label="Margin Left" id="spacing-ml" value={findClassInGroup(classes, 'ml')} options={mlOptions} onChange={(e) => handleSelectChange('ml', e.target.value)} />

            <h3 className="text-sm font-semibold text-gray-800 mb-2 mt-4">Padding</h3>
            <SelectControl label="Padding" id="spacing-p" value={findClassInGroup(classes, 'p')} options={paddingOptions} onChange={(e) => handleSelectChange('p', e.target.value)} />
            <SelectControl label="Padding X" id="spacing-px" value={findClassInGroup(classes, 'px')} options={pxOptions} onChange={(e) => handleSelectChange('px', e.target.value)} />
            <SelectControl label="Padding Y" id="spacing-py" value={findClassInGroup(classes, 'py')} options={pyOptions} onChange={(e) => handleSelectChange('py', e.target.value)} />
            <SelectControl label="Padding Top" id="spacing-pt" value={findClassInGroup(classes, 'pt')} options={ptOptions} onChange={(e) => handleSelectChange('pt', e.target.value)} />
            <SelectControl label="Padding Right" id="spacing-pr" value={findClassInGroup(classes, 'pr')} options={prOptions} onChange={(e) => handleSelectChange('pr', e.target.value)} />
            <SelectControl label="Padding Bottom" id="spacing-pb" value={findClassInGroup(classes, 'pb')} options={pbOptions} onChange={(e) => handleSelectChange('pb', e.target.value)} />
            <SelectControl label="Padding Left" id="spacing-pl" value={findClassInGroup(classes, 'pl')} options={plOptions} onChange={(e) => handleSelectChange('pl', e.target.value)} />

            <h3 className="text-sm font-semibold text-gray-800 mb-2 mt-4">Gap</h3>
            <SelectControl label="Gap" id="spacing-gap" value={findClassInGroup(classes, 'gap')} options={gapOptions} onChange={(e) => handleSelectChange('gap', e.target.value)} />
          </div>
        )}

        {activeTab === 'sizing' && (
          <div>
            <SelectControl label="Width" id="sizing-w" value={findClassInGroup(classes, 'w')} options={widthOptions} onChange={(e) => handleSelectChange('w', e.target.value)} />
            <SelectControl label="Height" id="sizing-h" value={findClassInGroup(classes, 'h')} options={heightOptions} onChange={(e) => handleSelectChange('h', e.target.value)} />
            <SelectControl label="Min Height" id="sizing-min-h" value={findClassInGroup(classes, 'min-h')} options={minHeightOptions} onChange={(e) => handleSelectChange('min-h', e.target.value)} />
          </div>
        )}

        {activeTab === 'layout' && (
          <div>
            <RadioGroup legend="Display" name="display" options={DISPLAY_OPTIONS} value={findClassInGroup(classes, 'display')} onChange={(e) => handleRadioChange('display', e.target.value)} />
            <RadioGroup legend="Flex Direction" name="flex-direction" options={FLEX_DIRECTION} value={findClassInGroup(classes, 'flex-direction')} onChange={(e) => handleRadioChange('flex-direction', e.target.value)} />
            <RadioGroup legend="Justify" name="justify" options={JUSTIFY_OPTIONS} value={findClassInGroup(classes, 'justify')} onChange={(e) => handleRadioChange('justify', e.target.value)} />
            <RadioGroup legend="Align" name="align" options={ALIGN_OPTIONS} value={findClassInGroup(classes, 'items')} onChange={(e) => handleRadioChange('items', e.target.value)} />

            <div className="mb-3">
              <label htmlFor="layout-grid-cols" className="block text-sm font-medium text-gray-700 mb-1">
                Grid Columns
              </label>
              <input
                type="number"
                id="layout-grid-cols"
                min={1}
                max={12}
                value={(() => {
                  const match = findClassInGroup(classes, 'grid-cols')
                  const m = match.match(/grid-cols-(\d+)/)
                  return m ? m[1] : ''
                })()}
                onChange={(e) => {
                  const val = e.target.value
                  if (val && Number(val) >= 1 && Number(val) <= 12) {
                    handleSelectChange('grid-cols', `grid-cols-${val}`)
                  } else {
                    handleSelectChange('grid-cols', '')
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-20"
              />
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div>
            <SelectControl label="Background" id="colors-bg" value={findClassInGroup(classes, 'bg')} options={bgOptions} onChange={(e) => handleSelectChange('bg', e.target.value)} />
            <SelectControl label="Text Color" id="colors-text" value={findClassInGroup(classes, 'text-color')} options={textColorOptions} onChange={(e) => handleSelectChange('text-color', e.target.value)} />
            <SelectControl label="Border Color" id="colors-border" value={findClassInGroup(classes, 'border-color')} options={borderColorOptions} onChange={(e) => handleSelectChange('border-color', e.target.value)} />
          </div>
        )}

        {activeTab === 'typography' && (
          <div>
            <SelectControl label="Font Size" id="typo-size" value={findClassInGroup(classes, 'font-size')} options={FONT_SIZE_OPTIONS} onChange={(e) => handleSelectChange('font-size', e.target.value)} />
            <SelectControl label="Font Weight" id="typo-weight" value={findClassInGroup(classes, 'font-weight')} options={FONT_WEIGHT_OPTIONS} onChange={(e) => handleSelectChange('font-weight', e.target.value)} />
            <RadioGroup legend="Text Align" name="text-align" options={TEXT_ALIGN_OPTIONS} value={findClassInGroup(classes, 'text-align')} onChange={(e) => handleRadioChange('text-align', e.target.value)} />
          </div>
        )}

        {activeTab === 'effects' && (
          <div>
            <SelectControl label="Border Width" id="effects-border-w" value={findClassInGroup(classes, 'border-width')} options={BORDER_WIDTH_OPTIONS} onChange={(e) => handleSelectChange('border-width', e.target.value)} />
            <SelectControl label="Border Radius" id="effects-radius" value={findClassInGroup(classes, 'border-radius')} options={BORDER_RADIUS_OPTIONS} onChange={(e) => handleSelectChange('border-radius', e.target.value)} />
            <SelectControl label="Shadow" id="effects-shadow" value={findClassInGroup(classes, 'shadow')} options={SHADOW_OPTIONS} onChange={(e) => handleSelectChange('shadow', e.target.value)} />
          </div>
        )}
      </div>

      {/* Custom class input */}
      <div className="border-t pt-3">
        <input
          type="text"
          placeholder="Add Custom Class"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleCustomKeyDown}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
        />
      </div>
    </div>
  )
}
