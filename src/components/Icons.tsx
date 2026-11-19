type P = { className?: string }
const base = 'h-[19px] w-[19px]'

export const IconHome = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={`${base} ${className}`}>
    <path d="M4 10.5 12 4l8 6.5V20H4z" strokeLinejoin="round" />
    <path d="M9.5 20v-5.5h5V20" />
  </svg>
)

export const IconBook = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={`${base} ${className}`}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5A1.5 1.5 0 0 0 20 18.5z" />
  </svg>
)

export const IconLab = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={`${base} ${className}`}>
    <path d="M4 20h16M5 20V4M5 20l4-6 3 3 3-7 4 4" strokeLinejoin="round" />
    <circle cx="9" cy="14" r="1" />
    <circle cx="12" cy="17" r="1" />
  </svg>
)

export const IconWrong = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={`${base} ${className}`}>
    <path d="M6 3.5h9L19 7.5v13H6z" strokeLinejoin="round" />
    <path d="M14 3.5V8h5" />
    <path d="M9.5 13.5l5 5M14.5 13.5l-5 5" />
  </svg>
)

export const IconUser = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={`${base} ${className}`}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M4.5 20.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" strokeLinecap="round" />
  </svg>
)

export const IconArrow = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={`${base} ${className}`}>
    <path d="M4 12h15M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const IconCheck = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={`${base} ${className}`}>
    <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const IconBookmark = ({ className = '', filled = false }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" className={`${base} ${className}`}>
    <path d="M6 4h12v16l-6-4.5L6 20z" strokeLinejoin="round" />
  </svg>
)
