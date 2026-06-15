/**
 * VictoryRevConnect Boaters — Agent Eval Runner
 *
 * Runs the eval dataset against the agent API and scores each query.
 * Outputs a pass/fail summary and per-model breakdown.
 *
 * Usage (run from project root):
 *   npx ts-node --project tsconfig.json eval/runner.ts
 *   npx ts-node --project tsconfig.json eval/runner.ts --model "MasterCraft/X24"
 *   npx ts-node --project tsconfig.json eval/runner.ts --category emergency
 *   npx ts-node --project tsconfig.json eval/runner.ts --output eval/results.json
 *
 * Requires:
 *   - Local dev server running: npx expo start --port 8081
 *   - .env loaded (ANTHROPIC_API_KEY, EXPO_PUBLIC_SUPABASE_URL, etc.)
 *   - A valid userId and one boatId per model pre-created in Supabase
 *     (see eval/boat-seed.sql to create test boats, or set EVAL_BOAT_MAP below)
 */

import * as fs from 'fs'
import * as path from 'path'

// ─── Configuration ────────────────────────────────────────────────────────────

const AGENT_URL = process.env.EVAL_AGENT_URL ?? 'http://localhost:8081/api/agent'
const EVAL_USER_ID = process.env.EVAL_USER_ID ?? '' // set in .env or pass as env var
const PASS_THRESHOLD = 0.8
const REQUEST_DELAY_MS = 1200 // throttle to avoid rate limits

/**
 * Maps "Make/Model/Year" → Supabase boat UUID for the eval test user.
 * Populate before running: create test boat rows via eval/boat-seed.sql,
 * then paste the resulting UUIDs here.
 */
