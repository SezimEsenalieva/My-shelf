// Анимация «корешок → обложка» по приёму FLIP (First, Last, Invert, Play):
// 1) узнаём, где корешок (First), 2) где будет большая обложка (Last),
// 3) ставим обложку туда, где был корешок, сжав её до его размера (Invert),
// 4) и плавно отпускаем на место (Play). Браузер анимирует только transform — это быстро.

const DURATION = 380
const EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

interface FlipOptions {
  origin?: HTMLElement | null
  cover: HTMLElement | null
  /** Цветная «краска» корешка поверх обложки: видна в начале и плавно исчезает. */
  face: HTMLElement | null
  backdrop: HTMLElement | null
  details: HTMLElement | null
  direction: 'open' | 'close'
}

export async function animateFromOrigin(options: FlipOptions): Promise<void> {
  const { origin, cover, face, backdrop, details, direction } = options
  if (!cover || typeof cover.animate !== 'function') return

  const opening = direction === 'open'
  const timing = (extra: KeyframeAnimationOptions = {}): KeyframeAnimationOptions => ({
    duration: DURATION,
    easing: EASING,
    fill: 'both',
    direction: opening ? 'normal' : 'reverse',
    ...extra,
  })

  const animations: Animation[] = []
  animations.push(
    ...fade(backdrop, timing()),
    ...fade(details, timing({ duration: DURATION * 0.6, delay: opening ? DURATION * 0.4 : 0 })),
  )

  const from = origin?.isConnected ? origin.getBoundingClientRect() : undefined
  const to = cover.getBoundingClientRect()

  if (!from || from.width === 0 || to.width === 0) {
    // Не знаем, откуда лететь (например, корешок уже убран) — просто увеличиваем из центра.
    animations.push(
      cover.animate(
        [
          { transform: 'scale(0.85)', opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        timing(),
      ),
    )
  } else {
    const dx = from.left + from.width / 2 - (to.left + to.width / 2)
    const dy = from.top + from.height / 2 - (to.top + to.height / 2)
    const sx = from.width / to.width
    const sy = from.height / to.height
    // Во всех кадрах одинаковый набор функций transform — так браузер плавно их интерполирует.
    const at = (x: number, y: number, scaleX: number, scaleY: number, turn: number) =>
      `perspective(900px) translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY}) rotateY(${turn}deg)`

    animations.push(
      cover.animate(
        [
          // корешок чуть выдвигается вверх…
          { transform: at(dx, dy, sx, sy, 0), offset: 0, easing: 'ease-out' },
          { transform: at(dx, dy - 18, sx, sy, 0), offset: 0.25, easing: 'ease-in-out' },
          // …поворачивается и превращается в обложку
          {
            transform: at(dx * 0.35, dy * 0.35, 0.75, 0.85, -28),
            offset: 0.65,
            easing: 'ease-out',
          },
          { transform: at(0, 0, 1, 1, 0), offset: 1 },
        ],
        // Плавность задана для каждого этапа отдельно, поэтому общая — равномерная.
        timing({ duration: DURATION * 1.1, easing: 'linear' }),
      ),
    )
    if (face) {
      animations.push(
        face.animate(
          [
            { opacity: 1, offset: 0 },
            { opacity: 1, offset: 0.3 },
            { opacity: 0, offset: 0.7 },
            { opacity: 0, offset: 1 },
          ],
          timing({ duration: DURATION * 1.1, easing: 'linear' }),
        ),
      )
    }
  }

  await Promise.allSettled(animations.map((a) => a.finished))
  // На открытии убираем «застывшие» стили анимации, чтобы не мешали свайпу.
  if (opening) for (const a of animations) a.cancel()
}

function fade(el: HTMLElement | null, options: KeyframeAnimationOptions): Animation[] {
  if (!el || typeof el.animate !== 'function') return []
  return [el.animate([{ opacity: 0 }, { opacity: 1 }], options)]
}
