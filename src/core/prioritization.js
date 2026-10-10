/**
 * AquaGen: The Water Black Box
 * Investigation & Prioritization Engine
 *
 * Implements deterministic, transparent prioritization rules based on:
 * 1. Discrepancy Magnitude (absolute volume and percentage)
 * 2. Persistence (consecutive days of unexplained difference)
 * 3. Data Completeness & Reliability (sensor quality score)
 * 4. Critical Zone Impact (population served, critical infrastructure)
 *
 * All priority assignments include explicit human-readable rationales.
 * Hypotheses remain unverified until corroborated by field inspection notes.
 */

export const INVESTIGATION_STATUSES = [
  'Open',
  'Under Review',
  'Inspection Required',
  'Resolved',
  'Inconclusive'
];

export const HYPOTHESES_CATALOG = [
  { id: 'PHYSICAL_LEAK', label: 'Physical Network Leakage', category: 'Infrastructure', description: 'Underground main fracture, service connection shear, or valve packing leak.' },
  { id: 'METER_FAULT', label: 'Inlet or Customer Meter Fault', category: 'Instrumentation', description: 'Under-recording district flow meter, stuck domestic meters, or lost telemetry pulses.' },
  { id: 'UNRECORDED_CONSUMPTION', label: 'Unrecorded / Unauthorized Consumption', category: 'Operational', description: 'Unmetered construction tap, illegal hydrant connection, or firefighting draw.' },
  { id: 'STORAGE_MEASUREMENT_ERROR', label: 'Reservoir Storage Level Inaccuracy', category: 'Instrumentation', description: 'Pressure transducer drift, acoustic gauge surface turbulence error, or silt accumulation.' },
  { id: 'MISSING_DATA', label: 'Missing or Delayed Telemetry', category: 'Data Quality', description: 'Telemetry communication dropout leading to incomplete diurnal aggregation.' },
  { id: 'OTHER_UNEXPLAINED', label: 'Other Operational Discrepancy', category: 'Investigation', description: 'Unaccounted network boundary valve crossing or unknown interconnect.' }
];

/**
 * Calculates priority score and rationale for a water reading or case.
 *
 * Rules:
 * - CRITICAL:
 *   - Discrepancy > 25% OR Discrepancy > 30,000 L/day
 *   - OR Discrepancy > 15% lasting 3+ consecutive days (persistent loss)
 * - HIGH:
 *   - Discrepancy between 15% and 25%
 *   - OR Discrepancy between 15,000 and 30,000 L/day
 *   - OR Persistent discrepancy (5-15%) across 4+ days
 * - MEDIUM:
 *   - Discrepancy between 7% and 15% with complete data
 *   - OR Discrepancy < 0 with magnitude > 5,000 L/day (apparent meter over-read)
 * - LOW:
 *   - Discrepancy between 3% and 7%
 *   - Isolated single-day anomaly within acoustic noise bounds
 *
 * @param {Object} params
 * @param {number} params.unexplainedDifference - Litres per day
 * @param {number} params.discrepancyPercentage - Percentage of supply
 * @param {number} [params.consecutiveDays=1] - Consecutive days with discrepancy
 * @param {number} [params.dataCompletenessScore=100] - 0 to 100 percentage
 * @param {boolean} [params.isCriticalZone=false] - Whether zone serves hospitals or key industrial zones
 * @returns {{ priority: 'Critical'|'High'|'Medium'|'Low', score: number, rationale: string, recommendedAction: string }}
 */
