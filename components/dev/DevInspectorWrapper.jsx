'use client'

import { InspectorProvider } from '@/lib/InspectorContext'
import ElementInspector from '@/components/dev/ElementInspector'
import InspectorToggle from '@/components/dev/InspectorToggle'

export default function DevInspectorWrapper({ children }) {
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev) {
    return <>{children}</>
  }

  return (
    <InspectorProvider>
      {children}
      <ElementInspector />
      <InspectorToggle />
    </InspectorProvider>
  )
}
