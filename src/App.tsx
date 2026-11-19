import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CourseList from './pages/CourseList'
import LessonPage from './pages/LessonPage'
import Labs from './pages/Labs'
import LabPage from './pages/LabPage'
import Wrong from './pages/Wrong'
import Profile from './pages/Profile'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import About from './pages/About'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/course" element={<CourseList />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/labs/:id" element={<LabPage />} />
        <Route path="/wrong" element={<Wrong />} />
        <Route path="/me" element={<Profile />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