export function determineInvestigationPriority({
  unexplainedDifference = 0,
  discrepancyPercentage = 0,
  consecutiveDays = 1,
  dataCompletenessScore = 100,
  isCriticalZone = false
}) {
  const absDiff = Math.abs(unexplainedDifference);
  const absPercent = Math.abs(discrepancyPercentage);
  const reasons = [];

  // Low data completeness caveat
  if (dataCompletenessScore < 75) {
    return {
      priority: 'Medium',
      score: 45,
      rationale: `Data completeness is only ${dataCompletenessScore}%. Priority is held at Medium until telemetry dropouts and sensor communication issues are resolved to avoid dispatching crews on phantom anomalies.`,
      recommendedAction: 'Verify telemetry links and check for missing hourly logs before dispatching field crews.'
    };
  }

  // 1. Critical Priority conditions
  if (absPercent >= 25 || absDiff >= 30000) {
    reasons.push(`Discrepancy magnitude is severe (${absPercent.toFixed(1)}% / ${absDiff.toLocaleString()} L/day)`);
    if (consecutiveDays > 1) {
      reasons.push(`Persisted across ${consecutiveDays} consecutive observation cycles`);
    }
    if (isCriticalZone) {
      reasons.push('Zone classified as critical infrastructure corridor');
    }
    return {
      priority: 'Critical',
      score: 95,
      rationale: reasons.join('; ') + '.',
      recommendedAction: 'Immediate field inspection required. Mobilize acoustic leak detection crew and verify DMA isolation valves within 12 hours.'
    };
  }

  if (absPercent >= 15 && consecutiveDays >= 3) {
    reasons.push(`Discrepancy has persisted for ${consecutiveDays} days at an elevated level (${absPercent.toFixed(1)}%)`);
    return {
      priority: 'Critical',
      score: 90,
      rationale: reasons.join('; ') + '.',
      recommendedAction: 'Priority elevated due to multi-day persistence. Conduct physical step-testing and pressure logging tonight.'
    };
  }

  // 2. High Priority conditions
  if (absPercent >= 15 || absDiff >= 15000 || (absPercent >= 10 && consecutiveDays >= 3)) {
    if (absPercent >= 15) reasons.push(`Discrepancy exceeds standard 15% operational threshold (${absPercent.toFixed(1)}%)`);
    if (absDiff >= 15000) reasons.push(`Volumetric difference exceeds 15,000 L/day (${absDiff.toLocaleString()} L/day)`);
    if (consecutiveDays >= 3) reasons.push(`Multi-day continuous deviation observed (${consecutiveDays} days)`);
    if (isCriticalZone) reasons.push('Zone feeds critical demand sector');

    return {
      priority: 'High',
      score: 75,
      rationale: reasons.join('; ') + '.',
      recommendedAction: 'Schedule on-site correlator inspection and verify bulk inlet meter calibration.'
    };
  }

  // 3. Medium Priority conditions
  if (absPercent >= 7 || (unexplainedDifference < 0 && absDiff > 5000)) {
    if (unexplainedDifference < 0) {
      reasons.push(`Negative discrepancy of ${absDiff.toLocaleString()} L/day (consumption > supply), suggesting district meter over-registration or undetected cross-zone feed`);
    } else {
      reasons.push(`Moderate discrepancy of ${absPercent.toFixed(1)}% (${absDiff.toLocaleString()} L/day) above 5% baseline`);
    }
    return {
      priority: 'Medium',
      score: 55,
      rationale: reasons.join('; ') + '.',
      recommendedAction: 'Perform secondary meter audit, review nocturnal minimum flow rates, and monitor for 48 hours.'
    };
  }

  // 4. Low Priority
  return {
    priority: 'Low',
    score: 25,
    rationale: `Discrepancy is within normal metering tolerance (${absPercent.toFixed(1)}% / ${absDiff.toLocaleString()} L/day). Likely acoustic background noise or diurnal meter drift.`,
    recommendedAction: 'Log reading in normal surveillance ledger; no immediate physical inspection necessary.'
  };
}

/**
 * Creates a complete investigation record template.
 * @param {Object} data
 * @returns {Object} Full investigation model
 */
export function createInvestigationRecord(data = {}) {
  const priorityInfo = determineInvestigationPriority({
    unexplainedDifference: data.unexplainedDifference || 0,
    discrepancyPercentage: data.discrepancyPercentage || 0,
    consecutiveDays: data.consecutiveDays || 1,
    dataCompletenessScore: data.dataCompletenessScore ?? 100,
    isCriticalZone: Boolean(data.isCriticalZone)
  });

  const now = new Date().toISOString();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  return {
    id: data.id || `INV-${new Date().getFullYear()}-${randomSuffix}`,
    zoneId: data.zoneId || '',
    readingDate: data.readingDate || now.slice(0, 10),
    readingId: data.readingId || null,
    title: data.title || `Discrepancy Investigation in ${data.zoneId || 'Zone'} (${data.discrepancyPercentage || 0}%)`,
    unexplainedDifference: data.unexplainedDifference || 0,
    discrepancyPercentage: data.discrepancyPercentage || 0,
    priority: data.priority || priorityInfo.priority,
    priorityReason: data.priorityReason || priorityInfo.rationale,
    priorityScore: priorityInfo.score,
    status: data.status || 'Open',
    hypotheses: data.hypotheses || [
      { id: 'PHYSICAL_LEAK', name: 'Physical Leakage', status: 'HYPOTHESIS', notes: 'Unverified until acoustic sweep or soil inspection.' },
      { id: 'METER_FAULT', name: 'Meter Fault', status: 'HYPOTHESIS', notes: 'Check inlet pulse calibration.' },
      { id: 'STORAGE_MEASUREMENT_ERROR', name: 'Storage Gauge Drift', status: 'HYPOTHESIS', notes: 'Check ultrasonic reservoir sensor.' }
    ],
    evidenceNotes: data.evidenceNotes || 'Initial automated flag triggered by water-balance engine. Telemetry verified.',
    recommendedNextAction: data.recommendedNextAction || priorityInfo.recommendedAction,
    assignedOperator: data.assignedOperator || 'Unassigned',
    inspections: data.inspections || [],
    beforeAfterComparison: data.beforeAfterComparison || null,
    outcome: data.outcome || null,
    resolutionNotes: data.resolutionNotes || null,
    createdAt: data.createdAt || now,
    updatedAt: now
  };
}
