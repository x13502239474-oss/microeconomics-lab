import { Link, useParams } from 'react-router-dom'
import { labById, labs } from '../content/labs'
import { getLesson } from '../content'
import SupplyDemandLab from '../labs/SupplyDemandLab'
import ElasticityLab from '../labs/ElasticityLab'
import TaxLab from '../labs/TaxLab'
import CostLab from '../labs/CostLab'
import ProfitLab from '../labs/ProfitLab'
import StructureLab from '../labs/StructureLab'
import ExternalityLab from '../labs/ExternalityLab'
import { IconArrow } from '../components/Icons'
import NotFound from './NotFound'

const MAP: Record<string, () => JSX.Element> = {
  'supply-demand': SupplyDemandLab,
  elasticity: ElasticityLab,
  tax: TaxLab,
  cost: CostLab,
  profit: ProfitLab,
  structure: StructureLab,
  externality: ExternalityLab,
}

export default function LabPage() {
  const { id } = useParams()
  const meta = id ? labById.get(id) : undefined
  const Comp = id ? MAP[id] : undefined
  if (!meta || !Comp) return <NotFound />
  const lesson = getLesson(meta.lessonId)
  const others = labs.filter((l) => l.id !== meta.id).slice(0, 2)

  return (
    <div>
      <div className="shell pt-5">
        <Link to="/labs" className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted hover:text-ink">
          <IconArrow className="h-3.5 w-3.5 rotate-180" /> 返回实验室
        </Link>
      </div>
      <Comp />
      <div className="shell -mt-2 pb-14">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          {lesson ? (
            <Link to={`/lesson/${lesson.id}`} className="text-[12.5px] text-navy hover:underline">
              相关课程：{lesson.title} →
            </Link>
          ) : (
            <span />
          )}
          <div className="flex gap-4">
            {others.map((o) => (
              <Link key={o.id} to={`/labs/${o.id}`} className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:text-ink">
                {o.no} {o.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
