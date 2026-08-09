// Stands in for next/link outside Next — renders a plain anchor so preview
// cards keep the real markup and styling the site relies on.
import * as React from 'react'

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string | { pathname?: string }
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
  shallow?: boolean
}

export default function Link({
  href,
  prefetch: _prefetch,
  replace: _replace,
  scroll: _scroll,
  shallow: _shallow,
  children,
  ...rest
}: LinkProps) {
  const resolved = typeof href === 'string' ? href : href?.pathname ?? '#'
  return (
    <a href={resolved} {...rest}>
      {children}
    </a>
  )
}
