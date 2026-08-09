// Stands in for next/navigation outside Next. Nav reads usePathname to mark
// the active link; the rest are inert so a preview never crashes on them.
export function usePathname(): string {
  return '/'
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams()
}

export function useParams(): Record<string, string> {
  return {}
}

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
    prefetch: () => {},
  }
}

export function redirect(_url: string): never {
  throw new Error('redirect() is not available in a design-system preview')
}

export function notFound(): never {
  throw new Error('notFound() is not available in a design-system preview')
}
