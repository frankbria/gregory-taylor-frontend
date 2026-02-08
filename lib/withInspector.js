'use client'

import { useEffect, useRef } from 'react'
import { useInspector } from '@/lib/InspectorContext'

export default function withInspector(WrappedComponent, config) {
  const { componentName, filePath } = config

  function InspectorWrapper(props) {
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev) {
      return <WrappedComponent {...props} />
    }

    return <InspectorWrapperInner {...props} />
  }

  function InspectorWrapperInner(props) {
    const { register, unregister, generateId } = useInspector()
    const idRef = useRef(null)

    if (!idRef.current) {
      idRef.current = generateId(componentName)
    }

    const inspectorId = idRef.current

    useEffect(() => {
      register(inspectorId, {
        componentName,
        filePath,
        props,
      })

      return () => {
        unregister(inspectorId)
      }
    }, [inspectorId, register, unregister, props])

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
