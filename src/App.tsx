import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CourseList from './pages/CourseList'
import Labs from './pages/Labs'
import Cases from './pages/Cases'
import About from './pages/About'
import NotFound from './pages/NotFound'

// 懒加载：把重依赖（Recharts、KaTeX 字体等）拆出首屏
const LessonPage = lazy(() => import('./pages/LessonPage'))
const LabPage = lazy(() => import('./pages/LabPage'))
const CaseDetail = lazy(() => import('./pages/CaseDetail'))
const Wrong = lazy(() => import('./pages/Wrong'))
const Profile = lazy(() => import('./pages/Profile'))

function Loading() {
  return (
    <div className="shell flex items-center justify-center py-24">
      <div className="text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-linesoft border-t-navy" />
        <p className="meta mt-3">载入中…</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/course" element={<CourseList />} />
        <Route
          path="/lesson/:id"
          element={
            <Suspense fallback={<Loading />}>
              <LessonPage />
            </Suspense>
          }
        />
        <Route path="/labs" element={<Labs />} />
        <Route
          path="/labs/:id"
          element={
            <Suspense fallback={<Loading />}>
              <LabPage />
            </Suspense>
          }
        />
        <Route
          path="/wrong"
          element={
            <Suspense fallback={<Loading />}>
              <Wrong />
            </Suspense>
          }
        />
        <Route
          path="/me"
          element={
            <Suspense fallback={<Loading />}>
              <Profile />
            </Suspense>
          }
        />
        <Route path="/cases" element={<Cases />} />
        <Route
          path="/cases/:id"
          element={
            <Suspense fallback={<Loading />}>
              <CaseDetail />
            </Suspense>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
