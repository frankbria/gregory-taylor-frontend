'use client'

import { useState, useMemo, useCallback } from 'react'
import { HiChevronRight, HiChevronDown } from 'react-icons/hi2'
import { useLayout } from '@/lib/LayoutContext'

const TYPE_BADGE_STYLES = {
  layout: 'bg-gray-100 text-gray-700',
  section: 'bg-blue-100 text-blue-700',
  element: 'bg-green-100 text-green-700',
}

function matchesFilter(node, filter) {
  const lowerFilter = filter.toLowerCase()
  if (node.label.toLowerCase().includes(lowerFilter)) return true
  if (node.children) {
    return node.children.some(child => matchesFilter(child, filter))
  }
  return false
}

function TreeNode({ node, expandedIds, onToggle, selectedId, onSelect, getComponentClasses, filter }) {
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedId === node.id
  const classes = getComponentClasses(node.id)
  const classCount = classes.length
  const expanded = expandedIds.has(node.id)

  const isAutoExpanded = filter && hasChildren && node.children.some(child =>
    matchesFilter(child, filter)
  )
  const showChildren = hasChildren && (expanded || isAutoExpanded)

  return (
    <div>
      <div
        data-testid={`tree-node-${node.id}`}
        className={`flex items-center py-2 px-3 cursor-pointer transition rounded ${
          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'
        }`}
      >
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            aria-label="toggle"
            className="mr-1 p-0.5 rounded hover:bg-gray-200 transition"
          >
            {showChildren ? (
              <HiChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <HiChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        ) : (
          <span className="w-5 mr-1" />
        )}

        <span
          onClick={() => onSelect(node.id)}
          className="flex-1 text-sm font-medium text-gray-800"
        >
          {node.label}
        </span>

        <span className={`text-xs px-1.5 py-0.5 rounded-full ${TYPE_BADGE_STYLES[node.type] || ''}`}>
          {node.type}
        </span>

        {classCount > 0 && (
          <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
            {classCount}
          </span>
        )}
      </div>

      {showChildren && (
        <div className="pl-6">
          {node.children
            .filter(child => !filter || matchesFilter(child, filter))
            .map(child => (
              <TreeNode
                key={child.id}
                node={child}
                expandedIds={expandedIds}
                onToggle={onToggle}
                selectedId={selectedId}
                onSelect={onSelect}
                getComponentClasses={getComponentClasses}
                filter={filter}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export default function ComponentTree({ className = '' }) {
  const { selectedComponentId, tree, selectComponent, getComponentClasses } = useLayout()
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [filter, setFilter] = useState('')

  const toggleNode = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const allNodeIds = useMemo(() => {
    const ids = []
    function collect(nodes) {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          ids.push(node.id)
        }
        if (node.children) collect(node.children)
      }
    }
    collect(tree)
    return ids
  }, [tree])

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(allNodeIds))
  }, [allNodeIds])

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set())
  }, [])

  const filteredTree = useMemo(() => {
    if (!filter) return tree
    return tree.filter(node => matchesFilter(node, filter))
  }, [tree, filter])

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search components..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={expandAll}
          className="text-xs text-blue-600 hover:text-blue-800 transition"
        >
          Expand all
        </button>
        <button
          onClick={collapseAll}
          className="text-xs text-blue-600 hover:text-blue-800 transition"
        >
          Collapse all
        </button>
      </div>

      <div>
        {filteredTree.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            expandedIds={expandedIds}
            onToggle={toggleNode}
            selectedId={selectedComponentId}
            onSelect={selectComponent}
            getComponentClasses={getComponentClasses}
            filter={filter}
          />
        ))}
      </div>
    </div>
  )
}
