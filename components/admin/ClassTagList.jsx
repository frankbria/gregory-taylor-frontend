'use client'

import { useLayout } from '@/lib/LayoutContext'
import { HiXMark } from 'react-icons/hi2'

const TYPOGRAPHY_TEXT_KEYWORDS = new Set([
  'left', 'center', 'right', 'justify',
  'xs', 'sm', 'base', 'lg', 'xl',
])

const COLOR_NAMES = new Set([
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia',
  'pink', 'rose', 'white', 'black', 'transparent',
  'inherit', 'current',
])

export function categorizeClass(className) {
  // Spacing: m-, p-, gap-
  if (/^-?(m|p)(x|y|t|r|b|l|s|e)?-/.test(className) || /^gap(-x|-y)?-/.test(className)) {
    return 'spacing'
  }

  // Sizing: w-, h-, min-w-, min-h-, max-w-, max-h-
  if (/^(w|h)-/.test(className) || /^(min|max)-(w|h)-/.test(className)) {
    return 'sizing'
  }

  // Layout: flex, grid, block, inline, items-, justify-, hidden
  if (/^(flex|grid|block|inline|hidden)$/.test(className) ||
      /^(items|justify)-/.test(className) ||
      /^(inline-flex|inline-grid|inline-block)$/.test(className)) {
    return 'layout'
  }

  // Typography vs Color for text- prefix
  if (/^text-/.test(className)) {
    const suffix = className.slice(5) // remove "text-"
    // text-left, text-center, etc. → typography
    if (['left', 'center', 'right', 'justify', 'wrap', 'nowrap', 'balance', 'pretty'].includes(suffix)) {
      return 'typography'
    }
    // text-xs, text-sm, text-base, text-lg, text-xl, text-2xl..text-9xl → typography
    if (TYPOGRAPHY_TEXT_KEYWORDS.has(suffix) || /^\d*xl$/.test(suffix)) {
      return 'typography'
    }
    // Otherwise it's a color (text-red-500, text-white, text-black, etc.)
    const colorPart = suffix.split('-')[0]
    if (COLOR_NAMES.has(colorPart)) {
      return 'colors'
    }
    // Fallback for text- that doesn't match known patterns
    return 'typography'
  }

  // Typography: font-, leading-, tracking-
  if (/^(font|leading|tracking)-/.test(className)) {
    return 'typography'
  }

  // Colors: bg- (with color name), border- (with color name)
  if (/^bg-/.test(className)) {
    const suffix = className.slice(3)
    const colorPart = suffix.split('-')[0]
    if (COLOR_NAMES.has(colorPart)) {
      return 'colors'
    }
    // bg-opacity, bg-gradient, etc. → other (or effects)
    return 'other'
  }

  if (/^border-/.test(className)) {
    const suffix = className.slice(7)
    const colorPart = suffix.split('-')[0]
    if (COLOR_NAMES.has(colorPart)) {
      return 'colors'
    }
    // border with non-color suffix (border-2, border-t, etc.) → effects
    return 'effects'
  }

  // Effects: rounded, shadow, border (standalone), opacity-
  if (/^(rounded|shadow)/.test(className) || /^border$/.test(className) ||
      /^border-\d/.test(className) || /^opacity-/.test(className)) {
    return 'effects'
  }

  return 'other'
}

const CATEGORY_COLORS = {
  spacing: 'bg-blue-100 text-blue-800',
  sizing: 'bg-green-100 text-green-800',
  layout: 'bg-purple-100 text-purple-800',
  colors: 'bg-amber-100 text-amber-800',
  typography: 'bg-indigo-100 text-indigo-800',
  effects: 'bg-rose-100 text-rose-800',
  other: 'bg-gray-100 text-gray-800',
}

export default function ClassTagList() {
  const { selectedComponentId, getComponentClasses, removeClass } = useLayout()

  if (!selectedComponentId) return null

  const classes = getComponentClasses(selectedComponentId)

  if (classes.length === 0) {
    return <p className="text-sm text-gray-500">No classes applied</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {classes.map((cls) => {
        const category = categorizeClass(cls)
        const colorClasses = CATEGORY_COLORS[category]
        return (
          <span
            key={cls}
            data-testid="class-tag"
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}
          >
            {cls}
            <button
              type="button"
              aria-label={`Remove ${cls}`}
              onClick={() => removeClass(selectedComponentId, cls)}
              className="hover:bg-black/10 rounded-full p-0.5"
            >
              <HiXMark className="w-3 h-3" />
            </button>
          </span>
        )
      })}
    </div>
  )
}