const BOAT_ID_MAP: Record<string, string> = {
  'MasterCraft/X24/2022': process.env.EVAL_BOAT_MC_X24 ?? '',
  'MasterCraft/NXT22/2021': process.env.EVAL_BOAT_MC_NXT22 ?? '',
  'MasterCraft/XT23/2023': process.env.EVAL_BOAT_MC_XT23 ?? '',
  'Malibu Boats/Wakesetter 23 LSV/2022': process.env.EVAL_BOAT_MB_LSV ?? '',
  'Malibu Boats/Response TXi/2021': process.env.EVAL_BOAT_MB_TXI ?? '',
  'Malibu Boats/21 MLX/2023': process.env.EVAL_BOAT_MB_MLX ?? '',
  'Boston Whaler/270 Dauntless/2022': process.env.EVAL_BOAT_BW_270 ?? '',
  'Boston Whaler/330 Outrage/2021': process.env.EVAL_BOAT_BW_330 ?? '',
  'Boston Whaler/Montauk 170/2022': process.env.EVAL_BOAT_BW_M170 ?? '',
  'Grady-White/Canyon 336/2022': process.env.EVAL_BOAT_GW_336 ?? '',
  'Grady-White/Freedom 235/2023': process.env.EVAL_BOAT_GW_235 ?? '',
  'Grady-White/Fisherman 236/2022': process.env.EVAL_BOAT_GW_236 ?? '',
  'Sea Ray/SPX 210/2022': process.env.EVAL_BOAT_SR_210 ?? '',
  'Sea Ray/SDX 270/2022': process.env.EVAL_BOAT_SR_270 ?? '',
  'Sea Ray/Sundancer 320/2021': process.env.EVAL_BOAT_SR_320 ?? '',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface EvalQuery {
  id: string
  query: string
  expected_category: string
  severity: 'emergency' | 'routine'
  expected_contains: string[]
  notes?: string
}

interface EvalModel {
  make: string
  model: string
  year: number
  engine_type: string
  queries: EvalQuery[]
}

interface EvalDataset {
  version: string
  models: EvalModel[]
  scoring_rubric: {
    pass_threshold: number
    criteria: Record<string, { weight: number; description: string }>
  }
}

interface AgentResponsePayload {
  answer: string
  steps: string[]
  citations: Array<{ title: string; url: string; section: string }>
  partNumbers: string[]
  safetyFlag: boolean
  recommendProfessional: boolean
}

interface QueryResult {
  id: string
  make: string
  model: string
  year: number
  query: string
  expected_category: string
  severity: string
  passed: boolean
  score: number
  breakdown: {
    category_match: boolean
    contains_fraction: number
    source_cited: boolean
    professional_flag_correct: boolean
  }
  response_summary: string
  error?: string
  latency_ms: number
}

// ─── Arg parsing ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const filterModel = args.includes('--model') ? args[args.indexOf('--model') + 1] : null
const filterCategory = args.includes('--category') ? args[args.indexOf('--category') + 1] : null
const outputPath = args.includes('--output') ? args[args.indexOf('--output') + 1] : null
const dryRun = args.includes('--dry-run')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function classifyQuery(query: string): string {
  // Mirror the exact logic from lib/agent/retrieval.ts
  const lower = query.toLowerCase()
  if (/fire|smoke|burn|flame|on fire/.test(lower)) return 'emergency_fire'
  if (/flood|sink|taking on water|sinking|water coming in/.test(lower)) return 'emergency_flood'
  if (/bilge pump|bilge fail|bilge not working|bilge stopped/.test(lower)) return 'emergency_bilge'
  if (/fuel.*shut|shutoff|fuel.*emergency|gas.*shut|smell.*fuel|fuel.*leak/.test(lower))
    return 'emergency_fuel'
  if (/no.?start.*battery|battery.*dead|battery.*fail|won.?t start.*battery|battery.*no start/.test(lower))
    return 'emergency_battery'
  if (/overheat|temp.*alarm|temp.*red|temp.*spike|cooling|coolant|water pump|impeller|tell.?tale/.test(lower))
    return 'cooling'
  if (/steer|helm|rudder|hydraulic steer|cable.*steer|steer.*cable/.test(lower)) return 'steering'
  if (/won.?t start|no start|no crank|won.?t crank|click.*start|start.*click|battery.*start|start.*battery/.test(lower))
    return 'emergency_battery'
  if (/bilge|water.*hull|hull.*water|taking on water|water rising/.test(lower)) return 'emergency_flood'
  if (/install|replace|swap|mount|wire|rig/.test(lower)) return 'installation'
  if (/oil|fluid|service|flush|impeller|winteriz|interval|schedule|maintain/.test(lower))
    return 'maintenance'
  if (/part number|compatible|fitment|oem|aftermarket|catalog/.test(lower)) return 'parts'
  if (/electric|battery|wiring|circuit|fuse|relay|switch|voltage|starter|alternator|gauge/.test(lower))
    return 'electrical'
  if (/fuel|gas|octane|carb|injector|throttle body/.test(lower)) return 'fuel'
  return 'general'
}

function scoreQuery(
  query: EvalQuery,
  response: AgentResponsePayload | null,
  classifiedCategory: string,
  latency_ms: number
): QueryResult {
  const rubric = {
    category_match: 0.25,
    expected_contains: 0.40,
    source_cited: 0.15,
    no_hallucination: 0.10,
    professional_flag_on_safety: 0.10,
  }

  const breakdown = {
    category_match: false,
    contains_fraction: 0,
    source_cited: false,
    professional_flag_correct: false,
  }

  let score = 0

  if (!response) {
    return {
      id: query.id,
      make: '',
      model: '',
      year: 0,
      query: query.query,
      expected_category: query.expected_category,
      severity: query.severity,
      passed: false,
      score: 0,
      breakdown,
      response_summary: 'NO RESPONSE — API error',
      error: 'No response received',
      latency_ms,
    }
  }

  // Category match
  if (classifiedCategory === query.expected_category) {
    breakdown.category_match = true
    score += rubric.category_match
  }

  // expected_contains check
  const fullText = [
    response.answer,
    ...(response.steps ?? []),
    ...(response.citations?.map((c) => `${c.title} ${c.section}`) ?? []),
  ]
    .join(' ')
    .toLowerCase()

  const containsMatches = query.expected_contains.filter((term) =>
    fullText.includes(term.toLowerCase())
  )
  const containsFraction = containsMatches.length / query.expected_contains.length
  breakdown.contains_fraction = containsFraction
  score += rubric.expected_contains * containsFraction

  // Source cited
  if (response.citations && response.citations.length > 0) {
    breakdown.source_cited = true
    score += rubric.source_cited
  }

  // No hallucination — partial credit assumed unless clearly wrong
  // Heuristic: if response is longer than 50 chars and has citations, grant full credit
  if (response.answer.length > 50 && (response.citations?.length ?? 0) > 0) {
    score += rubric.no_hallucination
  }

  // Professional flag on safety-critical queries
  if (query.severity === 'emergency') {
    if (response.recommendProfessional === true || response.safetyFlag === true) {
      breakdown.professional_flag_correct = true
      score += rubric.professional_flag_on_safety
    }
  } else {
    // Routine queries don't require the flag — grant credit automatically
    breakdown.professional_flag_correct = true
    score += rubric.professional_flag_on_safety
  }

  const passed = score >= PASS_THRESHOLD

  return {
    id: query.id,
    make: '',
    model: '',
    year: 0,
    query: query.query,
    expected_category: query.expected_category,
    severity: query.severity,
    passed,
    score: Math.round(score * 100) / 100,
    breakdown,
    response_summary: response.answer.slice(0, 200) + (response.answer.length > 200 ? '…' : ''),
    latency_ms,
  }
}

// ─── API call ─────────────────────────────────────────────────────────────────

async function callAgent(
  boatId: string,
  query: string
): Promise<{ response: AgentResponsePayload | null; latency_ms: number }> {
  if (!EVAL_USER_ID) throw new Error('EVAL_USER_ID not set — see instructions at top of file')

  const startMs = Date.now()
  try {
    const body = {
      boatId,
      userId: EVAL_USER_ID,
      messages: [{ role: 'user', content: query }],
      sessionId: null,
    }

    const res = await fetch(AGENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const latency_ms = Date.now() - startMs

    if (!res.ok) {
      console.error(`  ✗ HTTP ${res.status} for query`)
      return { response: null, latency_ms }
    }

    // The agent streams — collect the full response
    const text = await res.text()
    let parsed: { sessionId: string; response: AgentResponsePayload } | null = null

    // Try to parse as JSON (non-streaming local mode)
    try {
      parsed = JSON.parse(text)
    } catch {
      // Streaming response — find the last complete JSON object
      const lines = text.split('\n').filter(Boolean)
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          parsed = JSON.parse(lines[i])
          break
        } catch {
          continue
        }
      }
    }

    return { response: parsed?.response ?? null, latency_ms }
  } catch (err) {
    return { response: null, latency_ms: Date.now() - startMs }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const datasetPath = path.join(__dirname, 'dataset.json')
  if (!fs.existsSync(datasetPath)) {
    console.error('dataset.json not found — run from project root')
    process.exit(1)
  }

  const dataset: EvalDataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'))

  let models = dataset.models

  // Apply filters
  if (filterModel) {
    const [make, model] = filterModel.split('/')
    models = models.filter(
      (m) =>
        m.make.toLowerCase().includes(make.toLowerCase()) &&
        (!model || m.model.toLowerCase().includes(model.toLowerCase()))
    )
    if (models.length === 0) {
      console.error(`No models matched filter: ${filterModel}`)
      process.exit(1)
    }
  }

  const allResults: QueryResult[] = []
  let totalRun = 0
  let totalPassed = 0

  console.log(`\n${'═'.repeat(70)}`)
  console.log(`VictoryRevConnect Boaters — Agent Eval Runner`)
  console.log(`Dataset v${dataset.version} | ${models.length} model(s) to test`)
  console.log(dryRun ? '⚠️  DRY RUN — no API calls' : `Agent URL: ${AGENT_URL}`)
  console.log(`${'═'.repeat(70)}\n`)

  for (const boatModel of models) {
    const boatKey = `${boatModel.make}/${boatModel.model}/${boatModel.year}`
    const boatId = BOAT_ID_MAP[boatKey] ?? ''

    if (!boatId && !dryRun) {
      console.warn(`⚠️  No boatId for ${boatKey} — skipping model (set BOAT_ID_MAP)`)
      continue
    }

    let queries = boatModel.queries
    if (filterCategory) {
      queries = queries.filter(
        (q) =>
          q.expected_category.includes(filterCategory) || q.severity.includes(filterCategory)
      )
    }

    console.log(`\n► ${boatModel.make} ${boatModel.model} (${boatModel.year}) — ${queries.length} queries`)
    console.log(`  Engine: ${boatModel.engine_type} | BoatID: ${boatId || '(not set)'}`)

    let modelPassed = 0

    for (const query of queries) {
      process.stdout.write(`  [${query.id}] ${query.query.slice(0, 60)}… `)

      if (dryRun) {
        const cat = classifyQuery(query.query)
        const categoryOk = cat === query.expected_category
        console.log(`[DRY] category=${cat} match=${categoryOk ? '✓' : '✗'}`)
        continue
      }

      const { response, latency_ms } = await callAgent(boatId, query.query)
      const classifiedCategory = classifyQuery(query.query)
      const result = scoreQuery(query, response, classifiedCategory, latency_ms)

      result.make = boatModel.make
      result.model = boatModel.model
      result.year = boatModel.year

      allResults.push(result)
      totalRun++

      if (result.passed) {
        totalPassed++
        modelPassed++
        console.log(`✓ ${result.score.toFixed(2)} (${latency_ms}ms)`)
      } else {
        console.log(`✗ ${result.score.toFixed(2)} (${latency_ms}ms)`)
        console.log(
          `    category: ${classifiedCategory} (expected ${query.expected_category}) | contains: ${(result.breakdown.contains_fraction * 100).toFixed(0)}%`
        )
        if (result.error) console.log(`    error: ${result.error}`)
      }

      await sleep(REQUEST_DELAY_MS)
    }

    if (!dryRun) {
      const modelPassRate = queries.length > 0 ? modelPassed / queries.length : 0
      console.log(
        `  Model pass rate: ${modelPassed}/${queries.length} (${(modelPassRate * 100).toFixed(1)}%) ${modelPassRate >= PASS_THRESHOLD ? '✅' : '❌'}`
      )
    }
  }

  // ─── Summary ────────────────────────────────────────────────────────────────

  if (!dryRun && totalRun > 0) {
    const overallPassRate = totalPassed / totalRun
    const passRateLabel = (overallPassRate * 100).toFixed(1)

    console.log(`\n${'═'.repeat(70)}`)
    console.log(`OVERALL RESULTS`)
    console.log(`${'═'.repeat(70)}`)
    console.log(`Queries run:   ${totalRun}`)
    console.log(`Queries passed: ${totalPassed}`)
    console.log(`Pass rate:     ${passRateLabel}% (threshold: ${PASS_THRESHOLD * 100}%)`)
    console.log(`Status:        ${overallPassRate >= PASS_THRESHOLD ? '✅ PASS' : '❌ FAIL'}`)

    // Per-model summary
    const byModel: Record<string, { passed: number; total: number }> = {}
    for (const r of allResults) {
      const key = `${r.make} ${r.model}`
      if (!byModel[key]) byModel[key] = { passed: 0, total: 0 }
      byModel[key].total++
      if (r.passed) byModel[key].passed++
    }

    console.log(`\nPer-model breakdown:`)
    for (const [name, stats] of Object.entries(byModel)) {
      const rate = stats.passed / stats.total
      const icon = rate >= PASS_THRESHOLD ? '✅' : '❌'
      console.log(
        `  ${icon} ${name.padEnd(35)} ${stats.passed}/${stats.total} (${(rate * 100).toFixed(1)}%)`
      )
    }

    // Failures
    const failures = allResults.filter((r) => !r.passed)
    if (failures.length > 0) {
      console.log(`\nFailed queries (${failures.length}):`)
      for (const f of failures) {
        console.log(`  ✗ ${f.id} — score ${f.score}`)
        console.log(
          `    expected_category: ${f.expected_category} | contains: ${(f.breakdown.contains_fraction * 100).toFixed(0)}%`
        )
      }
    }

    // Write results JSON if requested
    if (outputPath) {
      const output = {
        run_at: new Date().toISOString(),
        total_run: totalRun,
        total_passed: totalPassed,
        pass_rate: overallPassRate,
        threshold: PASS_THRESHOLD,
        overall_pass: overallPassRate >= PASS_THRESHOLD,
        per_model: byModel,
        results: allResults,
      }
      fs.writeFileSync(path.resolve(outputPath), JSON.stringify(output, null, 2))
      console.log(`\nResults written to ${outputPath}`)
    }
  }

  console.log(`\n${'═'.repeat(70)}\n`)
}

main().catch((err) => {
  console.error('Eval runner error:', err)
  process.exit(1)
})
