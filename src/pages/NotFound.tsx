import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70vh] flex-col items-start justify-center py-16">
      <div className="eyebrow">Error 404</div>
      <h1 className="mt-3 font-serif text-[54px] leading-none tracking-tight text-ink">页面不存在</h1>
      <p className="mt-3 max-w-[28rem] text-[13px] leading-[1.9] text-muted">
        这个地址没有对应的课程或实验。可能是链接过期，也可能是课程编号写错了。
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn-primary">
          回到首页
        </Link>
        <Link to="/course" className="btn-outline">
          课程目录
        </Link>
      </div>
    </div>
  )
}
