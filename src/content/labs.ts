export type LabMeta = {
  id: string
  no: string
  title: string
  en: string
  desc: string
  tags: string[]
  lessonId: string
}

export const labs: LabMeta[] = [
  {
    id: 'supply-demand',
    no: '01',
    title: '供需市场模拟器',
    en: 'Supply & Demand',
    desc: '调整价格、需求强度、供给成本与市场规模，实时观察均衡价格、均衡数量以及短缺与过剩。',
    tags: ['均衡', '短缺', '过剩'],
    lessonId: 's2-14',
  },
  {
    id: 'elasticity',
    no: '02',
    title: '弹性计算器',
    en: 'Elasticity',
    desc: '输入价格与数量变化，用中点法计算需求价格弹性，比较食品、汽油、奢侈品与日用品的敏感度。',
    tags: ['中点法', '总收益'],
    lessonId: 's2-17',
  },
  {
    id: 'tax',
    no: '03',
    title: '税收模拟器',
    en: 'Tax Incidence',
    desc: '调整单位税额，观察消费者支付价、生产者净得价、税收收入、无谓损失与税负分担。',
    tags: ['楔子', '归宿', '无谓损失'],
    lessonId: 's3-26',
  },
  {
    id: 'cost',
    no: '04',
    title: '企业成本实验室',
    en: 'Cost Curves',
    desc: '调整产量、固定成本与可变成本参数，自动计算 TC、AFC、AVC、ATC、MC，观察成本曲线族。',
    tags: ['ATC', 'MC', '规模'],
    lessonId: 's4-36',
  },
  {
    id: 'profit',
    no: '05',
    title: '企业利润模拟器',
    en: 'Profit Maximisation',
    desc: '设定价格与产量，计算总收益、总成本与利润；用 MR = MC 找到真正的利润最大化产量。',
    tags: ['MR = MC', '利润'],
    lessonId: 's5-43',
  },
  {
    id: 'structure',
    no: '06',
    title: '市场结构模拟器',
    en: 'Market Structure',
    desc: '同一需求、同一成本下，比较完全竞争、垄断、垄断竞争与古诺寡头的定价、产量、利润与福利。',
    tags: ['垄断', '寡头', '福利'],
    lessonId: 's5-52',
  },
  {
    id: 'externality',
    no: '07',
    title: '外部性模拟器',
    en: 'Externalities',
    desc: '模拟污染企业与周边居民：私人成本、社会成本、市场均衡、社会最优与庇古税的效果。',
    tags: ['庇古税', '社会成本'],
    lessonId: 's6-53',
  },
]

export const labById = new Map(labs.map((l) => [l.id, l]))
