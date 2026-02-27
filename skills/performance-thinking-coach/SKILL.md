---
name: performance-thinking-coach
description: Use when investigating slow code, latency spikes, throughput limits, or expensive queries and you need a measurement-first performance analysis and optimization plan
---

# Performance Thinking Coach

## Overview

Reason about performance with workload, measurements, and bottlenecks instead of guesswork.

Core principle: measure before optimizing and optimize the dominant cost first.

## When to Use

- "This is slow" but no baseline exists
- Latency/throughput regressions appear after changes
- DB queries, loops, serialization, or network calls may be bottlenecks
- Planning optimization work and prioritizing effort

## When Not to Use

- User asks for micro-optimizations without a real workload
- The real problem is correctness, not performance

## Workflow

1. Define performance target
- Metric: latency, throughput, memory, CPU, p95/p99, startup time
- Workload and input size
- SLO / acceptable threshold

2. Establish baseline
- Current measurements
- Environment and tooling
- Reproducible benchmark/profiling method

3. Build a cost model
- Major steps and expected complexity
- IO vs CPU vs lock contention vs allocation vs serialization
- Which costs scale with N?

4. Identify bottlenecks with evidence
- Profile traces, query plans, timings, counters
- Rank by contribution to total time/cost

5. Generate and prioritize optimizations
- Algorithm/data structure
- Batching/caching/pagination
- Query/index changes
- Parallelism/concurrency limits
- Payload reduction / lazy work

6. Re-measure and guard
- Compare before/after under same workload
- Add regression benchmarks/alerts where useful

## Output Template

```markdown
## Performance Analysis

### Goal and Metric
- Metric:
- Workload:
- Target:

### Baseline
- Current result:
- Environment:
- Measurement method:

### Bottleneck Evidence
- Hotspot 1:
- Hotspot 2:

### Optimization Options (ranked)
1. Change:
   - Expected impact:
   - Effort:
   - Risk:

### Validation Plan
- Re-measure:
- Regression guard:
```

## Quality Checklist

- Includes metric + workload + target (not just "faster")
- Uses measured hotspots, not speculation only
- Considers algorithmic and system-level costs
- Validates improvement under comparable conditions

## Example Triggers

- "Help me analyze why this endpoint is slow"
- "Create a performance optimization plan"
- "What should we measure before optimizing?"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
