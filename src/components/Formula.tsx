import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export function Formula({
  tex,
  display = true,
  className = '',
}: {
  tex: string
  display?: boolean
  className?: string
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        trust: false,
      })
    } catch {
      return tex
    }
  }, [tex, display])
  return (
    <span
      className={className}
      // KaTeX 输出为可信的本地渲染结果
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
