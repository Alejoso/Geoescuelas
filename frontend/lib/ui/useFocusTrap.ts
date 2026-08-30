import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Keeps Tab inside `containerRef` while it is mounted, and returns focus to
 * whatever was focused before on unmount.
 *
 * The container must be focusable (`tabIndex={-1}`) so focus has somewhere to
 * land when it holds no focusable children — during a loading state, say.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current
    if (container === null) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    // Queried on every Tab rather than once, because the modal's contents
    // change as the request resolves.
    function listFocusable(): HTMLElement[] {
      return Array.from(container!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    }

    const initialTarget = listFocusable()[0] ?? container
    initialTarget.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return

      const focusable = listFocusable()

      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
        return
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [containerRef])
}