'use client'

import { useEffect, useRef } from 'react'
import { useInspector } from '@/lib/InspectorContext'

export default function withInspector(WrappedComponent, config) {
  const { componentName, filePath } = config

  // In production, return the component unwrapped at module level
  // so bundlers can tree-shake all inspector code
  if (process.env.NODE_ENV !== 'development') {
    WrappedComponent.displayName = WrappedComponent.displayName || componentName
    return WrappedComponent
  }

  function InspectorWrapper(props) {
    const { register, unregister, generateId } = useInspector()
    const idRef = useRef(null)
    const propsRef = useRef(props)
    propsRef.current = props

    if (!idRef.current) {
      idRef.current = generateId(componentName)
    }

    const inspectorId = idRef.current

    useEffect(() => {
      register(inspectorId, {
        componentName,
        filePath,
        props: propsRef.current,
      })

      return () => {
        unregister(inspectorId)
      }
    }, [inspectorId, register, unregister])

    return (
      <div
        data-inspector-id={inspectorId}
        data-inspector-component={componentName}
        data-inspector-file={filePath}
        style={{ position: 'relative' }}
      >
        <WrappedComponent {...props} />
      </div>
    )
  }

  InspectorWrapper.displayName = `withInspector(${componentName})`
  return InspectorWrapper
}
