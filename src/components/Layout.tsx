import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { IconBook, IconHome, IconLab, IconUser, IconWrong } from './Icons'
import { useStore } from '../lib/store'
import { totalLessons } from '../content'

const NAV = [
  { to: '/', label: '首页', en: 'OVERVIEW', icon: IconHome },
  { to: '/course', label: '课程', en: 'CURRICULUM', icon: IconBook },
  { to: '/labs', label: '实验室', en: 'LABORATORY', icon: IconLab },
  { to: '/wrong', label: '错题', en: 'ERRATA', icon: IconWrong },
  { to: '/me', label: '我的', en: 'PROFILE', icon: IconUser },
]

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="select-none">
      <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-copper">Microeconomics Lab</div>
      <div className={`font-serif tracking-tight text-ink ${compact ? 'text-[16px]' : 'text-[19px]'}`}>
        微观经济学研究所
      </div>
    </div>
  )
}

export default function Layout() {
  const { state } = useStore()
  const loc = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [loc.pathname])

  return (
    <div className="min-h-screen">
      {/* 桌面端侧栏 */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] flex-col border-r border-line bg-[#FBF7EE] px-7 py-9 lg:flex">
        <NavLink to="/" className="block">
          <Brand />
        </NavLink>
        <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
          Principles of Microeconomics · {totalLessons} Lectures
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-0.5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 py-3 pl-3 pr-2 text-[14px] transition-colors ${
                  isActive ? 'text-ink' : 'text-muted hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 ${
                      isActive ? 'bg-copper' : 'bg-transparent'
                    }`}
                  />
                  <n.icon className={isActive ? 'text-navy' : 'text-steel'} />
                  <span className="tracking-wide">{n.label}</span>
                  <span className="ml-auto font-mono text-[8px] tracking-[0.14em] text-muted/70">{n.en}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line pt-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">Streak</span>
            <span className="tabnum font-serif text-[15px] text-ink">{state.streak} 天</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">Storage</span>
            <span className="text-[10px] text-muted">本地 · 已自动保存</span>
          </div>
          <NavLink to="/about" className="mt-4 block font-mono text-[9px] uppercase tracking-[0.18em] text-copper hover:underline">
            教材说明 / Colophon
          </NavLink>
        </div>
      </aside>

      {/* 移动端顶栏 */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/92 backdrop-blur lg:hidden">
        <div className="flex h-[58px] items-center justify-between px-5">
          <NavLink to="/">
            <Brand compact />
          </NavLink>
          <div className="text-right">
            <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted">Streak</div>
            <div className="tabnum font-serif text-[13px] leading-tight text-ink">{state.streak} 天</div>
          </div>
        </div>
      </header>

      <main className="pb-safe lg:pl-[250px]">
        <Outlet />
        <footer className="mt-6 hidden border-t border-line/70 lg:block">
          <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-3 px-5 py-6">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              Microeconomics Lab · 讲义自编，非教材原文
            </span>
            <div className="flex items-center gap-5">
              <NavLink to="/cases" className="text-[11px] text-muted hover:text-ink">
                案例库
              </NavLink>
              <NavLink to="/about" className="text-[11px] text-muted hover:text-ink">
                教材与版权说明 →
              </NavLink>
            </div>
          </div>
        </footer>
      </main>

      {/* 移动端底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-[#FBF7EE]/97 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] pt-2.5 ${
                  isActive ? 'text-navy' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <n.icon className={isActive ? 'text-navy' : 'text-steel/80'} />
                  <span className={`text-[10px] tracking-wide ${isActive ? 'text-ink' : ''}`}>{n.label}</span>
                  <span className={`h-[2px] w-4 ${isActive ? 'bg-copper' : 'bg-transparent'}`} />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
