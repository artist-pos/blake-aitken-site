// Stands in for next/dynamic outside Next, backed by React.lazy + Suspense so
// the deferred component still actually mounts inside a preview card.
import * as React from 'react'

type ModuleLike<P> = { default: React.ComponentType<P> } | React.ComponentType<P>

export interface DynamicOptions {
  ssr?: boolean
  loading?: React.ComponentType
}

export default function dynamic<P extends object>(
  loader: () => Promise<ModuleLike<P>>,
  options?: DynamicOptions
): React.ComponentType<P> {
  const Lazy = React.lazy(async () => {
    const mod = await loader()
    const resolved =
      typeof mod === 'object' && mod !== null && 'default' in mod
        ? (mod as { default: React.ComponentType<P> }).default
        : (mod as React.ComponentType<P>)
    return { default: resolved }
  })

  const Loading = options?.loading

  return function DynamicComponent(props: P) {
    return React.createElement(
      React.Suspense,
      { fallback: Loading ? React.createElement(Loading) : null },
      React.createElement(Lazy, props as React.Attributes & P)
    )
  }
}
