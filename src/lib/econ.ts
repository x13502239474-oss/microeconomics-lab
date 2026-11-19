/**
 * 经济学计算内核。
 * 所有实验、例题、图表共用同一套函数，保证「正文 / 工具 / 答案」三方一致。
 * 价格与数量均为线性设定：需求 P = a - bQ，供给 P = c + dQ。
 */

export type Market = { a: number; b: number; c: number; d: number }

export const round = (n: number, d = 2) => {
  const p = Math.pow(10, d)
  return Math.round((n + Number.EPSILON) * p) / p
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export const num = (n: number, d = 2) => {
  if (!Number.isFinite(n)) return '—'
  const r = round(n, d)
  return r.toLocaleString('zh-CN', { maximumFractionDigits: d })
}

/** 需求量（价格 P 下） */
export const qtyDemanded = (m: Market, p: number) => (m.a - p) / m.b
/** 供给量（价格 P 下） */
export const qtySupplied = (m: Market, p: number) => (p - m.c) / m.d

export type Equilibrium = { price: number; qty: number }

export function equilibrium(m: Market): Equilibrium {
  const qty = (m.a - m.c) / (m.b + m.d)
  const price = m.a - m.b * qty
  return { price, qty }
}

/** 从量税 t 由卖者缴纳：消费者价格 Pc，生产者净得 Ps = Pc - t */
export function taxOutcome(m: Market, t: number) {
  const q0 = equilibrium(m)
  const qty = Math.max(0, (m.a - m.c - t) / (m.b + m.d))
  const pc = m.a - m.b * qty
  const ps = pc - t
  const revenue = t * qty
  const cs = 0.5 * Math.max(0, m.a - pc) * qty
  const psurplus = 0.5 * Math.max(0, ps - m.c) * qty
  const dwl = 0.5 * t * Math.max(0, q0.qty - qty)
  const consumerIncidence = pc - q0.price
  const producerIncidence = q0.price - ps
  return {
    qty,
    pc,
    ps,
    revenue,
    cs,
    producerSurplus: psurplus,
    dwl,
    consumerIncidence,
    producerIncidence,
    consumerShare: consumerIncidence / (consumerIncidence + producerIncidence || 1),
    producerShare: producerIncidence / (consumerIncidence + producerIncidence || 1),
  }
}

/** 中点法需求价格弹性（取绝对值） */
export function midpointElasticity(p1: number, p2: number, q1: number, q2: number) {
  const dq = (q2 - q1) / ((q1 + q2) / 2)
  const dp = (p2 - p1) / ((p1 + p2) / 2)
  return Math.abs(dq / dp)
}

/** 点弹性：线性需求 P = a - bQ 在价格 P 处 */
export function pointElasticity(a: number, b: number, p: number) {
  const q = (a - p) / b
  return q <= 0 ? 0 : (p / q) * (1 / b)
}

export type CostParams = { fc: number; v1: number; v2: number }

export const totalCost = (cp: CostParams, q: number) => cp.fc + cp.v1 * q + cp.v2 * q * q
export const marginalCost = (cp: CostParams, q: number) => cp.v1 + 2 * cp.v2 * q
export const avgFixed = (cp: CostParams, q: number) => (q > 0 ? cp.fc / q : 0)
export const avgVar = (cp: CostParams, q: number) => cp.v1 + cp.v2 * q
export const avgTotal = (cp: CostParams, q: number) => (q > 0 ? totalCost(cp, q) / q : 0)
/** ATC 最低点产量：Q = sqrt(FC / v2) */
export const minAtcQty = (cp: CostParams) => (cp.v2 > 0 ? Math.sqrt(cp.fc / cp.v2) : 0)

export function costTable(cp: CostParams, q: number) {
  const tc = totalCost(cp, q)
  return {
    q,
    tc,
    fc: cp.fc,
    vc: tc - cp.fc,
    afc: avgFixed(cp, q),
    avc: avgVar(cp, q),
    atc: avgTotal(cp, q),
    mc: marginalCost(cp, q),
  }
}

/** 线性需求 P = a - bQ 下的利润最大化（MR = MC） */
export function profitMax(a: number, b: number, cp: CostParams) {
  const q = Math.max(0, (a - cp.v1) / (2 * b + 2 * cp.v2))
  const price = a - b * q
  const revenue = price * q
  const cost = totalCost(cp, q)
  return { qty: q, price, revenue, cost, profit: revenue - cost }
}

export function profitAt(cp: CostParams, price: number, qty: number) {
  const revenue = price * qty
  const cost = totalCost(cp, qty)
  return { revenue, cost, profit: revenue - cost }
}

export type StructureInput = { a: number; b: number; mc: number; fixed?: number }

/** 四种市场结构对比：同一需求、同一边际成本 */
export function marketStructures({ a, b, mc, fixed = 0 }: StructureInput) {
  const qc = (a - mc) / b
  const pc = mc
  const csComp = 0.5 * (a - pc) * qc

  const qm = (a - mc) / (2 * b)
  const pm = (a + mc) / 2
  const profitM = (pm - mc) * qm - fixed
  const csM = 0.5 * (a - pm) * qm
  const dwlM = 0.5 * (pm - mc) * (qc - qm)

  const qEach = (a - mc) / (3 * b)
  const qCournot = 2 * qEach
  const pCournot = a - b * qCournot
  const profitEach = (pCournot - mc) * qEach
  const csCournot = 0.5 * (a - pCournot) * qCournot
  const dwlCournot = 0.5 * (pCournot - mc) * (qc - qCournot)

  const f = fixed > 0 ? fixed : 100
  const qMonoComp = Math.sqrt(f / b)
  const pMonoComp = mc + Math.sqrt(f * b)
  const csMonoComp = 0.5 * Math.max(0, a - pMonoComp) * qMonoComp
  const dwlMonoComp = 0.5 * (pMonoComp - mc) * Math.max(0, qc - qMonoComp)

  return {
    competition: { price: pc, qty: qc, profit: 0, cs: csComp, dwl: 0, markup: 0 },
    monopoly: { price: pm, qty: qm, profit: profitM, cs: csM, dwl: dwlM, markup: pm - mc },
    cournot: {
      price: pCournot,
      qty: qCournot,
      profit: profitEach * 2,
      profitEach,
      cs: csCournot,
      dwl: dwlCournot,
      markup: pCournot - mc,
    },
    monopolistic: {
      price: pMonoComp,
      qty: qMonoComp,
      profit: 0,
      cs: csMonoComp,
      dwl: dwlMonoComp,
      markup: pMonoComp - mc,
    },
  }
}

export type ExternalityInput = { a: number; b: number; c: number; d: number; e: number }

/** 负外部性：需求 P=a-bQ，私人成本 MPC=c+dQ，边际外部成本 MEC=eQ */
export function externality({ a, b, c, d, e }: ExternalityInput) {
  const qm = (a - c) / (b + d)
  const pm = a - b * qm
  const qs = (a - c) / (b + d + e)
  const ps = a - b * qs
  const damageM = 0.5 * e * qm * qm
  const csM = 0.5 * (a - pm) * qm
  // 生产者剩余 = 价格以上的矩形减去私人成本曲线下的面积
  const psM = (pm - c) * qm - 0.5 * d * qm * qm
  const welfareM = csM + psM - damageM
  const damageS = 0.5 * e * qs * qs
  const csS = 0.5 * (a - ps) * qs
  const psS = (ps - c) * qs - 0.5 * d * qs * qs
  const welfareS = csS + psS - damageS
  // 无谓损失 = 社会边际成本与需求之间从 Qs 到 Qm 的三角形面积
  const dwl = 0.5 * (b + d + e) * Math.pow(qm - qs, 2)
  return {
    market: { qty: qm, price: pm, damage: damageM, welfare: welfareM },
    social: { qty: qs, price: ps, damage: damageS, welfare: welfareS },
    pigou: e * qs,
    dwl,
    gap: qm - qs,
  }
}

/** 生产可能性边界：x / xbar 与 y / ybar 的平方和为 1 的上半支 */
export const ppfY = (x: number, xbar: number, ybar: number) =>
  x >= xbar ? 0 : ybar * Math.sqrt(Math.max(0, 1 - (x * x) / (xbar * xbar)))

/** 复利式增长（用于「增长的力量」类例子） */
export const compound = (start: number, rate: number, years: number) =>
  start * Math.pow(1 + rate, years)
