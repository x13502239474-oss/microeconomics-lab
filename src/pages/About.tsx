import { Link } from 'react-router-dom'
import { lessons, stages, totalQuestions } from '../content'

const CHAPTER_MAP = [
  ['第一阶段', '第 1–3 章', '经济学十大原理、像经济学家一样思考、相互依存与贸易', '10'],
  ['第二阶段', '第 4–5 章', '供给与需求的市场力量、弹性及其应用', '11'],
  ['第三阶段', '第 6–9 章', '政府政策、消费者与生产者剩余、赋税成本、国际贸易', '10'],
  ['第四阶段', '第 14、22 章', '生产成本、消费者选择理论', '10'],
  ['第五阶段', '第 15–18 章', '竞争市场中的企业、垄断、垄断竞争、寡头', '11'],
  ['第六阶段', '第 10–11、23 章', '外部性、公共物品与公共资源、微观经济学前沿', '10'],
]

const NOT_COVERED = [
  ['第 12 章', '医疗经济学', '信息不对称、保险与医疗体系的应用章节，可在掌握第 10、23 章后自学。'],
  ['第 13 章', '税制的设计', '税收效率与公平的制度细节，本课程在第 8 章已讲税收的福利成本。'],
  ['第 19–21 章', '生产要素市场、收入与歧视、收入不平等与贫困', '劳动与收入分配专题，属于微观经济学的延伸应用，不影响前六阶段的分析框架。'],
]

export default function About() {
  return (
    <article className="shell max-w-[820px] pb-14 pt-7 sm:pt-10">
      <header className="border-b border-line pb-5">
        <div className="eyebrow">Colophon</div>
        <h1 className="mt-2 text-[28px] tracking-tight sm:text-[36px]">教材与版权说明</h1>
        <p className="mt-2 text-[13px] leading-[1.9] text-muted">
          本网站是一门以曼昆《经济学原理·微观经济学分册》知识体系为骨架的互动自学课程，不是教材的电子版，也不替代原书。
        </p>
      </header>

      <section className="mt-7 space-y-3">
        <h2 className="text-[18px]">一、教材版本</h2>
        <p className="text-[13.5px] leading-[1.95] text-ink2">
          主教材为 N. 格里高利·曼昆《经济学原理（第 10 版）· 微观经济学分册》。第 10 版共 7 篇 23 章，
          其中第 12 章「医疗经济学」为本版新增。课程目录按该版本的章序核对，章节编号与篇名以纸质书为准。
        </p>
        <div className="border-l-2 border-copper bg-[#FBF7EE] p-3 text-[12.5px] leading-[1.9] text-ink2">
          说明：课程讲解由本站重新组织与撰写，不使用教材原文段落，不虚构原文、页码或引文。涉及教材结构时只标注章号与节号。
          案例中的数字为课堂算例或公开量级，不构成统计引用。
        </div>
      </section>

      <section className="mt-7">
        <h2 className="text-[18px]">二、课程结构对照</h2>
        <div className="mt-3 divide-y divide-linesoft border border-line sm:hidden">
          {CHAPTER_MAP.map((r) => (
            <div key={r[0]} className="p-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-ink">{r[0]}</span>
                <span className="tabnum font-mono text-[10px] text-copper">{r[3]} 讲</span>
              </div>
              <div className="mt-0.5 text-[11px] text-muted">{r[1]}</div>
              <p className="mt-1 text-[12px] leading-[1.8] text-ink2">{r[2]}</p>
            </div>
          ))}
          <div className="bg-[#FBF7EE] p-3 text-[12px] text-ink2">
            合计 18 章 · 61 个知识点拆分为 {lessons.length} 讲
          </div>
        </div>
        <div className="mt-3 hidden overflow-x-auto border border-line sm:block">
          <table className="w-full min-w-[560px] border-collapse text-left text-[12px]">
            <thead>
              <tr className="border-b border-line bg-[#F4EFE3]">
                {['阶段', '教材章节', '核心内容', '讲数'].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium text-ink">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHAPTER_MAP.map((r) => (
                <tr key={r[0]} className="border-b border-linesoft last:border-0">
                  <td className="px-3 py-2 text-ink">{r[0]}</td>
                  <td className="px-3 py-2 text-ink2">{r[1]}</td>
                  <td className="px-3 py-2 leading-relaxed text-muted">{r[2]}</td>
                  <td className="tabnum px-3 py-2 text-ink2">{r[3]}</td>
                </tr>
              ))}
              <tr className="bg-[#FBF7EE]">
                <td className="px-3 py-2 text-ink">合计</td>
                <td className="px-3 py-2 text-ink2">18 章</td>
                <td className="px-3 py-2 text-muted">六个阶段，61 个知识点拆分为 {lessons.length} 讲</td>
                <td className="tabnum px-3 py-2 text-ink">{lessons.length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-7">
        <h2 className="text-[18px]">三、未纳入主线的章节</h2>
        <p className="mt-2 text-[13px] leading-[1.95] text-muted">
          为保证主线聚焦于「选择—市场—企业—失灵」的分析链条，以下章节未单独设课，但相关工具已在前六阶段讲清：
        </p>
        <div className="mt-3 space-y-2">
          {NOT_COVERED.map((n) => (
            <div key={n[0]} className="border border-line p-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-[11px] text-copper">{n[0]}</span>
                <span className="text-[13px] text-ink">{n[1]}</span>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">{n[2]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="text-[18px]">四、编写原则</h2>
        <ul className="mt-2 space-y-2">
          {[
            '先给生活化解释，再给严格定义；术语第一次出现时用大白话说明。',
            '公式必须写明变量含义与适用条件，计算例题均可手算复核。',
            '图表与实验室共用同一套计算函数，正文、工具与答案保持一致。',
            '区分理论模型与真实世界：模型给出方向性结论，现实需要结合制度与数据。',
            '每讲配 3–4 道题，答对 60% 视为通过；错题自动进入错题本，重做答对后移出。',
          ].map((t, i) => (
            <li key={i} className="flex gap-3 text-[13px] leading-[1.9] text-ink2">
              <span className="mt-[9px] h-[3px] w-[3px] shrink-0 bg-copper" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-7">
        <h2 className="text-[18px]">五、技术与数据</h2>
        <p className="text-[13px] leading-[1.95] text-ink2">
          前端使用 React + TypeScript + Vite + Tailwind CSS；公式由 KaTeX 渲染，部分统计图使用 Recharts。
          学习进度、答题记录、收藏与笔记保存在浏览器 LocalStorage，不上传服务器，也不需要登录。
          换设备时可在「我的」页面导出 JSON 备份并导入。云端同步适配器接口已预留（<code className="font-mono text-[11px]">src/lib/sync.ts</code>），接入后端时无需改动业务逻辑。
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-muted">
          当前共 {lessons.length} 讲、{totalQuestions} 道练习、{stages.length} 个阶段；七个实验室与八个案例独立成页。
        </p>
      </section>

      <nav className="mt-9 flex flex-wrap gap-3 border-t border-line pt-4">
        <Link to="/course" className="btn-primary">
          返回课程目录
        </Link>
        <Link to="/" className="btn-outline">
          回到首页
        </Link>
      </nav>
    </article>
  )
}
